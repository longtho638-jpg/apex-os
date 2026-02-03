import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
      // run only in browser
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        reg.pushManager.getSubscription().then(sub => {
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  const subscribeToPush = async (userId: string) => {
    if (!registration || !VAPID_PUBLIC_KEY) return;

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Send subscription to backend
      await fetch('/api/user/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, userId }),
      });

      logger.info('Web Push Subscribed!');
    } catch (error) {
      logger.error('Failed to subscribe to Push', error);
    }
  };

  return { isSubscribed, subscribeToPush };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
