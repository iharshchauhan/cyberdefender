'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type UserState = {
  name: string;
  xp: number;
  level: number;
  streak: number;
  setName: (name: string) => void;
  addXp: (amount: number) => void;
  isLoaded: boolean;
  showLevelUp: boolean;
  closeLevelUp: () => void;
};

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('safesurf_user');
    if (stored) {
      const data = JSON.parse(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNameState(data.name || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setXp(data.xp || 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLevel(data.level || 1);
      
      const today = new Date().toDateString();
      const last = data.lastPlayed;
      let currentStreak = data.streak || 0;
      
      if (last) {
        if (last !== today) {
          const lastDate = new Date(last);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate.toDateString() === yesterday.toDateString()) {
            currentStreak += 1;
          } else {
            currentStreak = 1; // Reset streak if missed a day
          }
        }
      } else {
        currentStreak = 1;
      }
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreak(currentStreak);
      localStorage.setItem('safesurf_user', JSON.stringify({ ...data, streak: currentStreak, lastPlayed: today }));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const save = (newData: any) => {
    const today = new Date().toDateString();
    localStorage.setItem('safesurf_user', JSON.stringify({ ...newData, lastPlayed: today }));
  };

  const setName = (newName: string) => {
    setNameState(newName);
    setStreak(1);
    save({ name: newName, xp, level, streak: 1 });
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      const newLevel = Math.floor(newXp / 200) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setShowLevelUp(true);
      }
      save({ name, xp: newXp, level: newLevel, streak });
      return newXp;
    });
  };

  return (
    <UserContext.Provider value={{ name, xp, level, streak, setName, addXp, isLoaded, showLevelUp, closeLevelUp: () => setShowLevelUp(false) }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
