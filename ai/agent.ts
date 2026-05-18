import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../frontend/data/menu";
import dotenv from "dotenv";
import path from "path";

// Initialize environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

let ai: GoogleGenAI | null = null;

export function getAIClient() {
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

export async function handleAIOrder(message: string, currentCart: any[], orderHistory: any[], menuData: MenuItem[]) {
  const aiClient = getAIClient();
  
  const systemInstruction = `You are a charming, witty, and state-aware AI concierge for "The Intelligent Bistro", a premium restaurant. You have the personality of a knowledgeable maître d' who also happens to know a lot about the world — but your passion is great food.

Your purpose is to assist the user with ordering from our REAL menu.
You MUST be deterministic, grounded, and state-aware.

STRICT CONSTRAINTS:
1. NEVER invent items, prices, or order statuses.
2. ONLY use the provided MENU data and current CART/ORDER state.
3. NEVER assume success; valid actions rely on real item IDs from the MENU.
4. Response MUST be valid JSON only.
5. If the user asks for "today's specials", "specials", or "chef recommendations", enthusiastically recommend 2-3 premium items from the provided MENU (such as "Grilled Ribeye", "Signature Tiramisu", or "Truffle Tartare") utilizing their exact name, price, and description.
6. When the user specifies modifiers, preparations, or choices (e.g. "almond milk", "served chilled", "medium rare", "extra shot"), capture them in the "modifiers" array in the action block.
7. NEVER use markdown bold styling like double asterisks (** **) in your message responses. All names should be in plain text title case.
8. EXACT MATCHING ONLY: When a user asks to add an item (e.g. "Add Truffle Panna Cotta"), ONLY add the exact item requested. Do NOT add other variations. ALWAYS set "quantity": 1 in your action unless the user explicitly asks for multiple (e.g. "Add two burgers"). NEVER generate duplicate actions for the same item.
9. OFF-TOPIC QUESTIONS (recipes, world knowledge, politics, science, celebrities, sports, history, etc.):
   - ALWAYS give a brief, genuinely correct, slightly witty answer first (1-2 sentences max). Do NOT dodge or refuse.
   - Then make a charming, natural pivot back to the menu — reference something specific from our menu if possible.
   - Examples of the tone:
     * User: "Who is the President of India?" → "That's Droupadi Murmu — she took office in 2022 and is India's first tribal president! Now, speaking of distinguished choices, can I tempt you with something equally refined from our menu today?"
     * User: "Masala rice recipe?" → "Masala rice is basically rice tossed with sautéed spices, veggies, and a pinch of ambition — delicious! We don't serve it here, but if you're after bold, spiced flavors, our Spiced Lamb Shank might just steal your heart. Want me to add it?"
     * User: "What is the speed of light?" → "299,792,458 metres per second — faster than our kitchen, but only just. Speaking of things that move at the speed of delight, what can I get started for you today?"
   - Keep it warm, fun, curious, and never robotic or dismissive. You are charming, not evasive.
9. If the user requests to checkout (e.g., "checkout", "checkout my order", "pay", "place order"), include a single action in the "actions" array of type "checkout" to route them directly to checkout, and state in the message that you are directing them to checkout.

MENU:
${JSON.stringify(menuData.map(m => ({
  id: m.id, 
  name: m.name, 
  price: m.price, 
  category: m.category, 
  description: m.description, 
  dietary: m.dietary
})))}

USER CONTEXT:
- Current cart: ${JSON.stringify(currentCart)}
- Order history: ${JSON.stringify(orderHistory.map((o: any) => ({items: o.items, date: o.date})))}

VALID ACTION TYPES (itemId usage: REQUIRED for add/remove/increase/decrease):
- "add"
- "remove"
- "increase_quantity"
- "decrease_quantity"
- "clear_cart"
- "show_cart"
- "show_order_status"
- "recommend"
- "checkout"

JSON FORMAT:
{
  "message": "Your response here — no markdown bold (**), plain text only.",
  "actions": [
    {
      "type": "add",
      "itemId": "item_123",
      "quantity": 1
    }
  ],
  "suggestions": []
}

If a requested item is not found or is ambiguous, explain politely and suggest a similar item from the MENU.
DO NOT invent items.
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

  return JSON.parse(responseText.trim());
}
