/**
 * Main App Navigator
 */

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { AssistantChatScreen } from "../screens/AssistantChatScreen";
import { ConnectPlatformsScreen } from "../screens/ConnectPlatformsScreen";
import { EditActionFormScreen } from "../screens/EditActionFormScreen";
import { ExecutionStatusScreen } from "../screens/ExecutionStatusScreen";
import { HomeDashboard } from "../screens/HomeDashboard";
import { PermissionsManagerScreen } from "../screens/PermissionsManagerScreen";
import { ReviewQueueScreen } from "../screens/ReviewQueueScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { TeamHubScreen } from "../screens/TeamHubScreen";
import { UnifiedCalendarScreen } from "../screens/UnifiedCalendarScreen";
import { UnifiedInboxScreen } from "../screens/UnifiedInboxScreen";
// Auth imports removed for UI review - will be added back when backend is ready
import { colors } from "../theme";
import type {
    ActionItem,
    CalendarEvent,
    ChatMessage,
    InboxItem,
    PlatformConnection,
} from "../types";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Mock data - in production, this would come from your backend/state management
const mockConnections: PlatformConnection[] = [
  {
    id: "1",
    platform: "gmail",
    name: "Gmail",
    icon: "gmail",
    connected: true,
    connectedAt: new Date(),
    permissions: ["read:email", "write:email"],
  },
  {
    id: "2",
    platform: "google-calendar",
    name: "Google Calendar",
    icon: "calendar",
    connected: true,
    connectedAt: new Date(),
    permissions: ["read:calendar", "write:calendar"],
  },
  {
    id: "3",
    platform: "slack",
    name: "Slack",
    icon: "slack",
    connected: false,
    permissions: ["read:messages", "write:messages"],
  },
  {
    id: "4",
    platform: "notion",
    name: "Notion",
    icon: "notion",
    connected: true,
    connectedAt: new Date(),
    permissions: ["read", "write"],
  },
  {
    id: "5",
    platform: "linear",
    name: "Linear",
    icon: "linear",
    connected: false,
    permissions: ["read:issues", "write:issues"],
  },
];

const mockActions: ActionItem[] = [
  {
    id: "action-1",
    type: "email",
    title: "Reply to team standup email",
    description:
      "Send a brief update about yesterday's progress and today's priorities",
    platform: "gmail",
    proposedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "pending",
    requiresApproval: true,
  },
  {
    id: "action-2",
    type: "calendar",
    title: "Schedule follow-up meeting",
    description: "Book a 30-minute slot with the design team next week",
    platform: "google-calendar",
    proposedAt: new Date(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: "pending",
    requiresApproval: true,
  },
  {
    id: "action-3",
    type: "slack",
    title: "Update project channel",
    description: "Post status update in #project-alpha channel",
    platform: "slack",
    proposedAt: new Date(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    status: "pending",
    requiresApproval: true,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Team Standup",
    description: "Daily sync with the team",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
    platform: "google-calendar",
    color: "#4285F4",
  },
  {
    id: "event-2",
    title: "Design Review",
    description: "Review new UI mockups",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    platform: "google-calendar",
    color: "#EA4335",
  },
];

const mockInbox: InboxItem[] = [
  {
    id: "inbox-1",
    platform: "gmail",
    from: "team@company.com",
    subject: "Weekly team update",
    preview: "Here's what happened this week...",
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: true,
    priority: "medium",
  },
  {
    id: "inbox-2",
    platform: "slack",
    from: "#general",
    subject: "New project announcement",
    preview: "We're excited to announce...",
    receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    unread: true,
    priority: "high",
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "I've prepared a few options for you. Swipe to delegate when you're ready.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    suggestions: [
      "Show me pending actions",
      "What's on my calendar today?",
      "Suggest actions for my inbox",
    ],
  },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Inbox") {
            iconName = focused ? "mail" : "mail-outline";
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Inbox" component={InboxStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  const [connections, setConnections] =
    useState<PlatformConnection[]>(mockConnections);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard">
        {({ navigation }) => (
          <HomeDashboard
            connections={connections}
            pendingActions={mockActions.filter((a) => a.status === "pending")}
            onNavigateToQueue={() => navigation.navigate("ReviewQueue")}
            onNavigateToCalendar={() => navigation.navigate("Calendar")}
            onNavigateToInbox={() => navigation.navigate("Inbox")}
            onNavigateToSettings={() => navigation.navigate("Settings")}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ReviewQueue">
        {({ navigation }) => (
          <ReviewQueueScreen
            actions={mockActions}
            onApprove={(id) => console.log("Approve", id)}
            onReject={(id) => console.log("Reject", id)}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ConnectPlatforms">
        {({ navigation }) => (
          <ConnectPlatformsScreen
            connections={connections}
            onConnect={async (platform) => {
              console.log("Connect", platform);
              // In a real app, you'd call the API here and refresh connections
            }}
            onDisconnect={async (platform) => {
              console.log("Disconnect", platform);
              // Optimistic update for UI demo
              setConnections((prev) =>
                prev.map((c) =>
                  c.platform === platform ? { ...c, connected: false } : c,
                ),
              );

              // In Real App with Backend:
              // try {
              //   await api.post('/integrations/disconnect', { userId: 'current-user-id', appName: platform });
              // } catch (e) { ... }
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UnifiedCalendar">
        {({ navigation }) => (
          <UnifiedCalendarScreen
            events={mockEvents}
            onEventPress={(event) => {
              navigation.navigate("EditAction", {
                action: {
                  id: event.id,
                  type: "calendar",
                  title: event.title,
                  description: event.description || "",
                  platform: event.platform,
                  proposedAt: new Date(),
                  expiresAt: new Date(),
                  status: "pending",
                  requiresApproval: true,
                },
              });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function InboxStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UnifiedInbox">
        {({ navigation }) => (
          <UnifiedInboxScreen
            items={mockInbox}
            onItemPress={(item) => console.log("Item pressed", item)}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AssistantChat">
        {({ navigation }) => (
          <AssistantChatScreen
            messages={mockMessages}
            onSendMessage={(message) => console.log("Send", message)}
            onSuggestActions={() => console.log("Suggest actions")}
            onApproveAction={(id) => console.log("Approve action", id)}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain">
        {({ navigation }) => (
          <SettingsScreen
            onSignOut={() => navigation.navigate("Login")}
            onBack={() => navigation.goBack()}
            onNavigateToKeyVault={() => {
              // KeyVault screen not yet implemented
              console.log("Navigate to KeyVault");
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PermissionsManager">
        {({ navigation }) => (
          <PermissionsManagerScreen
            connections={mockConnections}
            onUpdatePermissions={async (id, permissions) => {
              console.log("Update permissions", id, permissions);
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  // Skip authentication for UI review - go straight to main app
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="EditAction">
          {({ route, navigation }: any) => (
            <EditActionFormScreen
              action={route.params?.action}
              onSave={(action) => {
                console.log("Save action", action);
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ExecutionStatus">
          {({ route, navigation }: any) => (
            <ExecutionStatusScreen
              action={route.params?.action}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="TeamHub">
          {({ navigation }) => (
            <TeamHubScreen
              updates={[]}
              onUpdatePress={(update) => console.log("Update pressed", update)}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
