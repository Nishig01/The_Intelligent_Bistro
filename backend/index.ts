import dotenv from "dotenv";
import path from "path";

// Load environment variables before importing other modules
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "node:child_process";
import { menuData } from "../frontend/data/menu";
import { handleAIOrder } from "../ai/agent";
import { getGoogleAuthUrl, handleGoogleCallback } from "./auth";
import { sendOrderConfirmation, sendDeliveryEmail } from "./orders";

async function startServer() {
  const app = express();
  const PORT = 3000;
  console.log("Starting server in", process.env.NODE_ENV || "development", "mode");
  console.log("GEMINI_API_KEY status:", process.env.GEMINI_API_KEY ? `Loaded successfully (starts with ${process.env.GEMINI_API_KEY.substring(0, 6)}...)` : "Missing");

  app.use(express.json());

  // Standard CORS headers for development support on port 8081
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/menu", (req, res) => {
    res.json(menuData);
  });

  app.post("/api/ai/order", async (req, res) => {
    const { message = "", currentCart = [], orderHistory = [] } = req.body;
    try {
      const result = await handleAIOrder(message, currentCart, orderHistory, menuData);
      res.json(result);
    } catch (e: any) {
      console.error("AI Order Error:", e);
      res.status(500).json({ error: e.message || "Failed to process AI order response from Gemini." });
    }
  });

  app.get("/api/auth/google/url", (req, res) => {
    let host = req.get("host") || "localhost:3000";
    
    // Self-healing: If host is a raw local subnet IP, rewrite to nip.io wildcard public domain
    const ipRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;
    const match = host.match(ipRegex);
    if (match) {
      host = `${match[1]}.nip.io${match[2] || ""}`;
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const backendCallbackUri = `${protocol}://${host}/auth/google/callback`;
    const mobileAppSchemeUrl = req.query.redirectUri as string || "";
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      redirect_uri: backendCallbackUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state: mobileAppSchemeUrl
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      let host = req.get("host") || "localhost:3000";
      
      // Self-healing: Match original authorize request redirect_uri hostname
      const ipRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;
      const match = host.match(ipRegex);
      if (match) {
        host = `${match[1]}.nip.io${match[2] || ""}`;
      }

      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const backendCallbackUri = `${protocol}://${host}/auth/google/callback`;
      
      const { accessToken, user } = await handleGoogleCallback(code as string, state as string, backendCallbackUri);
      
      const redirectTarget = state as string || "";
      if (redirectTarget && (redirectTarget.startsWith("exp://") || redirectTarget.startsWith("intellibistro://"))) {
        const separator = redirectTarget.includes("?") ? "&" : "?";
        const targetUrl = `${redirectTarget}${separator}token=${accessToken}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || "")}`;
        return res.redirect(targetUrl);
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_SUCCESS',
                  token: '${accessToken}',
                  user: ${JSON.stringify(user)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      res.status(500).send(`Error: ${err.message}`);
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const previewUrl = await sendOrderConfirmation(req.body);
      res.status(200).json({ success: true, orderId: req.body.orderId, previewUrl });
    } catch (error) {
      res.status(200).json({ success: true, warning: 'Email failed to send' });
    }
  });

  app.post("/api/orders/delivery", async (req, res) => {
    try {
      const previewUrl = await sendDeliveryEmail(req.body);
      res.status(200).json({ success: true, orderId: req.body.orderId, previewUrl });
    } catch (error) {
      console.error("Delivery email error:", error);
      res.status(200).json({ success: true, warning: 'Delivery email failed to send' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Expo Metro server...");
    const metro = spawn("npx", ["expo", "start", "--web", "--port", "8081", "--non-interactive"], {
      stdio: "inherit",
      shell: true,
      env: { 
        ...process.env, 
        EXPO_NO_DEV_TOOLS: "1",
        EXPO_NO_DEVTOOLS: "1", 
        EXPO_DEVTOOLS: "false",
        REACT_DEBUGGER: "echo",
        TERM: "dumb", 
        CI: "true", 
        NO_UPDATE_CHECK: "1",
        EXPO_NO_TELEMETRY: "1",
        REACT_NATIVE_PACKAGER_HOSTNAME: "127.0.0.1"
      }
    });

    app.use(
      createProxyMiddleware({
        target: "http://localhost:8081",
        changeOrigin: true,
        ws: true,
        pathFilter: (pathname) => !pathname.startsWith("/api") && !pathname.startsWith("/auth"),
      })
    );
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
