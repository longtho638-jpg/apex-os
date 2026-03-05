'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSupabaseClientSide } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'AMBIENT' | 'NECTAR' | 'CRITICAL';
  title: string;
  message: string;
  is_read: boolean;
}

export function ResonanceBell() {
  const [_notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = getSupabaseClientSide();

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }

      // Subscribe to Realtime
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Trigger Toast based on type
            if (newNotif.type === 'CRITICAL') {
              toast.error(newNotif.title, { description: newNotif.message, duration: 10000 });
            } else if (newNotif.type === 'NECTAR') {
              toast.success(newNotif.title, { description: newNotif.message, duration: 5000 });
            } else {
              toast(newNotif.title, { description: newNotif.message });
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchNotifications();
  }, [supabase.channel, supabase.from, supabase.auth.getUser, supabase.removeChannel]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#00FF94]' : 'text-gray-400'}`} />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 w-2 h-2 bg-[#00FF94] rounded-full"
            >
              <span className="absolute inset-0 rounded-full bg-[#00FF94] animate-ping opacity-75"></span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
