/**
 * Background sync service for Aariv
 * Periodically refreshes inbox/actions data in background
 */
/**
 * Background sync service (guarded) to avoid requiring native modules at module load.
 *
 * Some development builds or Expo Go may not include `expo-task-manager` /
 * `expo-background-fetch` native modules. We use safe requires to
 * only register the task if the native modules are available. This prevents
 * crashes during app initialization when the native module isn't present.
 */
import { getUserData } from "../utils/storage";
import { API_URL } from "./api";
import { ensureValidToken } from "./tokenManager";

const SYNC_TASK_NAME = "aariv-background-sync";

// Safely require native modules
let BackgroundFetch: any;
let TaskManager: any;

try {
  BackgroundFetch = require("expo-background-fetch");
  TaskManager = require("expo-task-manager");
} catch (e) {
  console.log("Background sync native modules not available:", e);
}

// Define specific types/results locally if needed since we are using 'any' for modules
// But we can just use safe navigation for simplicity in this patch

async function runBackgroundSync(): Promise<any> {
  if (!BackgroundFetch || !TaskManager) {
    console.log(
      "Background sync native modules not available; skipping task run",
    );
    return null; // Return null if modules missing
  }

  try {
    console.log("Background sync starting...");

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

    const [inboxRes, briefingRes] = await Promise.all([
      fetch(`${API_URL}/inbox?userId=${user.id}&filter=high_priority`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`${API_URL}/dashboard/briefing?userId=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

    console.log(
      `Background sync completed: ${messageCount} messages, ${actionCount} actions`,
    );

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch?.BackgroundFetchResult?.Failed;
  }
}

/**
 * Register background sync task (call on app startup). Returns false if not supported.
 */
export async function registerBackgroundSync() {
  if (!BackgroundFetch || !TaskManager) {
    console.log("Background sync not available in this native client");
    return false;
  }

  try {
    // Define the task only once (TaskManager.defineTask must be called before register)
    try {
      if (TaskManager.defineTask) {
        TaskManager.defineTask(SYNC_TASK_NAME, async () => {
          return await runBackgroundSync();
        });
      }
    } catch (e) {
      // defining twice throws; ignore
    }

    // Check if task is already registered using safe call
    let registered = false;
    if (TaskManager.isTaskRegisteredAsync) {
      registered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME);
    }

    if (registered) {
      console.log("Background sync already registered");
      return true;
    }

    if (BackgroundFetch.registerTaskAsync) {
      await BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background sync registered");
      return true;
    }
    return false;

  } catch (error) {
    console.error("Error registering background sync:", error);
    return false;
  }
}

export async function unregisterBackgroundSync() {
  if (!BackgroundFetch) return false;
  try {
    if (BackgroundFetch.unregisterTaskAsync) {
      await BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME);
      console.log("Background sync unregistered");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error unregistering background sync:", error);
    return false;
  }
}
