import asyncHandler from "express-async-handler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from "../models/messages.model.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert database messages to Gemini history format
const convertToGeminiHistory = (messages) => {
  return messages.map(msg => ({
    role: msg.sender === "me" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));
};

// Implement sliding window for context management
const getContextWindow = (history, maxTokens = 30000) => {
  // Rough estimation: 1 token ≈ 4 characters
  const estimateTokens = (text) => Math.ceil(text.length / 4);
  
  let totalTokens = 0;
  const contextHistory = [];
  
  // Start from the most recent messages and work backwards
  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    const messageTokens = estimateTokens(message.parts[0].text);
    
    if (totalTokens + messageTokens > maxTokens && contextHistory.length > 0) {
      break; // Stop adding more messages to stay within context window
    }
    
    contextHistory.unshift(message);
    totalTokens += messageTokens;
  }
  
  return contextHistory;
};

export const getGeminiReply = asyncHandler(async (req, res) => {
  const { prompt, chatId } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error("Prompt is required");
  }

  let conversationHistory = [];
  
  // If chatId is provided, get the conversation history
  if (chatId) {
    try {
      // Get all messages for this chat, sorted by creation time
      const messages = await Message.find({ chatId })
        .sort({ createdAt: 1 })
        .select('text sender createdAt');
      
      // Convert to Gemini format
      const fullHistory = convertToGeminiHistory(messages);
      
      // Apply context window management
      conversationHistory = getContextWindow(fullHistory);
      
      console.log(`\n🧠 Conversation Context:`);
      console.log(`   📊 Total messages in DB: ${messages.length}`);
      console.log(`   🎯 Messages in context window: ${conversationHistory.length}`);
      if (conversationHistory.length > 0) {
        console.log(`   📝 Context preview:`);
        conversationHistory.slice(0, 3).forEach((msg, i) => {
          const preview = msg.parts[0].text.substring(0, 50) + (msg.parts[0].text.length > 50 ? '...' : '');
          console.log(`      ${i+1}. ${msg.role}: "${preview}"`);
        });
      }
    } catch (error) {
      console.error('❌ Error fetching conversation history:', error);
      // Continue without history if there's an error
    }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  try {
    let result;
    
    if (conversationHistory.length > 0) {
      // Use chat session with history for continuous conversation
      const chat = model.startChat({
        history: conversationHistory
      });
      
      result = await chat.sendMessage(prompt);
    } else {
      // Use simple generation for new conversations
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      reply: text,
      historyLength: conversationHistory.length
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // If there's an error with the chat session, try without history
    if (conversationHistory.length > 0) {
      console.log('Retrying without conversation history...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      res.status(200).json({ 
        reply: text,
        historyLength: 0,
        fallback: true
      });
    } else {
      throw error;
    }
  }
});
