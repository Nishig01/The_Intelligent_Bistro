import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  console.log("User:", process.env.SMTP_USER);
  console.log("Pass:", process.env.SMTP_PASS);
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.verify();
    console.log("SMTP SUCCESS!");
  } catch (error) {
    console.error("SMTP ERROR:", error);
  }
}
test();
