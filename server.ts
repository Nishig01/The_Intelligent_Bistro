import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { menuData } from "./src/data/menu";
import nodemailer from "nodemailer";

// Use lazy initialization or check existence to prevent crashes
let ai: GoogleGenAI | null = null;
function getAIClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. AI features will fail.");
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy",
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      const aiClient = getAIClient();
      
      const systemInstruction = `You are an AI concierge for a premium restaurant app called The Intelligent Bistro.

Your job:
1. Understand food ordering requests naturally
2. Match user requests to menu items intelligently
3. NEVER ask the user to rephrase unless absolutely impossible
4. Handle partial matches and fuzzy matching
5. Sound elegant, warm, and premium
6. Always respond with valid JSON only
7. If the user asks about their latest order, what they usually order, or past orders, look at the order history.
8. If the user asks to "reorder my last meal", dynamically add the items from their most recent order to the cart. Provide a polite conversational response describing what you added.
9. If the user asks a general knowledge question (like a recipe or fact), provide a concise 1-2 sentence informative response, but then delightfully gracefully redirect the conversation back to their order or our menu offerings.

MENU:
${JSON.stringify(menuData.map(m => ({id: m.id, name: m.name, options: m.options, dietary: m.dietary})))}
Current cart state: ${JSON.stringify(currentCart)}
Order history: ${JSON.stringify(orderHistory.map((o: any) => ({items: o.items, date: o.date})))}

RULES:
- If user says "burger", intelligently match nearest burger item ("wagyu_burger")
- If user says "water", match best water item
- Infer quantity if omitted, default to 1
- Be conversational, confident, and delightfully helpful
- Suggest pairings if appropriate.

VALID ACTIONS:
- add
- remove
- update
- clear

JSON FORMAT MUST ALWAYS BE EXCACTLY:
{
  "message": "Elegant conversational response",
  "actions": [
    {
      "type": "add",
      "itemId": "wagyu_burger",
      "quantity": 1
    }
  ],
  "suggestions": [
    "Add truffle fries?",
    "Pair with sparkling water?"
  ]
}
`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING, description: "Elegant conversational response." },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    itemId: { type: Type.STRING },
                    quantity: { type: Type.INTEGER },
                    modifiers: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["type"]
                }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Short follow-up suggestions for the user."
              }
            },
            required: ["message", "actions"]
          }
        }
      });
      
      const responseText = response.text;
      if (!responseText) throw new Error("No response from Gemini.");

      res.json(JSON.parse(responseText.trim()));
    } catch (e: any) {
      console.error("AI Order Error:", e);
      
      console.warn("Falling back to local NLP parser due to AI error:", e.message || e);
      
      const lowerMsg = message.toLowerCase();
      let fallbackMessage = "I have updated your order. Anything else you desire?";
      let fallbackActions: any[] = [];
      let fallbackSuggestions: string[] = ["View Cart", "Add Truffle Fries"];
      
      // Basic local NLP fallback matching
      if (lowerMsg.includes("wagyu") || lowerMsg.includes("burger")) {
        fallbackMessage = "A magnificent choice. I've added the Truffle Wagyu Burger for you.";
        fallbackActions = [{ type: "add", itemId: "wagyu_burger", quantity: 1 }];
        fallbackSuggestions = ["Add Parmesan Truffle Fries", "Sparkling Water"];
      } else if (lowerMsg.includes("truffle fries") || lowerMsg.includes("fries")) {
        fallbackMessage = "Excellent. The Parmesan Truffle Pommes Frites have been added.";
        fallbackActions = [{ type: "add", itemId: "truffle_fries", quantity: 1 }];
      } else if (lowerMsg.includes("vegan") || lowerMsg.includes("vegetarian") || lowerMsg.includes("mushroom") || lowerMsg.includes("risotto")) {
         fallbackMessage = "I highly recommend our Wild Mushroom Risotto. I have added it to your order.";
         fallbackActions = [{ type: "add", itemId: "wild_mushroom_risotto", quantity: 1 }];
      } else if (lowerMsg.includes("remove") || lowerMsg.includes("cancel") || lowerMsg.includes("clear")) {
        fallbackMessage = "I have cleared those items from your order.";
        fallbackActions = [{ type: "clear" }];
      } else {
        fallbackMessage = "I apologize, but I am momentarily experiencing high volume. Please feel free to add items directly from the menu below.";
      }

      res.json({
        message: fallbackMessage,
        actions: fallbackActions,
        suggestions: fallbackSuggestions
      });
    }
  });

  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = req.query.redirectUri || "http://localhost:3000/auth/google/callback";
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      redirect_uri: redirectUri as string,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state: redirectUri as string
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
      return res.send(`
        <html><body><p>Authentication failed: No code provided.</p></body></html>
      `);
    }

    try {
      const redirectUri = (state as string) || `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`;

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error("Token exchange failed:", tokenData);
        throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed");
      }

      // We have the id_token, we can decode it to get the user profile
      const idToken = tokenData.id_token;
      
      // In a production app, verify the token signature using google-auth-library.
      // For this MVP, we parse the JWT payload directly:
      const payloadBase64 = idToken.split('.')[1];
      const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const userProfile = JSON.parse(decodedPayload);

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_SUCCESS',
                  token: '${tokenData.access_token}',
                  user: {
                    name: '${userProfile.name?.replace(/'/g, "\\'") || ''}',
                    email: '${userProfile.email?.replace(/'/g, "\\'") || ''}',
                    avatar: '${userProfile.picture || ''}'
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="font-family: sans-serif; display: flex; height: 100vh; justify-content: center; align-items: center; background: #fafafa; color: #333;">
              <p>Authentication successful! Returning to The Bistro...</p>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("OAuth Callback Error:", err);
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fff;">
            <h3>Google Login Error</h3>
            <p style="color: red; max-width: 400px; text-align: center;">${err.message}</p>
            <p style="color: #666; font-size: 14px; max-width: 500px; text-align: center; margin-top: 20px;">
              Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET map correctly to this environment.
            </p>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  app.post("/api/orders", express.json(), async (req, res) => {
    try {
      const { orderId, items, total, customerName, email } = req.body;

      // In production, configure with actual SMTP credentials (e.g., Resend, Sendgrid)
      // We use Ethereal for testing so it doesn't fail if creds are missing
      const testAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user, 
          pass: testAccount.pass, 
        },
      });

      const emailHtml = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
          <div style="text-align: center; padding: 30px 0; border-bottom: 1px solid #eee;">
            <h1 style="margin: 0; font-size: 28px; font-weight: normal;">The Bistro ✨</h1>
            <p style="color: #666; margin-top: 10px; font-family: sans-serif;">Order Confirmation</p>
          </div>
          <div style="padding: 30px 0;">
            <p style="font-family: sans-serif; font-size: 16px;">Dear ${customerName || 'Valued Guest'},</p>
            <p style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              Thanks for dining with The Intelligent Bistro. Your order <strong>#${orderId}</strong> is being prepared by our chefs.
            </p>
            <div style="background: #fafafa; padding: 20px; border-radius: 12px; margin: 30px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              ${items.map((item: any) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-family: sans-serif;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div style="border-top: 1px solid #ddd; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; font-family: sans-serif;">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>
            <p style="font-family: sans-serif; font-size: 16px; text-align: center; color: #666;">
              Estimated Delivery Time: <strong>35-45 minutes</strong>
            </p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: '"The Intelligent Bistro" <orders@thebistro.com>',
        to: email || "guest@example.com",
        subject: `Order Confirmation #${orderId} ✨`,
        html: emailHtml,
      });

      console.log("Order confirmation email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));

      res.status(200).json({ success: true, orderId, previewUrl: nodemailer.getTestMessageUrl(info) });
    } catch (error) {
      console.error("Failed to send order confirmation:", error);
      // Fail silently for the user flow
      res.status(200).json({ success: true, warning: 'Email failed to send' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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
