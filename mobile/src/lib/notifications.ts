import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

/**
 * Android notification channels. Declaring them separately lets users mute
 * reminders without losing achievement or announcement notifications — on
 * Android a single channel is all-or-nothing, and people who can't mute the
 * noisy category just disable everything.
 */
const CHANNELS = [
  { id: 'reminders', name: 'Study reminders', description: 'Daily study nudges and streak alerts' },
  { id: 'achievements', name: 'Achievements', description: 'Streak milestones and course completions' },
  { id: 'announcements', name: 'Announcements', description: 'New courses and platform updates' },
] as const;

/** Identifier for the locally scheduled daily reminder, so we can replace it. */
const LOCAL_REMINDER_ID = 'sabilearn-daily-reminder';

// SDK 57's NotificationBehavior: banner and list replaced the old
// `shouldShowAlert`, which is silently ignored if passed.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  for (const channel of CHANNELS) {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      description: channel.description,
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#F2A900',
    });
  }
}

/** Minutes ahead of UTC — the inverse of getTimezoneOffset's sign convention. */
function timezoneOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

/**
 * Whether the OS will currently deliver notifications, without prompting.
 * Use this to decide if the soft-ask is worth showing.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Registers for push and syncs the token to the server.
 *
 * Call this *after* the user has seen value in the app rather than on first
 * launch — iOS only ever shows the system prompt once, so a denial at cold
 * start is permanent until the user digs through Settings.
 *
 * @returns the Expo push token, or null if unavailable or denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // Push tokens are not issued to simulators; bail before the prompt so we
  // don't burn the one-shot permission dialog during development.
  if (!Device.isDevice) return null;

  await ensureAndroidChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
  } catch (error) {
    console.warn('Failed to get Expo push token:', error);
    return null;
  }

  try {
    // The offset rides along with every registration so the server's reminder
    // schedule follows the user across timezones and DST without extra calls.
    await api.post('/users/me/push-token', {
      token,
      timezoneOffset: timezoneOffsetMinutes(),
    });
  } catch {
    // Non-fatal: the token is still valid locally and will resync next launch.
  }

  return token;
}

/**
 * The backend serves both the web app and this mobile app, so push payload
 * `actionUrl` values are web paths (e.g. `/dashboard/courses`). This maps
 * known web paths to their mobile expo-router equivalents, falling back to
 * the courses tab for anything unrecognized.
 */
export function mapActionUrlToMobileRoute(url?: string | null): string {
  if (!url) return '/(tabs)/courses';

  const courseTopicMatch = url.match(/^\/dashboard\/courses\/([^/]+)\/topics\/([^/?#]+)/);
  if (courseTopicMatch) return `/course/${courseTopicMatch[1]}/topic/${courseTopicMatch[2]}`;

  const courseMatch = url.match(/^\/dashboard\/courses\/([^/?#]+)/);
  if (courseMatch) return `/course/${courseMatch[1]}`;

  if (url.startsWith('/dashboard/courses')) return '/(tabs)/courses';
  if (url.startsWith('/dashboard/progress')) return '/(tabs)/progress';
  if (url.startsWith('/dashboard/notifications')) return '/notifications';
  if (url.startsWith('/dashboard/profile') || url.startsWith('/dashboard/settings')) return '/settings';
  if (url.startsWith('/dashboard')) return '/(tabs)';

  return '/(tabs)/courses';
}

export function setupNotificationHandlers(
  onNotificationTap?: (mobileRoute: string, data: any) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as { actionUrl?: string } | undefined;
      const mobileRoute = mapActionUrlToMobileRoute(data?.actionUrl);
      onNotificationTap?.(mobileRoute, data);
    }
  );

  return () => subscription.remove();
}

/**
 * Schedules an on-device daily reminder as a backstop.
 *
 * The server drives the real reminders, but a local one still fires when the
 * device is offline, the push token has been invalidated, or the backend is
 * down — the cases where a study app most needs to not go silent. Replacing
 * the fixed identifier keeps exactly one scheduled at a time.
 */
export async function scheduleLocalDailyReminder(
  hour: number,
  minute: number
): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!(await hasNotificationPermission())) return;

  await cancelLocalDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: LOCAL_REMINDER_ID,
    content: {
      title: 'Time to study',
      body: 'A few minutes of flashcards keeps your progress moving.',
      data: { actionUrl: '/(tabs)/courses', category: 'reminder', source: 'local' },
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelLocalDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(LOCAL_REMINDER_ID);
  } catch {
    // Nothing was scheduled under that identifier — fine.
  }
}

/** Mirrors the unread count onto the app icon badge. */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch {
    // Badge permission not granted; not worth surfacing.
  }
}
