import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useNotifications(userId: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && userId) {
        // Send to backend
        // Note: We use the same API endpoint but need to ensure it handles Expo tokens
        // or create a specific mobile endpoint. For now, we reuse the structure.
        fetch('https://apexrebate.com/api/user/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subscription: { endpoint: token, keys: { auth: 'expo', p256dh: 'expo' } }
          }),
        }).catch(err => console.error('Failed to sync push token', err));
      }
    });
  }, [userId]);

  return expoPushToken;
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id' // Should be in app.json
  })).data;

  return token;
}
