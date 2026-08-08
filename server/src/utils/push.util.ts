import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import User from '../models/user.model';

const expo = new Expo();

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!Expo.isExpoPushToken(pushToken)) {
    return;
  }

  const messages: ExpoPushMessage[] = [
    {
      to: pushToken,
      title,
      body,
      data,
      sound: 'default' as const,
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const user = await User.findById(userId);
  if (!user?.expoPushToken) return;

  const pushEnabled = user.settings?.pushNotifications !== false;
  if (!pushEnabled) return;

  await sendPushNotification(user.expoPushToken, title, body, data);
}

export async function sendPushToAllUsers(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const users = await User.find({ expoPushToken: { $ne: '', $exists: true } });
  for (const user of users) {
    const pushEnabled = user.settings?.pushNotifications !== false;
    if (pushEnabled && user.expoPushToken) {
      await sendPushNotification(user.expoPushToken, title, body, data);
    }
  }
}
