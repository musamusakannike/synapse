# GEMINI AI API IMAGE UNDERSTANDING

Based on the official documentation, here is the up-to-date guide for using the Gemini API for image understanding in Node.js.

## **Key Update: New SDK**

Google has released a newer SDK,  **`@google/genai`** , which replaces the older `@google/generative-ai`. The documentation you referenced uses this new SDK.

### **1. Installation**

Install the official Google GenAI SDK for Node.js:

```bash
npm install @google/genai
```

### **2. Setup & Authentication**

Get your API key from [Google AI Studio](https://aistudio.google.com/).

It is best practice to set your API key as an environment variable named `GEMINI_API_KEY`. The SDK will automatically detect it.

```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

### **3. Code Example: Image + Text Prompt**

This example demonstrates the **Inline Data** method, which is ideal for small images (under 20MB) and quick responses. It reads a local image file, converts it to base64, and sends it alongside a text prompt.

**File:** `image_analysis.js`

```javascript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

// 1. Initialize the client
// If you set GEMINI_API_KEY in your env, no arguments are needed.
// Otherwise pass { apiKey: 'YOUR_KEY' }
const ai = new GoogleGenAI({});

async function main() {
  try {
    // 2. Prepare the image
    // Read your image file and convert it to a base64 string
    const imagePath = "path/to/your/image.jpg"; // <--- REPLACE THIS
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    // 3. Define the request content
    // 'contents' is an array of messages. Each message has parts (text, image, etc.)
    const contents = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Change to 'image/png' if needed
              data: base64Image,
            },
          },
          { 
            text: "Describe this image in detail. What objects are present?" 
          },
        ],
      },
    ];

    // 4. Generate Content
    // Use a vision-capable model like 'gemini-2.5-flash' or 'gemini-1.5-pro'
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    // 5. Output the result
    console.log(response.text);
  
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

main();
```

### **4. Understanding the Code**

* **`inlineData`** : This is the key field for image understanding. It requires two properties:
* `mimeType`: The format of your image (e.g., `image/jpeg`, `image/png`, `image/webp`).
* `data`: The raw base64-encoded string of the image bytes.
* **Model Selection** :
* **`gemini-2.5-flash`** : Recommended for high-speed, low-latency tasks.
* **`gemini-1.5-pro`** : Better for complex reasoning or highly detailed image analysis.
* **`generateContent`** : This method handles the API call. It accepts a configuration object where you specify the `model` and the `contents` payload.

### **Alternative: File API (For Large Images)**

If your image is larger than 20MB or you plan to ask multiple questions about the same image, use the **File API** to upload it first.

```javascript
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  // Upload the file first
  const uploadResult = await ai.files.upload({
    file: "huge_image.jpg",
    config: { mimeType: "image/jpeg" },
  });

  // Reference the uploaded file URI in your request
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(uploadResult.uri, uploadResult.mimeType),
      "What is shown in this picture?",
    ]),
  });

  console.log(response.text);
}
main();
```

[How to use Gemini 1.5 Pro with Node.js](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DTyM8D4zDqFU)

This video walks through setting up the Node.js environment and covers similar multimodal prompt examples which can help visualize the implementation steps.
