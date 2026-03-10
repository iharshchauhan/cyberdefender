'use client';
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Globe, AlertTriangle, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@/lib/store';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const DEFAULT_SCENARIO = {
  websiteName: "Bob's Local Hardware",
  url: "http://bobs-hardware-store-1984.net",
  description: "You're looking for a local hardware store. The site looks like it was built in 1998, has a weird domain, and doesn't use HTTPS.",
  isCompromised: false,
  indicators: [],
  explanation: "While the site is outdated, lacks HTTPS, and has a weird domain, it's just a poorly maintained small business website, not actively malicious or compromised. You shouldn't enter credit cards here, but browsing is safe.",
  htmlSnippet: "<html>\n<body bgcolor=\"#0000FF\" text=\"#FFFFFF\">\n  <marquee>Welcome to Bob's!</marquee>\n  <p>Call us at 555-0192</p>\n</body>\n</html>"
};

export default function WateringHole() {
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
        contents: `Generate a short website scenario.
        CRITICAL: Randomly choose between:
        1. A compromised watering hole website.
        2. A TRICKY SAFE website that looks suspicious (e.g., outdated HTTP, weird domain for a legitimate local business, messy code) but is actually NOT malicious.
        
        Return JSON with: websiteName, url, description, isCompromised (boolean), indicators (array of strings if compromised, empty if safe), explanation (explain why it's compromised or safe, especially if it's a tricky safe one), htmlSnippet.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              websiteName: { type: Type.STRING }, url: { type: Type.STRING }, description: { type: Type.STRING },
              isCompromised: { type: Type.BOOLEAN }, indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING }, htmlSnippet: { type: Type.STRING },
            },
            required: ['websiteName', 'url', 'description', 'isCompromised', 'indicators', 'explanation', 'htmlSnippet'],
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

  const handleAnswer = (isCompromised: boolean) => {
    setUserAnswer(isCompromised);
    if (isCompromised === scenario.isCompromised && !awarded) {
      addXp(50);
      setAwarded(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Safe Browsing</h1>
        <p className="text-slate-500 text-sm sm:text-base">Is this website safe to use?</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Scanning the web...</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-100 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-slate-500 font-mono shadow-sm text-center truncate">
                  {scenario.url}
                </div>
              </div>
              <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{scenario.websiteName}</h2>
                  <p className="text-slate-600 text-base sm:text-lg">{scenario.description}</p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-3 sm:p-4 overflow-x-auto shadow-inner">
                  <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Page Source Snippet</div>
                  <pre className="text-xs sm:text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                    <code>{scenario.htmlSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>

            {userAnswer === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button onClick={() => handleAnswer(false)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 font-bold text-base sm:text-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /> Safe
                </button>
                <button onClick={() => handleAnswer(true)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl p-4 font-bold text-base sm:text-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" /> Compromised
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("rounded-3xl p-5 sm:p-6 border-2", userAnswer === scenario.isCompromised ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")}>
                <h3 className={cn("text-xl sm:text-2xl font-extrabold mb-2", userAnswer === scenario.isCompromised ? "text-emerald-700" : "text-rose-700")}>
                  {userAnswer === scenario.isCompromised ? "Correct! +50 XP" : "Oops, incorrect!"}
                </h3>
                <p className="text-slate-700 mb-4 text-sm sm:text-base">{scenario.explanation}</p>
                {scenario.indicators?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Indicators of Compromise:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm sm:text-base">
                      {scenario.indicators.map((indicator: string, i: number) => <li key={i}>{indicator}</li>)}
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
