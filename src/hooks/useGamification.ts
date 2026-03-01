import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useGamification() {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelXp, setNextLevelXp] = useState(100);

  const calculateLevel = useCallback((currentXp: number) => {
    const newLevel = Math.floor(Math.sqrt(currentXp / 100)) + 1;
    setLevel(newLevel);
    setNextLevelXp(newLevel ** 2 * 100);
  }, []);

  useEffect(() => {
    if (!user) return;
    const storedXp = parseInt(localStorage.getItem(`xp_${user.id}`) || '0', 10);
    setXp(storedXp);
    calculateLevel(storedXp);
  }, [user, calculateLevel]);

  const awardXP = (amount: number, reason: string) => {
    if (!user) return;

    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem(`xp_${user.id}`, newXp.toString());

    const oldLevel = level;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    if (newLevel > oldLevel) {
      toast.success(`Level UP! You are now Level ${newLevel}`, {
        description: 'Unlocked new perks and higher limits!',
        duration: 5000,
        className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none',
      });
      try {
        new Audio('/sounds/levelup.mp3').play().catch(() => {});
      } catch (_e) {}
    } else {
      toast.success(`+${amount} XP: ${reason}`, {
        className: 'bg-blue-500/10 border-blue-500 text-blue-400',
      });
    }

    calculateLevel(newXp);
  };

  return { xp, level, nextLevelXp, awardXP };
}
