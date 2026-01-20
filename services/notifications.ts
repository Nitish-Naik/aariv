/**
 * Notifications service for Aariv
 * Handles push notification setup and scheduling
 */
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and get push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
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
  const [lastNotification, setLastNotification] = useState<
    Notifications.Notification | undefined
  >();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
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
