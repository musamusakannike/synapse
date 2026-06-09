import axios from "axios";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const BASE_URL = "https://api.deepseek.com";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  jsonMode: boolean = false
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API Key is missing. Please configure DEEPSEEK_API_KEY.");
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: DEEPSEEK_MODEL,
        messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: jsonMode ? 0.2 : 0.7,
        max_tokens: 8192,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        timeout: 90000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response structure from DeepSeek API");
    }
    return content;
  } catch (error: any) {
    console.error("DeepSeek API Error Details:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || error.message || "Failed to query DeepSeek API"
    );
  }
}
