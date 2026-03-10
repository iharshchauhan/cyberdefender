'use client';
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ShieldAlert, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/store';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const DEFAULT_SCENARIO = {
  type: 'email',
  sender: 'no-reply@accounts.google.com',
  subject: 'Security alert: New sign-in on Mac',
  content: "Your Google Account was just signed in to from a new Mac device. You're getting this email to make sure it was you.\n\nIf this was you, you don't need to do anything. If not, please go to your account settings to secure your account.",
  isPhishing: false,
  redFlags: [],
  explanation: "While security alerts can be scary and are often spoofed by scammers, this is a standard, legitimate automated alert. Notice it doesn't force you to click a suspicious link immediately, but advises you to check your account directly."
};

export default function PhishingMission() {
  const { addXp } = useUser();
  const [scenario, setScenario] = useState<any>(DEFAULT_SCENARIO);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [awarded, setAwarded] = useState(false);

  const generateScenario = async () => {
    setLoading(true);
    setUserAnswer(null);
    setAwarded(false);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short, realistic email or SMS scenario for a consumer. 
        CRITICAL: Randomly choose between:
        1. A clear phishing scam.
        2. A TRICKY LEGITIMATE message that looks suspicious (e.g., weird automated alert, poorly formatted corporate email, legitimate password reset) but is actually safe.
        
        Return JSON with: type ('email' or 'sms'), sender, subject (if email), content, isPhishing (boolean), redFlags (array of strings if phishing, empty if safe), explanation (explain why it's safe or a scam, especially if it's a tricky legitimate one).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              sender: { type: Type.STRING },
              subject: { type: Type.STRING },
              content: { type: Type.STRING },
              isPhishing: { type: Type.BOOLEAN },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING },
            },
            required: ['type', 'sender', 'content', 'isPhishing', 'redFlags', 'explanation'],
          }
        }
      });
      setScenario(JSON.parse(response.text || '{}'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isScam: boolean) => {
    setUserAnswer(isScam);
    if (isScam === scenario.isPhishing && !awarded) {
      addXp(50);
      setAwarded(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Spot the Phish</h1>
        <p className="text-slate-500 text-sm sm:text-base">Is this message safe or a scam?</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">AI is crafting a new scenario...</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-100">
                <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{scenario.type}</div>
                <div className="font-medium text-slate-900 text-sm sm:text-base">{scenario.sender}</div>
                {scenario.subject && <div className="text-slate-600 text-xs sm:text-sm mt-1">{scenario.subject}</div>}
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-slate-700 whitespace-pre-wrap font-sans text-base sm:text-lg">{scenario.content}</p>
              </div>
            </div>

            {userAnswer === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button onClick={() => handleAnswer(false)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 font-bold text-base sm:text-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /> Safe
                </button>
                <button onClick={() => handleAnswer(true)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl p-4 font-bold text-base sm:text-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" /> Scam
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("rounded-3xl p-5 sm:p-6 border-2", userAnswer === scenario.isPhishing ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")}>
                <h3 className={cn("text-xl sm:text-2xl font-extrabold mb-2", userAnswer === scenario.isPhishing ? "text-emerald-700" : "text-rose-700")}>
                  {userAnswer === scenario.isPhishing ? "Correct! +50 XP" : "Oops, incorrect!"}
                </h3>
                <p className="text-slate-700 mb-4 text-sm sm:text-base">{scenario.explanation}</p>
                {scenario.redFlags?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Red Flags:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm sm:text-base">
                      {scenario.redFlags.map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}
                <button onClick={generateScenario} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-4 font-bold text-base sm:text-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" /> Generate New with AI
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
