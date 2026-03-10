'use client';
import { useState } from 'react';
import { EyeOff, FileText, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@/lib/store';

const DEFAULT_SCENARIO = [
  { id: "1", name: "Customer Credit Card Numbers", description: "A database export containing full credit card numbers and CVVs.", classification: "Restricted", explanation: "Credit card data is highly regulated (PCI-DSS) and must be strictly restricted." },
  { id: "2", name: "Company Public Website Source Code", description: "The HTML and CSS for the company's public landing page.", classification: "Public", explanation: "This code is already sent to every visitor's browser, so it is public." },
  { id: "3", name: "Employee Salary Database", description: "A spreadsheet containing the names and salaries of all employees.", classification: "Confidential", explanation: "Salary information should only be accessible to HR and specific management." },
  { id: "4", name: "Internal Phone Directory", description: "A list of employee names and their internal desk phone extensions.", classification: "Internal", explanation: "While not highly sensitive, this shouldn't be shared outside the company." },
  { id: "5", name: "Q4 Marketing Strategy", description: "The upcoming marketing campaigns for the next quarter, not yet announced.", classification: "Confidential", explanation: "Premature release could harm competitive advantage." }
];

export default function PrivacyAwareness() {
  const { addXp } = useUser();
  const [items, setItems] = useState<any[]>(DEFAULT_SCENARIO);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const generateExercise = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setAwarded(false);
    try {
      const response = await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'privacy' }),
      });
      if (!response.ok) throw new Error('Failed to generate exercise');
      const data = await response.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClassify = (classification: string) => {
    const currentItem = items[currentIndex];
    const newAnswers: Record<string, string> = { ...userAnswers, [currentItem.id]: classification };
    setUserAnswers(newAnswers);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
      if (!awarded) {
        const correctCount = items.filter(i => i.classification === newAnswers[i.id as string]).length;
        addXp(correctCount * 20);
        setAwarded(true);
      }
    }
  };

  const classifications = [
    { name: 'Public', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200', desc: 'Available to anyone' },
    { name: 'Internal', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', desc: 'Employees only' },
    { name: 'Confidential', color: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200', desc: 'Specific groups/roles' },
    { name: 'Restricted', color: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200', desc: 'Highly sensitive/regulated' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Data Privacy</h1>
        <p className="text-slate-500 text-sm sm:text-base">Swipe to classify the data correctly.</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Preparing new data sets...</p>
          </motion.div>
        ) : !showResults ? (
          <motion.div key="exercise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                Item {currentIndex + 1} of {items.length}
              </span>
              <div className="flex gap-1 sm:gap-1.5">
                {items.map((_, idx) => (
                  <div key={idx} className={cn("h-2 sm:h-2.5 w-6 sm:w-8 rounded-full transition-colors", idx === currentIndex ? "bg-violet-500" : idx < currentIndex ? "bg-violet-200" : "bg-slate-200")} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 text-center min-h-[200px] sm:min-h-[250px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">{items[currentIndex].name}</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">{items[currentIndex].description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {classifications.map((cls) => (
                <button key={cls.name} onClick={() => handleClassify(cls.name)} className={cn("p-4 sm:p-6 rounded-3xl border-2 transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1 sm:gap-2 text-center", cls.color)}>
                  <span className="font-extrabold text-lg sm:text-xl">{cls.name}</span>
                  <span className="text-xs sm:text-sm font-medium opacity-80">{cls.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Results</h3>
                <div className="text-base sm:text-lg font-bold text-violet-600 bg-violet-100 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                  Score: {items.filter(i => i.classification === userAnswers[i.id]).length} / {items.length}
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isCorrect = item.classification === userAnswers[item.id];
                  return (
                    <li key={item.id} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base sm:text-lg">{item.name}</h4>
                          <p className="text-slate-500 mt-1 text-sm sm:text-base">{item.description}</p>
                        </div>
                        {isCorrect ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 shrink-0" /> : <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 shrink-0" />}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">You said:</span>
                          <span className={cn("px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg", isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>{userAnswers[item.id]}</span>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Correct:</span>
                            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 text-slate-800">{item.classification}</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl text-xs sm:text-sm text-slate-600">
                        <span className="font-bold text-slate-900">Why? </span>{item.explanation}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button onClick={generateExercise} className="w-full bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Play Again with AI
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
