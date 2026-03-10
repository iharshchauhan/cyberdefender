'use client';
import Link from 'next/link';
import { Shield, Flame, Star, Trophy } from 'lucide-react';
import { useUser } from '@/lib/store';

export function Navbar() {
  const { name, xp, level, streak, isLoaded } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="bg-violet-500 p-2 rounded-xl shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">SafeSurf</span>
        </Link>
        
        {isLoaded && name && (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 text-orange-500 font-bold bg-orange-50 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm" title="Daily Streak">
              <Flame className="w-4 h-4" /> {streak}
            </div>
            <div className="flex items-center gap-1.5 text-violet-600 font-bold bg-violet-50 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm" title="Total XP">
              <Star className="w-4 h-4" /> {xp}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm" title="Current Level">
              <Trophy className="w-4 h-4" /> <span className="hidden sm:inline">Lvl</span> {level}
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ml-1">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
