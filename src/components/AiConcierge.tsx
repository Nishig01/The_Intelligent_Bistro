import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processAIOrder, applyAIActions } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiConcierge({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Craving something comforting tonight? Our Truffle Wagyu Burger is a guest favorite." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Reorder my last meal",
    "Surprise me",
    "Vegetarian options?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, suggestions]);

  const sendMessage = async (overrideMsg?: string) => {
    const userMsg = overrideMsg || input.trim();
    if (!userMsg || isTyping) return;
    
    setInput("");
    setSuggestions([]); // Clear suggestions while thinking
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const result = await processAIOrder(userMsg);
      await new Promise(r => setTimeout(r, 800)); 
      
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
      
      if (result.actions && result.actions.length > 0) {
        applyAIActions(result.actions);
      }

      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setSuggestions(["Menu", "Checkout"]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "My apologies, but our concierge service is currently overwhelmed. Please try adding items manually." }]);
      setSuggestions(["Retry", "Close Chat"]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative rounded-t-[32px]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-10 sticky top-0 rounded-t-[32px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A1A1A] to-[#333] flex items-center justify-center shadow-lg shadow-black/10">
            <Sparkles size={18} className="text-[#C1A87D]" />
          </div>
          <div>
            <h3 className="font-serif text-[22px] leading-none text-[#111] mb-1">
              Concierge
            </h3>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.25em] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 relative"><span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50"></span></span>
              Active
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-[24px] px-6 py-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-[#1A1A1A] to-[#222] text-white rounded-br-[8px]' 
                  : 'bg-white border border-gray-100/80 rounded-bl-[8px] text-[#111]'
              }`}>
                <p className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'font-light text-white/90' : 'font-normal'}`}>{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex justify-start"
            >
              <div className="bg-white px-6 py-5 rounded-[24px] rounded-bl-[8px] shadow-sm border border-gray-100/80 flex gap-2 items-center">
                <div className="w-1.5 h-1.5 bg-[#C1A87D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#C1A87D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#C1A87D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/90 backdrop-blur-2xl p-5 pt-0 border-t border-gray-100/50 mt-auto pb-8 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 py-4 overflow-x-auto scrollbar-hide -mx-5 px-5"
            >
              {suggestions.map((sug, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(sug)}
                  className="whitespace-nowrap text-[13px] bg-[#FAFAFA] border border-gray-200/60 px-5 py-2.5 rounded-full hover:border-[#C1A87D] hover:bg-white hover:shadow-md hover:text-[#C1A87D] transition-all font-medium text-gray-600 shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="relative flex items-center bg-[#FAFAFA] border border-gray-200 rounded-full pr-2 focus-within:border-[#C1A87D] focus-within:ring-4 focus-within:ring-[#C1A87D]/10 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your luxurious request..." 
            className="flex-1 bg-transparent px-6 py-4 outline-none text-[15px] font-medium placeholder:text-gray-400 placeholder:font-light"
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="bg-[#1A1A1A] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center transition-all shadow-md group"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
}
