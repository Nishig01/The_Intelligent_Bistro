import dotenv from "dotenv";
import path from "path";
import { handleAIOrder } from "../ai/agent";
import { menuData } from "../frontend/data/menu";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  try {
    const result = await handleAIOrder("Suggest a dessert", [], [], menuData);
    console.log("Success:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Agent Error:", error);
  }
}
test();
