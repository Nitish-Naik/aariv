/**
 * Background sync service for Aariv
 * Periodically refreshes inbox/actions data in background
 */
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { API_URL } from "./api";
import { getUserData } from "../utils/storage";
import { ensureValidToken } from "./tokenManager";

const SYNC_TASK_NAME = "aariv-background-sync";

/**
 * Define the background task
 */
TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  try {
    console.log("Background sync starting...");
    
    // Get user and ensure valid token
    const user = await getUserData("user");
    if (!user?.id) {
      console.log("No user logged in, skipping sync");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const token = await ensureValidToken();
    if (!token) {
      console.log("Token expired, skipping sync");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Fetch inbox and actions in background
    const [inboxRes, briefingRes] = await Promise.all([
      fetch(`${API_URL}/inbox?userId=${user.id}&filter=high_priority`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }),
      fetch(`${API_URL}/dashboard/briefing?userId=${user.id}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }),
    ]);

    if (!inboxRes.ok || !briefingRes.ok) {
      console.log("Background sync API error");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const inboxData = await inboxRes.json();
    const briefingData = await briefingRes.json();
    
    const messageCount = inboxData?.messages?.length || 0;
    const actionCount = briefingData?.actions?.length || 0;
    
    console.log(`Background sync completed: ${messageCount} messages, ${actionCount} actions`);

    // Store counts for badge
    await getUserData("badge_count"); // Can update badge here if needed
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register background sync task (call on app startup)
 */
export async function registerBackgroundSync() {
  try {
    // Check if task is already registered
    const registered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME);
    if (registered) {
      console.log("Background sync already registered");
      return;
    }

    // Register the task
    await BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
      minimumInterval: 15 * 60, // 15 minutes (minimum on iOS/Android)
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("Background sync registered");
  } catch (error) {
    console.error("Error registering background sync:", error);
  }
}

/**
 * Unregister background sync task
 */
export async function unregisterBackgroundSync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME);
    console.log("Background sync unregistered");
  } catch (error) {
    console.error("Error unregistering background sync:", error);
  }
}
