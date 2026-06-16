import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, HelpCircle, ShoppingBag, ArrowRight } from "lucide-react";

export const AISphereButler = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "iris",
      text: "Greetings! I am **Iris**, your personal ShopSphere stylist & checkout butler. Copy codes like **DISCOUNT50** from the Home page for massive savings! How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: "u_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        const irisMsg = {
          id: "iris_" + Date.now(),
          sender: "iris",
          text: data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, irisMsg]);
      } else {
        throw new Error("API call error");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "iris",
          text: "Sorry, I am currently navigating a busy checkout channel. Please try again in brief!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetQuestions = [
    { label: "🎫 Active Coupons?", query: "What are the active coupons available today?" },
    { label: "⌚ Best Watch details?", query: "tell me about Zenith Carbon-V X-1 Watch" },
    { label: "🎮 Gaming setup?", query: "What is the best gaming setup for a high-performance laptop?" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-sphere-butler-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-4.5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-0 select-none animate-bounce"
          style={{ animationDuration: "3s" }}
          id="toggle-ai-butler-button"
        >
          <Sparkles size={18} className="animate-pulse text-yellow-300" />
          <span className="text-xs uppercase tracking-wider font-extrabold hidden md:inline">Ask Iris AI</span>
        </button>
      )}

      {/* Embedded Chat Screen */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] bg-white dark:bg-gray-950 rounded-2xl shadow-3xl border border-gray-150 dark:border-gray-800 flex flex-col overflow-hidden animate-fade-in" id="ai-butler-drawer">
          {/* Header styling */}
          <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5 text-left">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-sm">
                  ✨
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-550 border-2 border-slate-950 rounded-full" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-tight uppercase">Iris Shopper AI</h4>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-blue-400 font-black">Stylist Butler</span>
                  <span className="text-[7px] font-bold text-gray-500">•</span>
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase">Live Setup</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white border-0 bg-transparent cursor-pointer duration-150"
            >
              <X size={15} />
            </button>
          </div>

          {/* Quick Alert Bar */}
          <div className="bg-blue-50/50 dark:bg-blue-955/20 px-4 py-2 border-b border-blue-100/40 dark:border-blue-900/10 flex items-center gap-1.5 text-left">
            <ShoppingBag size={11} className="text-blue-500 shrink-0" />
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              PRO TIP: Copy **DISCOUNT50** for a massive 50% discount!
            </span>
          </div>

          {/* Messages Log scroll view */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-955/5 text-left" ref={scrollRef}>
            {messages.map((m) => {
              const isIris = m.sender === "iris";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 max-w-[85%] ${isIris ? "mr-auto flex-row" : "ml-auto flex-row-reverse"}`}
                >
                  {isIris && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-blue-950/40 text-[10px] flex items-center justify-center shrink-0 border border-indigo-100/30 mt-1">
                      🦄
                    </div>
                  )}
                  <div className="space-y-1">
                    <div
                      className={`text-xs px-3.5 py-2.5 rounded-2xl shadow-xs whitespace-pre-wrap leading-relaxed ${
                        isIris
                          ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-250 rounded-tl-none border border-gray-150 dark:border-gray-850"
                          : "bg-blue-600 text-white rounded-tr-none font-medium"
                      }`}
                    >
                      {/* Very basic inline bold markdown parsing for premium visual experience */}
                      {m.text.split("**").map((part, index) => {
                        if (index % 2 === 1) {
                          return <strong key={index} className={isIris ? "font-black text-gray-950 dark:text-white" : "font-black text-yellow-250"}>{part}</strong>;
                        }
                        return part;
                      })}
                    </div>
                    <span className="text-[8px] text-gray-400 font-bold block px-1 uppercase">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Waiting loader indicator */}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-blue-950/40 text-[10px] flex items-center justify-center shrink-0 border mt-1">
                  ⏳
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick preset suggestion pills */}
          {messages.length < 3 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-850 bg-gray-50/10 flex flex-wrap gap-1.5 justify-start">
              {presetQuestions.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pq.query)}
                  className="text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/35 dark:bg-blue-955/10 px-2.5 py-1 rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 hover:border-transparent transition-all cursor-pointer select-none"
                >
                  {pq.label}
                </button>
              ))}
            </div>
          )}

          {/* Chat text input and send trigger forms */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) {
                handleSendMessage(inputValue);
              }
            }}
            className="p-3 bg-white dark:bg-gray-950 border-t border-gray-150 dark:border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Iris anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1.5 focus:ring-blue-500 focus:border-transparent text-gray-850 dark:text-gray-250 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:disabled:text-gray-600 border-0 cursor-pointer flex items-center justify-center shrink-0 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AISphereButler;
