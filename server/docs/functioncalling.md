# Gemini Function Calling

To use function calling in Node.js with TypeScript, you need to understand that the  **Gemini model does not run your code** . Instead, it acts as an orchestrator: it analyzes your prompt, decides which function to call, and gives you the arguments. You then run the actual function in your Node.js environment and feed the result back to Gemini to generate the final natural language answer.

Here is the comprehensive guide to implementing this "human-in-the-loop" workflow.

## **1. Prerequisites**

First, ensure you have the necessary package installed.

```bash
npm install @google/generative-ai
```

### **2. The Function Calling Workflow**

There are four distinct stages in a function calling lifecycle:

1. **Declaration:** You tell Gemini, "Here are tools I have (names, descriptions, and parameter schemas)."
2. **Invocation:** Gemini responds, "Please run `getStockPrice` with symbol 'GOOGL'."
3. **Execution:** Your Node.js code runs the actual API call to fetch the stock price.
4. **Response:** You give the price back to Gemini, and it answers the user: "Google is currently trading at..."

---

### **3. Complete Implementation (TypeScript)**

Below is a complete, runnable `index.ts` file. This example creates a tool that simulates fetching stock prices.

```typescript
import {
  GoogleGenerativeAI,
  FunctionDeclarationSchemaType,
  FunctionCall,
} from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// --- Step 1: Define the actual executable function ---
// This is the "real" code that runs on your server/computer.
async function getStockPrice(symbol: string): Promise<any> {
  // In a real app, you would fetch from an API like Yahoo Finance or CoinGecko
  console.log(`> [System] Fetching price for ${symbol}...`);
  
  // Mock data for demonstration
  const mockDatabase: Record<string, number> = {
    "AAPL": 150.25,
    "GOOGL": 2750.10,
    "TSLA": 900.00
  };

  const price = mockDatabase[symbol] || "Unknown Symbol";
  return { symbol, price, currency: "USD" };
}

// --- Step 2: Define the Tool Schema ---
// This tells Gemini *how* to use your function.
const stockToolDefinition = {
  name: "getStockPrice",
  description: "Fetches the current stock price of a given company symbol.",
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      symbol: {
        type: FunctionDeclarationSchemaType.STRING,
        description: "The stock symbol (e.g. AAPL, GOOGL, TSLA)",
      },
    },
    required: ["symbol"],
  },
};

// --- Step 3: Main Execution Loop ---
async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  
  // Initialize model with tools
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // or gemini-pro
    tools: [
      {
        functionDeclarations: [stockToolDefinition],
      },
    ],
  });

  // Start a chat session
  const chat = model.startChat();

  const userPrompt = "How much is Apple's stock right now?";
  console.log(`User: ${userPrompt}`);

  // 1. Send initial message
  const result = await chat.sendMessage(userPrompt);
  const response = result.response;
  
  // 2. Check if Gemini wants to call a function
  const call = response.functionCalls()?.[0];

  if (call) {
    console.log(`Gemini Request: Call function "${call.name}" with args`, call.args);

    // 3. Execute the function based on the name
    let functionResult;
    if (call.name === "getStockPrice") {
      // Cast args to expected type safely
      const args = call.args as { symbol: string };
      functionResult = await getStockPrice(args.symbol);
    }

    // 4. Send the function result BACK to Gemini
    // We construct a specific "functionResponse" part
    const result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: "getStockPrice",
          response: {
            name: "getStockPrice", 
            content: functionResult 
          },
        },
      },
    ]);

    // 5. Get final natural language response
    console.log("Gemini Answer:", result2.response.text());
  } else {
    // If no function call was needed
    console.log("Gemini Answer:", response.text());
  }
}

main().catch(console.error);
```

### **4. Key Concepts to Master**

#### **The Schema (`FunctionDeclaration`)**

The `parameters` object follows the **OpenAPI 3.0** (JSON Schema) format.

* **Accuracy is Key:** The better your `description` is, the better Gemini will be at triggering the function correctly.
* **Types:** Use `FunctionDeclarationSchemaType` (imported from the SDK) to ensure type safety for `STRING`, `NUMBER`, `OBJECT`, etc.

#### **Handling the `functionResponse`**

When you send the data back (Step 4 in the code), the structure is strict. You must send an array containing a `functionResponse` object:

```javascript
{
  functionResponse: {
    name: "function_name_here",
    response: {
      name: "function_name_here", // Repeated for validation
      content: { ...your_json_data... } // The actual data
    }
  }
}
```

#### **Multi-Turn Chat**

In the example above, `chat.sendMessage` is used. This is crucial because Gemini needs the context history:

1. **Turn 1:** User asks question.
2. **Turn 2:** Model replies with a Function Call request (not text).
3. **Turn 3:** User (System) replies with Function Result.
4. **Turn 4:** Model replies with final Answer.

### **5. Debugging Tips**

* **"Model hallucinated a function":** If the model tries to call a function you didn't define, check your `tools` configuration passed to `getGenerativeModel`.
* **"Arguments are wrong":** If Gemini passes a stock symbol like "Apple" instead of "AAPL", update your **description** in the schema to say: *"The stock symbol (e.g. AAPL), not the company name."*
* **Infinite Loops:** Ensure you actually send the `functionResponse` back. If you just send the text result as a user message, the model might get confused.
