'use client';
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CodeXml, Bug, ShieldCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@/lib/store';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const DEFAULT_SCENARIO = {
  title: "SQL Injection",
  description: "A login function that checks a user's credentials against a database.",
  language: "JavaScript (Node.js)",
  vulnerableCode: "const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;\ndb.execute(query);",
  vulnerabilityType: "Injection",
  options: [
    { id: "a", code: "const query = `SELECT * FROM users WHERE username = '${escape(username)}' AND password = '${escape(password)}'`;\ndb.execute(query);", isCorrect: false, explanation: "Manual escaping is error-prone and often insufficient to prevent all injection vectors." },
    { id: "b", code: "const query = 'SELECT * FROM users WHERE username = ? AND password = ?';\ndb.execute(query, [username, password]);", isCorrect: true, explanation: "Using parameterized queries (prepared statements) ensures the database treats the input as data, not executable code." },
    { id: "c", code: "const query = `SELECT * FROM users WHERE username = '${username.replace(/'/g, \"\")}' AND password = '${password.replace(/'/g, \"\")}'`;\ndb.execute(query);", isCorrect: false, explanation: "Simple string replacement can be bypassed and doesn't address the root cause of the vulnerability." }
  ]
};

export default function SecureCoding() {
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
        contents: `Generate a short secure coding challenge based on OWASP Top 10. Return JSON with: title, description, language, vulnerableCode, vulnerabilityType, options (array of 3 objects with id, code, isCorrect, explanation).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING }, description: { type: Type.STRING }, language: { type: Type.STRING },
              vulnerableCode: { type: Type.STRING }, vulnerabilityType: { type: Type.STRING },
              options: {
                type: Type.ARRAY, items: {
                  type: Type.OBJECT, properties: { id: { type: Type.STRING }, code: { type: Type.STRING }, isCorrect: { type: Type.BOOLEAN }, explanation: { type: Type.STRING } },
                  required: ['id', 'code', 'isCorrect', 'explanation']
                }
              }
            },
            required: ['title', 'description', 'language', 'vulnerableCode', 'vulnerabilityType', 'options'],
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
      addXp(75);
      setAwarded(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Secure Code</h1>
        <p className="text-slate-500 text-sm sm:text-base">Find the bug and fix the code.</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-slate-700 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Generating vulnerable code...</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Bug className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                  <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">{scenario.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {scenario.language}
                  </span>
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-rose-200">
                    {scenario.vulnerabilityType}
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  {scenario.description}
                </p>
                <div className="bg-slate-900 rounded-2xl p-3 sm:p-4 overflow-x-auto border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1 sm:gap-1.5">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Vulnerable Code
                    </span>
                  </div>
                  <pre className="text-xs sm:text-sm font-mono text-slate-300 whitespace-pre-wrap">
                    <code>{scenario.vulnerableCode}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">How would you fix it?</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {scenario.options.map((option: any) => {
                  const isSelected = selectedOption === option.id;
                  const showResult = selectedOption !== null;
                  
                  let containerClass = "bg-white border-slate-200 hover:border-slate-400 cursor-pointer";
                  let headerClass = "bg-slate-50 border-b border-slate-100";
                  let codeBgClass = "bg-white";
                  
                  if (showResult) {
                    containerClass = "cursor-default";
                    if (option.isCorrect) {
                      containerClass += " border-emerald-500 ring-2 ring-emerald-500";
                      headerClass = "bg-emerald-50 border-b border-emerald-200";
                      codeBgClass = "bg-emerald-50/30";
                    } else if (isSelected && !option.isCorrect) {
                      containerClass += " border-rose-500 ring-2 ring-rose-500";
                      headerClass = "bg-rose-50 border-b border-rose-200";
                      codeBgClass = "bg-rose-50/30";
                    } else {
                      containerClass += " opacity-50";
                    }
                  } else if (isSelected) {
                    containerClass += " border-slate-500 ring-2 ring-slate-500";
                    headerClass = "bg-slate-100 border-b border-slate-200";
                  }

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      className={cn("rounded-3xl border-2 transition-all duration-200 overflow-hidden", containerClass)}
                    >
                      <div className={cn("px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between", headerClass)}>
                        <span className="font-extrabold text-slate-700 text-sm sm:text-base">Option {option.id.toUpperCase()}</span>
                        {showResult && option.isCorrect && <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
                        {showResult && isSelected && !option.isCorrect && <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />}
                      </div>
                      <div className={cn("p-4 sm:p-6 overflow-x-auto", codeBgClass)}>
                        <pre className="text-xs sm:text-sm font-mono text-slate-800 whitespace-pre-wrap">
                          <code>{option.code}</code>
                        </pre>
                      </div>
                      
                      {showResult && (option.isCorrect || isSelected) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={cn("px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm border-t font-medium", option.isCorrect ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200")}>
                          <span className="font-extrabold">Why: </span>{option.explanation}
                          {option.isCorrect && isSelected && <span className="block mt-1 font-bold">+75 XP</span>}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedOption !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 sm:pt-4">
                <button onClick={generateScenario} className="w-full bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Next Challenge
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
