import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import api from "../lib/api";

/**
 * Request permission for push notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log("Push notifications are not supported on simulator/emulator");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return false;
  }

  return true;
}

/**
 * Get the Expo push token for the device
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    return token.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Register the push token with the server
 */
export async function registerPushToken(): Promise<boolean> {
  try {
    const token = await getPushToken();
    if (!token) {
      console.log("No push token available");
      return false;
    }

    console.log("Registering push token:", token);

    const response = await api.put("/users/push-token", {
      expoPushToken: token,
    });

    console.log("Push token registered successfully");
    return true;
  } catch (error) {
    console.error("Error registering push token:", error);
    return false;
  }
}

/**
 * Initialize notifications and register push token
 * Call this when the app starts and user is authenticated
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("Notification permission not granted");
      return;
    }

    // Register push token
    await registerPushToken();

    // Set up notification listeners
    setupNotificationListeners();
  } catch (error) {
    console.error("Error initializing notifications:", error);
  }
}

/**
 * Set up notification listeners for handling incoming notifications
 */
function setupNotificationListeners(): void {
  // Listen for notifications received when app is in foreground
  Notifications.addNotificationReceivedListener((notification) => {
    console.log("Notification received in foreground:", notification);
  });

  // Listen for notification interactions (user tapping on notification)
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("Notification response received:", response);

    // Handle navigation based on notification data
    const { data } = response.notification.request.content;

    if (data?.type === "course_generation_completed" && data?.courseId) {
      // Navigate to course page
      // This will be handled by the navigation system
      console.log("Should navigate to course:", data.courseId);
    }
  });
}

/**
 * Schedule a local notification (for testing or other purposes)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
      },
      trigger: trigger || null, // null means show immediately
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling local notification:", error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}
