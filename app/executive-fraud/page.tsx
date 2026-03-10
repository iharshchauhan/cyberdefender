'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useUser } from '@/lib/store';

export default function ExecutiveFraud() {
  const { addXp } = useUser();
  const [messages, setMessages] = useState<{id: string, role: 'user'|'model'|'system', content: string}[]>([
    { id: '1', role: 'system', content: 'Simulation started. The "CEO" is messaging you.' },
    { id: '2', role: 'model', content: 'Hey, are you at your desk? I need a huge favor right now.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isGameOver) return;

    const userMsg = input.trim();
    setInput('');
    const nextMessages = [...messages, { id: Date.now().toString(), role: 'user', content: userMsg }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/executive-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!response.ok) throw new Error('Failed to generate response');
      const data = await response.json();
      let text = data.text || '';
      let gameOver = false;

      if (text.includes('[FAILED]') || text.includes('[PASSED]')) {
        gameOver = true;
        if (text.includes('[PASSED]') && !awarded) {
          addXp(100);
          setAwarded(true);
          text = text.replace('[PASSED]', 'Simulation Passed! +100 XP: ');
        } else {
          text = text.replace('[FAILED]', 'Simulation Failed: ');
        }
      }

      setMessages([...nextMessages, { id: Date.now().toString(), role: 'model', content: text }]);
      if (gameOver) setIsGameOver(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">CEO Fraud</h1>
        <p className="text-slate-500 text-sm sm:text-base">Chat with the &quot;CEO&quot;. Don&apos;t get tricked.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-100 flex items-center justify-center">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">Richard (CEO)</h2>
            <p className="text-xs text-emerald-500 font-medium">Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : msg.role === 'system' ? "justify-center" : "justify-start")}>
              {msg.role === 'system' ? (
                <div className="bg-slate-200 text-slate-600 text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold uppercase tracking-wider text-center max-w-[90%]">
                  {msg.content}
                </div>
              ) : (
                <div className={cn("max-w-[85%] sm:max-w-[80%] rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-[15px] shadow-sm", msg.role === 'user' ? "bg-violet-600 text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm")}>
                  {msg.content}
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-3xl rounded-bl-sm px-4 sm:px-5 py-3 sm:py-4 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {isGameOver ? (
          <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0 text-center">
            <button onClick={() => window.location.reload()} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Play Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 flex gap-2 sm:gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Richard..." className="flex-1 bg-slate-100 border-transparent rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" disabled={loading} />
            <button type="submit" disabled={!input.trim() || loading} className="bg-violet-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-violet-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shrink-0">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

