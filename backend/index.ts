import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "node:child_process";
import { menuData } from "../frontend/data/menu";
import { handleAIOrder } from "../ai/agent";
import { getGoogleAuthUrl, handleGoogleCallback } from "./auth";
import { sendOrderConfirmation } from "./orders";

async function startServer() {
  const app = express();
  const PORT = 3000;
  console.log("Starting server in", process.env.NODE_ENV || "development", "mode");

  app.use(express.json());

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
      
      // Fallback logic
      const lowerMsg = message.toLowerCase();
      let fallbackMessage = "I have updated your order. Anything else you desire?";
      let fallbackActions: any[] = [];
      let fallbackSuggestions: string[] = ["View Cart", "Add Truffle Fries"];
      
      if (lowerMsg.includes("wagyu") || lowerMsg.includes("burger")) {
        fallbackMessage = "A magnificent choice. I've added the Truffle Wagyu Burger for you.";
        fallbackActions = [{ type: "add", itemId: "wagyu_burger", quantity: 1 }];
      } else if (lowerMsg.includes("fries")) {
        fallbackActions = [{ type: "add", itemId: "truffle_fries", quantity: 1 }];
      } else if (lowerMsg.includes("clear")) {
        fallbackActions = [{ type: "clear" }];
      }

      res.json({
        message: fallbackMessage,
        actions: fallbackActions,
        suggestions: fallbackSuggestions
      });
    }
  });

  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = req.query.redirectUri as string || "http://localhost:3000/auth/google/callback";
    res.json({ url: getGoogleAuthUrl(redirectUri) });
  });

  app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const { accessToken, user } = await handleGoogleCallback(code as string, state as string);
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
