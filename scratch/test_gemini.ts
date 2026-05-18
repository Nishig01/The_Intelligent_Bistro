import dotenv from "dotenv";
import path from "path";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  console.log("Key:", process.env.GEMINI_API_KEY);
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Reply with OK.",
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
  }
}
test();
