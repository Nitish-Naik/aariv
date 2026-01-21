/**
 * Notifications service for Aariv
 * Handles push notification setup and scheduling
 */
import { useEffect, useState } from "react";

// Safely import expo-notifications to avoid crashes if native module is missing
let Notifications: any;
try {
  Notifications = require("expo-notifications");
} catch (error) {
  console.warn("expo-notifications module could not be loaded:", error);
}

// Configure notification behavior
if (Notifications && Notifications.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions and get push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) {
    console.warn("Notifications module not available, skipping registration");
    return null;
  }

  try {
    // Get existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permission if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    // Get push token with project ID
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '13504cd7-834a-4f1a-b437-056e6e7642e3',
    });
    console.log("Expo push token:", token.data);
    return token.data;
  } catch (error) {
    console.error("Error registering for notifications:", error);
    // Continue execution even if notifications fail (e.g. in simulator)
    return null;
  }
}

/**
 * Send a local notification (for demo/testing)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  delaySeconds = 5,
) {
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { deepLink: "aariv://" },
      },
      trigger: { seconds: delaySeconds },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

/**
 * Hook to handle notification responses (when user taps notification)
 */
export function useNotificationHandler() {
  // Use 'any' specifically to avoid type reference issues if imports fail
  const [lastNotification, setLastNotification] = useState<any>();

  useEffect(() => {
    if (!Notifications || !Notifications.addNotificationResponseReceivedListener) return;

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        setLastNotification(response.notification);
        // Handle deep linking or action based on notification.request.content.data
        const deepLink = response.notification.request.content.data?.deepLink;
        if (deepLink) {
          console.log("Navigating to:", deepLink);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return lastNotification;
}

/**
 * Schedule daily briefing notification
 */
export async function scheduleDailyBriefing(hour = 8, minute = 0) {
  if (!Notifications) return;

  try {
    const trigger = new Date();
    trigger.setHours(hour, minute, 0);

    // If time already passed today, schedule for tomorrow
    if (trigger < new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Daily Briefing",
        body: "Check your inbox and upcoming meetings",
        data: { deepLink: "aariv://inbox" },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (error) {
    console.error("Error scheduling daily briefing:", error);
  }
}
