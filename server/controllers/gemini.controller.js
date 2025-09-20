import asyncHandler from "express-async-handler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiReply = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error("Prompt is required");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  res.status(200).json({ reply: text });
});
