import asyncHandler from "express-async-handler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateWebsite = asyncHandler(async (req, res) => {
  const { prompt, websiteType = "simple" } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error("Prompt is required");
  }

  // Create a detailed prompt for website generation
  const websitePrompt = `Generate a complete, single HTML file with embedded CSS and JavaScript for the following request: "${prompt}". 

Requirements:
- Create a fully functional, responsive website
- Include all HTML, CSS, and JavaScript in a single file
- Use modern web standards and best practices
- Make it visually appealing with good UX
- Include proper meta tags and structure
- Add interactive elements where appropriate
- Use semantic HTML5 elements
- Make it mobile-responsive
- Include proper error handling for any JavaScript functionality

The output should be ONLY the HTML code, starting with <!DOCTYPE html> and ending with </html>. Do not include any explanations or markdown formatting - just the pure HTML code.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(websitePrompt);
  const response = await result.response;
  const htmlCode = response.text();

  // Clean up the response to ensure it's pure HTML
  let cleanedHtml = htmlCode.trim();
  
  // Remove markdown code blocks if present
  if (cleanedHtml.startsWith('```html')) {
    cleanedHtml = cleanedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '');
  } else if (cleanedHtml.startsWith('```')) {
    cleanedHtml = cleanedHtml.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  // Ensure the HTML starts with DOCTYPE
  if (!cleanedHtml.toLowerCase().includes('<!doctype html>')) {
    if (!cleanedHtml.toLowerCase().startsWith('<!doctype')) {
      cleanedHtml = '<!DOCTYPE html>\n' + cleanedHtml;
    }
  }

  res.status(200).json({ 
    htmlCode: cleanedHtml,
    prompt: prompt,
    timestamp: new Date().toISOString()
  });
});