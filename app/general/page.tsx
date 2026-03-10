'use client';
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Shield, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@/lib/store';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const DEFAULT_SCENARIO = {
  title: "The Found USB Drive",
  description: "You find a USB drive in the company parking lot. It has a label that says 'Q3 Layoffs & Bonuses'. What should you do?",
  options: [
    { id: "a", text: "Plug it into your work computer to see who it belongs to.", isCorrect: false, feedback: "Never plug an unknown USB drive into any computer. It could contain malware." },
    { id: "b", text: "Plug it into your personal laptop at home, just to be safe.", isCorrect: false, feedback: "Your personal laptop is also vulnerable to malware. Do not plug it in." },
    { id: "c", text: "Give it to the IT or Security department immediately.", isCorrect: true, feedback: "Correct! IT has safe, isolated environments to inspect unknown devices." },
    { id: "d", text: "Throw it in the trash.", isCorrect: false, feedback: "While safe for you, someone else might find it. It's better to give it to IT." }
  ]
};

export default function GeneralSecurity() {
  const { addXp } = useUser();
  const [scenario, setScenario] = useState<any>(DEFAULT_SCENARIO);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [awarded, setAwarded] = useState(false);

  const generateScenario = async () => {
    setLoading(true);
    setSelectedOption(null);
    setAwarded(false);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short multiple-choice cybersecurity scenario. Return JSON with: title, description, options (array of 4 objects with id, text, isCorrect, feedback).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING }, description: { type: Type.STRING },
              options: {
                type: Type.ARRAY, items: {
                  type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING }, isCorrect: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
                  required: ['id', 'text', 'isCorrect', 'feedback']
                }
              }
            },
            required: ['title', 'description', 'options'],
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

  const handleSelect = (opt: any) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt.id);
    if (opt.isCorrect && !awarded) {
      addXp(50);
      setAwarded(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Security Basics</h1>
        <p className="text-slate-500 text-sm sm:text-base">What would you do in this situation?</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Thinking of a scenario...</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{scenario.title}</h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">{scenario.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {scenario.options.map((opt: any) => {
                const isSelected = selectedOption === opt.id;
                const showResult = selectedOption !== null;
                
                let btnClass = "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md text-slate-700";
                
                if (showResult) {
                  if (opt.isCorrect) {
                    btnClass = "bg-emerald-50 border-emerald-500 text-emerald-900";
                  } else if (isSelected && !opt.isCorrect) {
                    btnClass = "bg-rose-50 border-rose-500 text-rose-900";
                  } else {
                    btnClass = "bg-white border-slate-200 opacity-50 text-slate-500";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    disabled={showResult}
                    className={cn("text-left p-5 sm:p-6 rounded-3xl border-2 transition-all duration-200 flex flex-col gap-2", btnClass)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-base sm:text-lg">{opt.text}</span>
                      {showResult && opt.isCorrect && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />}
                      {showResult && isSelected && !opt.isCorrect && <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 shrink-0" />}
                    </div>
                    
                    {showResult && (opt.isCorrect || isSelected) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={cn("text-xs sm:text-sm mt-2 pt-3 sm:pt-4 border-t", opt.isCorrect ? "text-emerald-700 border-emerald-200" : "text-rose-700 border-rose-200")}>
                        {opt.feedback}
                        {opt.isCorrect && isSelected && <span className="block mt-1 font-bold">+50 XP</span>}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 sm:pt-4">
                <button onClick={generateScenario} className="w-full bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Next Scenario
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
