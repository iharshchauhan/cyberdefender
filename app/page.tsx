'use client';
import Link from 'next/link';
import { MailWarning, UserX, GlobeLock, LockKeyhole, EyeOff, CodeXml, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '@/lib/store';

const missions = [
  { id: 'phishing', name: 'Spot the Phish', desc: 'Identify fake emails and texts.', icon: MailWarning, color: 'bg-blue-500', href: '/phishing' },
  { id: 'fraud', name: 'CEO Fraud', desc: 'Don\'t get tricked by the boss.', icon: UserX, color: 'bg-rose-500', href: '/executive-fraud' },
  { id: 'watering-hole', name: 'Safe Browsing', desc: 'Spot compromised websites.', icon: GlobeLock, color: 'bg-amber-500', href: '/watering-hole' },
  { id: 'general', name: 'Security Basics', desc: 'Everyday security habits.', icon: LockKeyhole, color: 'bg-emerald-500', href: '/general' },
  { id: 'privacy', name: 'Data Privacy', desc: 'Keep sensitive info safe.', icon: EyeOff, color: 'bg-violet-500', href: '/privacy' },
  { id: 'coding', name: 'Secure Code', desc: 'Fix vulnerable code snippets.', icon: CodeXml, color: 'bg-slate-700', href: '/secure-coding' },
];

export default function Home() {
  const { name, level, xp, isLoaded } = useUser();
  const currentLevelXp = xp % 200;
  const progress = (currentLevelXp / 200) * 100;

  if (!isLoaded) return null;

  return (
    <div className="space-y-10 pb-12">
      <div className="text-center space-y-6 mt-4 sm:mt-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Ready for your next mission{name ? `, ${name}` : ''}?
        </h1>
        
        <div className="max-w-md mx-auto bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between text-sm font-bold text-slate-500 mb-2 px-2">
            <span>Level {level}</span>
            <span>{currentLevelXp} / 200 XP</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progress}%` }} 
              className="h-full bg-violet-500 rounded-full"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {missions.map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-full"
          >
            <Link href={mission.href} className="block group h-full">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-slate-200 h-full flex flex-col">
                <div className={`${mission.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <mission.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{mission.name}</h3>
                <p className="text-slate-500 flex-1">{mission.desc}</p>
                <div className="mt-6 flex items-center text-violet-600 font-bold text-sm">
                  Play Mission <Play className="w-4 h-4 ml-1 fill-current" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
