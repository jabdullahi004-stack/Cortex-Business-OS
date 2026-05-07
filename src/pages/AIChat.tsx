import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Transaction, Task, Memory } from '../types';
import { dbService } from '../services/dbService';
import { ai, MODEL_NAME } from '../lib/ai';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Sparkles,
  Zap,
  Info,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChat: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${profile.businessName}! I'm Cortex, your AI Business Operating System. How can I assist you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Gather context
      const [txs, tasks] = await Promise.all([
        dbService.getTransactions(profile.id),
        dbService.getTasks(profile.id)
      ]);

      const context = `
        User Profile: ${JSON.stringify(profile)}
        Transactions (Recent): ${JSON.stringify(txs.slice(0, 10))}
        Active Tasks: ${JSON.stringify(tasks.filter(t => t.status !== 'completed'))}
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: "user",
            parts: [{ text: `Context: ${context}. Question: ${input}` }]
          }
        ],
        config: {
          systemInstruction: "You are Cortex, a powerful AI Business Operating System. You have deep memory of the user's business. Be precise, data-driven, and actionable. If asked about performance, use the provided transactions to calculate real answers."
        }
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm processing that. One moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Save insights to memory if significant
      if (response.text && response.text.length > 50) {
        await dbService.addMemory({
          content: `AI Advice: ${response.text.substring(0, 500)}`,
          type: 'insight',
          userId: profile.id,
          date: new Date()
        });
      }
    } catch (error) {
       console.error("AI Chat Error:", error);
       setMessages(prev => [...prev, {
         id: 'err',
         role: 'assistant',
         content: "I encountered an error accessing your business neural network. Please try again.",
         timestamp: new Date()
       }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "How is my business performing?",
    "What should I focus on today?",
    "Identify wasteful spending",
    "Predict next month's cash flow"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            AI Business Advisor <Zap size={20} className="text-yellow-500 fill-yellow-500" />
          </h1>
          <p className="text-sm text-gray-500">Real-time analysis powered by your business data.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Neural Sync
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'assistant' ? "bg-black text-white" : "bg-gray-100 text-gray-400"
            )}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <UserIcon size={16} />}
            </div>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'assistant' 
                ? "bg-white border border-gray-100 shadow-sm text-gray-800" 
                : "bg-black text-white"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
              <Loader2 className="animate-spin text-gray-300" size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {suggestions.map((s) => (
            <button 
              key={s}
              onClick={() => setInput(s)}
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="mt-6 relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Cortex about your financials or tasks..."
          className="w-full pl-6 pr-16 py-5 bg-white border border-gray-100 rounded-3xl shadow-lg focus:outline-none focus:border-black transition-all text-sm font-medium"
        />
        <button 
          disabled={!input.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
