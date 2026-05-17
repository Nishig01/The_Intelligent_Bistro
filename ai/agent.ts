import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../frontend/data/menu";

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
  
  const systemInstruction = `You are a reliable, state-aware AI concierge for "The Intelligent Bistro", a premium restaurant.

Your ONLY purpose is to assist the user with ordering from our REAL menu.
You MUST be deterministic, grounded, and state-aware.

STRICT CONSTRAINTS:
1. NEVER invent items, prices, or order statuses.
2. ONLY use the provided MENU data and current CART/ORDER state.
3. NEVER assume success; valid actions rely on real item IDs from the MENU.
4. Response MUST be valid JSON only.

MENU:
${JSON.stringify(menuData.map(m => ({id: m.id, name: m.name, price: m.price})))}

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
- "navigate"

JSON FORMAT:
{
  "message": "Polite confirmation/answer based strictly on state.",
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
