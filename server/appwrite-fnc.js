import { GoogleGenerativeAI } from '@google/generative-ai';

// Appwrite Function entrypoint
export default async ({ req, res, log, error }) => {
  try {
    // Get the Gemini API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }
    console.log("Successfully retrieved Gemini API key")

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    console.log("Successfully initialized Gemini client")
    

    // Parse request body (expects { prompt: "..." })
    let body = {};
    try {
      body = JSON.parse(req.body || "{}");
    } catch (err) {
      return res.json({
        success: false,
        error: "Invalid JSON body",
      });
    }

    const { prompt, type = 'text' } = body;
    console.log(`Successfully parsed request body. Type: ${type}, Prompt: ${prompt}`);
    if (!prompt) {
      return res.json({
        success: false,
        error: "No prompt provided",
      });
    }

    if (type === 'image') {
      // Image generation logic
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{
              text: prompt
            }]
          }
        ],
        generationConfig: {
          responseModalities: ["Text", "Image"],
        }
      });

      // The 'response' property is not used for image generation.
      // The candidates are directly on the result object.
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          return res.json({
            success: true,
            data: imageData,
          });
        }
      }

      throw new Error("No image data found in response");

    } else {
      // Text generation logic (default)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      console.log("Successfully accessed generative model")

      const result = await model.generateContent(prompt);
      console.log("Successfully generated response")
      const text = result.response.text();
      console.log("Successfully generated response text")

      return res.json({
        success: true,
        data: text,
      });
    }

  } catch (err) {
    error(`Gemini function failed: ${err.message}`);
    return res.json({
      success: false,
      error: err.message,
    });
  }
};
