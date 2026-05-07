import { ai, MODEL_NAME } from '../lib/ai';
import { UserProfile, Transaction, Task, Memory, BusinessType } from '../types';
import { Type } from "@google/genai";

export const aiService = {
  async getDailyAdvice(user: UserProfile, transactions: Transaction[], tasks: Task[]): Promise<string> {
    const context = `
      User Business: ${user.businessName} (${user.businessType})
      Financials (Last 30 days): ${JSON.stringify(transactions.slice(0, 10))}
      Current Tasks: ${JSON.stringify(tasks.filter(t => t.status !== 'completed'))}
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: "user",
            parts: [{ text: `Based on my business data, what should I focus on today? ${context}` }]
          }
        ],
        config: {
          systemInstruction: "You are Cortex, a powerful AI Business Operating System. You give concise, actionable, data-driven advice. Focus on profitability, efficiency, and growth. Speak direct and professional."
        }
      });
      return response.text || "Keep pushing! Your business is your greatest asset.";
    } catch (error) {
      console.error("AI Advice Error:", error);
      return "Focus on your top priority tasks and monitor your cash flow.";
    }
  },

  async categorizeTransaction(description: string): Promise<{ category: string, subcategory?: string }> {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ text: `Categorize this business transaction description: "${description}"` }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING }
            },
            required: ["category"]
          }
        }
      });
      return JSON.parse(response.text || '{"category": "Other"}');
    } catch (error) {
      return { category: "Uncategorized" };
    }
  },

  async analyzeBusinessPerformance(transactions: Transaction[]): Promise<string> {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ text: `Analyze this performance: Total Income: ${totalIncome}, Total Expense: ${totalExpense}. Give a 1-sentence growth tip.` }],
        config: {
          systemInstruction: "You are a financial analyst. Provide a brief, high-impact growth strategy."
        }
      });
      return response.text || "Optimize your expenses to increase margin.";
    } catch (error) {
      return "Monitor your overhead to ensure sustainable growth.";
    }
  }
};
