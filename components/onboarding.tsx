'use client';
import { useState } from 'react';
import { useUser } from '@/lib/store';
import { Shield, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Onboarding({ children }: { children: React.ReactNode }) {
  const { name, setName, isLoaded, showLevelUp, closeLevelUp, level } = useUser();
  const [input, setInput] = useState('');

  if (!isLoaded) return null;

  return (
    <>
      {children}

      <AnimatePresence>
        {!name && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-10 max-w-md w-full text-center space-y-6 sm:space-y-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto rotate-12 shadow-inner">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-violet-600 -rotate-12" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome to SafeSurf</h1>
                <p className="text-slate-500 text-base sm:text-lg">Your cybersecurity training starts here. What should we call you?</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) setName(input.trim()); }} className="space-y-4">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter your name" className="w-full text-center text-xl sm:text-2xl font-bold bg-slate-100 border-4 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl px-4 py-4 sm:px-6 sm:py-5 outline-none transition-all placeholder:text-slate-300" autoFocus />
                <button type="submit" disabled={!input.trim()} className="w-full bg-violet-600 text-white rounded-2xl px-6 py-4 sm:py-5 font-extrabold text-lg sm:text-xl hover:bg-violet-700 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
                  Start Playing <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showLevelUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeLevelUp}>
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-12 max-w-sm w-full text-center space-y-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-100/50 to-transparent pointer-events-none" />
              <div className="relative">
                <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }} className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white">
                  <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-amber-500" />
                </motion.div>
                <div className="absolute -top-2 -right-2 text-amber-400 animate-ping"><Sparkles /></div>
                <div className="absolute top-10 -left-4 text-amber-400 animate-pulse"><Sparkles /></div>
              </div>
              <div className="space-y-2 relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Level Up!</h2>
                <p className="text-lg sm:text-xl font-bold text-amber-500">You are now Level {level}</p>
                <p className="text-slate-500 mt-2 text-sm sm:text-base">Keep up the great work and stay secure!</p>
              </div>
              <button onClick={closeLevelUp} className="w-full bg-slate-900 text-white rounded-2xl px-6 py-4 font-bold text-lg hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 relative">
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
