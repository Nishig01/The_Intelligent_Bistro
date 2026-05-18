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
      
      // Ultra-smart natural language fallback processor when Gemini API rate limit is hit (429)
      const lowerMsg = message.toLowerCase().trim();
      let fallbackMessage = "";
      let fallbackActions: any[] = [];
      let fallbackSuggestions: string[] = ["What are today's specials?", "Recommend a dessert.", "I'd like a vegan dinner."];

      // 1. Check for "add all", "add them", "order all"
      if (lowerMsg === "add all" || lowerMsg === "add them" || lowerMsg.includes("add the specials") || lowerMsg.includes("order all")) {
        const ribeye = menuData.find(m => m.id === "item_3");
        const tiramisu = menuData.find(m => m.id === "item_2");
        const tartare = menuData.find(m => m.id === "item_6");

        fallbackMessage = "Excellent choices! I have added today's specials (Grilled Ribeye, Signature Tiramisu, and Truffle Tartare) to your cart.";
        fallbackActions = [
          { type: "add", itemId: "item_3", quantity: 1 },
          { type: "add", itemId: "item_2", quantity: 1 },
          { type: "add", itemId: "item_6", quantity: 1 }
        ];
        fallbackSuggestions = ["View Cart", "Checkout", "Clear Cart"];
      }
      // 2. Check for "specials", "recommendations", "chef specials"
      else if (lowerMsg.includes("special") || lowerMsg.includes("recommend") || lowerMsg.includes("chef") || lowerMsg.includes("suggest")) {
        const ribeye = menuData.find(m => m.id === "item_3");
        const tiramisu = menuData.find(m => m.id === "item_2");
        const tartare = menuData.find(m => m.id === "item_6");
        
        fallbackMessage = "For today's specials, I highly recommend:\n" +
          `• ${ribeye?.name} ($${ribeye?.price}): ${ribeye?.description}\n` +
          `• ${tiramisu?.name} ($${tiramisu?.price}): ${tiramisu?.description}\n` +
          `• ${tartare?.name} ($${tartare?.price}): ${tartare?.description}`;
          
        fallbackSuggestions = ["Add all", "Add Grilled Ribeye", "Add Signature Tiramisu", "View Cart"];
      }
      // 3. Check for specific non-menu cravings like "water", "sparkling", "soda", "coke"
      else if (lowerMsg.includes("water") || lowerMsg.includes("sparkling") || lowerMsg.includes("soda") || lowerMsg.includes("coke") || lowerMsg.includes("pop")) {
        const lemonade = menuData.find(m => m.id === "item_23");
        const kombucha = menuData.find(m => m.id === "item_8");
        fallbackMessage = `We don't have sparkling water or soda on our menu, but we do serve our refreshing ${lemonade?.name} ($${lemonade?.price}) and our premium ${kombucha?.name} ($${kombucha?.price}). Would you like to try one of these instead?`;
        fallbackSuggestions = [`Add ${lemonade?.name}`, `Add ${kombucha?.name}`, "Browse Drinks"];
      }
      // 4. Check for vegan selections
      else if (lowerMsg.includes("vegan")) {
        const veganItems = menuData.filter(m => m.dietary?.includes("Vegan")).slice(0, 3);
        fallbackMessage = "Here are our chef-recommended vegan specialties:\n" +
          veganItems.map(item => `• ${item.name} ($${item.price}): ${item.description}`).join("\n");
        fallbackSuggestions = veganItems.map(item => `Add ${item.name}`);
      }
      // 5. Check for desserts
      else if (lowerMsg.includes("dessert") || lowerMsg.includes("sweet")) {
        const desserts = menuData.filter(m => m.category === "Desserts").slice(0, 3);
        fallbackMessage = "Indulge in our exquisite dessert selections:\n" +
          desserts.map(item => `• ${item.name} ($${item.price}): ${item.description}`).join("\n");
        fallbackSuggestions = desserts.map(item => `Add ${item.name}`);
      }
      // 6. Check for drinks or alcohol
      else if (lowerMsg.includes("wine") || lowerMsg.includes("drink") || lowerMsg.includes("beverage") || lowerMsg.includes("beer") || lowerMsg.includes("alcohol")) {
        const drinks = menuData.filter(m => m.category === "Drinks").slice(0, 3);
        fallbackMessage = "Here are some perfect beverage selections:\n" +
          drinks.map(item => `• ${item.name} ($${item.price}): ${item.description}`).join("\n");
        fallbackSuggestions = drinks.map(item => `Add ${item.name}`);
      }
      // 7. Check for general matching (e.g. "add steak", "tiramisu", "add ribeye", "add ribeye, tiramisu, and truffle tartare")
      else {
        let matchedItems: any[] = [];
        
        // Direct word matching for all items in menuData
        for (const item of menuData) {
          const itemNameLower = item.name.toLowerCase();
          const cleanItemName = itemNameLower.replace(/^(signature|classic|crispy|fresh|zesty|spicy|truffle|chilled|premium|aged|wild|glazed|rich|roasted|grilled|pan-seared)\s+/i, "").trim();
          
          // Regex check to match items as whole words to avoid partial matching errors
          const regexStr = `\\b${cleanItemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`;
          const regex = new RegExp(regexStr, 'i');
          
          if (lowerMsg.includes(itemNameLower) || (cleanItemName.length > 3 && regex.test(lowerMsg))) {
            if (!matchedItems.some(m => m.id === item.id)) {
              matchedItems.push(item);
            }
          }
        }
        
        // Keyword heuristics for commonly asked terms if no direct name matched
        if (matchedItems.length === 0) {
          if (lowerMsg.includes("steak") || lowerMsg.includes("beef") || lowerMsg.includes("meat")) {
            matchedItems.push(menuData.find(m => m.id === "item_3"));
          }
          if (lowerMsg.includes("tiramisu")) {
            matchedItems.push(menuData.find(m => m.id === "item_2"));
          }
          if (lowerMsg.includes("tartare")) {
            matchedItems.push(menuData.find(m => m.id === "item_6"));
          }
          if (lowerMsg.includes("ravioli") || lowerMsg.includes("pasta")) {
            matchedItems.push(menuData.find(m => m.id === "item_13"));
          }
          if (lowerMsg.includes("dumpling")) {
            matchedItems.push(menuData.find(m => m.id === "item_14"));
          }
          if (lowerMsg.includes("calamari")) {
            matchedItems.push(menuData.find(m => m.id === "item_9"));
          }
          if (lowerMsg.includes("salmon") || lowerMsg.includes("fish")) {
            matchedItems.push(menuData.find(m => m.id === "item_29"));
          }
          if (lowerMsg.includes("soup")) {
            matchedItems.push(menuData.find(m => m.id === "item_41"));
          }
          if (lowerMsg.includes("salad")) {
            matchedItems.push(menuData.find(m => m.id === "item_28"));
          }
          if (lowerMsg.includes("gelato") || lowerMsg.includes("ice cream")) {
            matchedItems.push(menuData.find(m => m.id === "item_27"));
          }
          if (lowerMsg.includes("lava") || lowerMsg.includes("cake")) {
            matchedItems.push(menuData.find(m => m.id === "item_21"));
          }
          if (lowerMsg.includes("cheesecake")) {
            matchedItems.push(menuData.find(m => m.id === "item_22"));
          }
          if (lowerMsg.includes("lemonade")) {
            matchedItems.push(menuData.find(m => m.id === "item_23"));
          }
          if (lowerMsg.includes("tea")) {
            matchedItems.push(menuData.find(m => m.id === "item_20"));
          }
          if (lowerMsg.includes("kombucha")) {
            matchedItems.push(menuData.find(m => m.id === "item_8"));
          }
        }

        // Clean null matches
        matchedItems = matchedItems.filter(Boolean);

        if (matchedItems.length > 0) {
          if (lowerMsg.includes("remove") || lowerMsg.includes("delete") || lowerMsg.includes("subtract")) {
            fallbackMessage = `I've removed ${matchedItems.map(m => m.name).join(", ")} from your cart.`;
            fallbackActions = matchedItems.map(m => ({ type: "remove", itemId: m.id }));
            fallbackSuggestions = ["View Cart", "What are today's specials?"];
          } else {
            // Smart modifier extraction for fallback mode
            const selectedModifiers: string[] = [];
            if (lowerMsg.includes("chilled")) selectedModifiers.push("Served Chilled");
            if (lowerMsg.includes("room temp")) selectedModifiers.push("Room Temperature");
            if (lowerMsg.includes("almond")) selectedModifiers.push("Almond Milk");
            if (lowerMsg.includes("oat")) selectedModifiers.push("Oat Milk");
            if (lowerMsg.includes("extra shot") || lowerMsg.includes("double shot")) selectedModifiers.push("Extra Shot");
            
            let instructions = undefined;
            if (lowerMsg.includes("medium rare")) instructions = "Medium Rare";
            else if (lowerMsg.includes("well done")) instructions = "Well Done";
            else if (lowerMsg.includes("rare")) instructions = "Rare";
            else if (lowerMsg.includes("medium")) instructions = "Medium";

            fallbackMessage = `Excellent choices! I've added ${matchedItems.map(m => `${m.name} ($${m.price})`).join(", ")} to your cart.`;
            fallbackActions = matchedItems.map(m => ({
              type: "add",
              itemId: m.id,
              quantity: 1,
              modifiers: selectedModifiers.length > 0 ? selectedModifiers : undefined,
              instructions: instructions
            }));
            fallbackSuggestions = ["View Cart", "Checkout", "What are today's specials?"];
          }
        } else if (lowerMsg.includes("clear") || lowerMsg.includes("empty")) {
          fallbackMessage = "I have cleared your current cart.";
          fallbackActions = [{ type: "clear" }];
          fallbackSuggestions = ["Browse Menu", "View Specials"];
        } else if (lowerMsg.includes("cart") || lowerMsg.includes("basket") || lowerMsg.includes("show")) {
          fallbackMessage = currentCart.length > 0 
            ? `Your cart currently has ${currentCart.length} item(s):\n` +
              currentCart.map((c: any) => `• ${c.quantity}x ${c.name} ($${c.price})`).join("\n")
            : "Your basket is currently empty.";
          fallbackSuggestions = ["Checkout", "What are today's specials?"];
        } else if (lowerMsg.includes("checkout") || lowerMsg.includes("pay") || lowerMsg.includes("place order")) {
          fallbackMessage = "Directing you to the checkout screen to complete your gourmet selection.";
          fallbackActions = [{ type: "checkout" }];
          fallbackSuggestions = ["What are today's specials?"];
        } else {
          // Charming off-topic answers — actually engage, then redirect
          if (lowerMsg.includes("recipe") || lowerMsg.includes("how to make") || lowerMsg.includes("how to cook")) {
            const dish = lowerMsg.includes("masala") ? "Masala rice" : lowerMsg.includes("biryani") ? "Biryani" : "That dish";
            fallbackMessage = `${dish} is a culinary gem — basically a symphony of spices that smells better than any candle. We don't serve it here at The Bistro, but if you're chasing bold, layered flavors, our menu has some seriously impressive alternatives. Shall I recommend something that might just become your new obsession?`;
          } else if (lowerMsg.includes("president") || lowerMsg.includes("prime minister") || lowerMsg.includes("government") || lowerMsg.includes("politics")) {
            fallbackMessage = "Ah, politics — the one dish that's always overcooked and never satisfying! I'll leave that to the experts. What I can promise is that our menu is far more delightful and considerably less controversial. What can I tempt you with today?";
          } else if (lowerMsg.includes("weather") || lowerMsg.includes("rain") || lowerMsg.includes("temperature")) {
            fallbackMessage = "I'm more of an indoor kind of AI — weather's not really my department! But I can tell you that whatever the weather, our food is always the perfect answer. Comfort food? Something light? What are you in the mood for?";
          } else if (lowerMsg.includes("sport") || lowerMsg.includes("cricket") || lowerMsg.includes("football") || lowerMsg.includes("score")) {
            fallbackMessage = "Sports scores? I'm afraid I'm benched on that one! But I'll tell you what — nothing pairs better with a big game than great food. Want me to suggest something to snack on while you watch?";
          } else if (lowerMsg.includes("movie") || lowerMsg.includes("film") || lowerMsg.includes("netflix") || lowerMsg.includes("show")) {
            fallbackMessage = "Great taste in entertainment! I'm more of a food critic than a film critic, but I do know that every great movie night needs great food to go with it. Want me to curate a menu for your evening?";
          } else {
            fallbackMessage = "Ha, now that's a curveball! I might not be the world's greatest authority on that topic, but I am an expert on extraordinary food. So — shall we get back to the good stuff? What would you like to eat today?";
          }
          fallbackSuggestions = ["What are today's specials?", "Recommend something bold", "Show me desserts", "I'd like a vegan dinner."];
        }
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
