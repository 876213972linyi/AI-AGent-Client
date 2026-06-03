
import { GoogleGenAI, Type } from "@google/genai";
import { TicketCategory, TicketPriority, TicketAIAnalysis } from "../types";

// Injected API_KEY from environment
const API_KEY = process.env.API_KEY || "";

export class GeminiService {
  private static instance: GeminiService;
  private ai: GoogleGenAI;

  private constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Analyzes a ticket description to provide classification, priority, and sentiment.
   */
  public async analyzeTicket(title: string, description: string): Promise<TicketAIAnalysis> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this grievance ticket:
        Title: ${title}
        Description: ${description}`,
        config: {
          systemInstruction: "You are an expert customer support AI analyst. Categorize the ticket, determine priority based on SLA rules (financial issues are URGENT), detect sentiment and emotion, and provide a helpful suggested response.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { 
                type: Type.STRING, 
                enum: Object.values(TicketCategory),
                description: "The classification category of the ticket."
              },
              priority: { 
                type: Type.STRING, 
                enum: Object.values(TicketPriority),
                description: "The priority level."
              },
              sentiment: { 
                type: Type.STRING, 
                enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] 
              },
              emotion: { type: Type.STRING },
              urgencyScore: { type: Type.NUMBER },
              suggestedResponse: { type: Type.STRING }
            },
            required: ["category", "priority", "sentiment", "emotion", "urgencyScore", "suggestedResponse"]
          }
        }
      });

      return JSON.parse(response.text || "{}") as TicketAIAnalysis;
    } catch (error) {
      console.error("Error analyzing ticket with Gemini:", error);
      // Fallback
      return {
        category: TicketCategory.OTHER,
        priority: TicketPriority.MEDIUM,
        sentiment: "NEUTRAL",
        emotion: "uncertain",
        urgencyScore: 50,
        suggestedResponse: "We have received your ticket and will look into it shortly."
      };
    }
  }

  /**
   * Simple chatbot interface for handling user queries.
   */
  public async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    try {
      const chatSession = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are AI-Grievance-Pro Assistant. Help users with their complaints, guide them on how to submit a ticket, and provide status updates if they ask. Keep it empathetic and professional.",
        }
      });

      const response = await chatSession.sendMessage({ message });
      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Chat error:", error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  }
}
