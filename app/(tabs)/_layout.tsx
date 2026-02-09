import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const transition = useRef(new Animated.Value(1)).current;
  const isFirst = useRef(true);

  useEffect(() => {
    // skip animation on first mount so the app doesn't flash
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    transition.setValue(0.4);
    Animated.timing(transition, {
      toValue: 1,
      duration: 280,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // CSS "ease"
      useNativeDriver: true,
    }).start();
  }, [pathname]);

  const animatedStyle = {
    opacity: transition.interpolate({
      inputRange: [0.4, 1],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateX: transition.interpolate({
          inputRange: [0.4, 1],
          outputRange: [12, 0],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const accent = isDark ? "#8b95b0" : "#6b7490";
  const muted = isDark ? "#908c88" : "#6a6662";
  const tabBg = isDark ? "#141416" : "#ffffff";
  const tabBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  /* Vector tab icon helper */
  const tabIcon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({
      color,
      size,
      focused,
    }: {
      color: string;
      size: number;
      focused: boolean;
    }) => <Ionicons name={name} size={size} color={color} />;

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: tabBg,
            borderTopWidth: 1,
            borderTopColor: tabBorder,
            elevation: 0,
            height: Platform.OS === "ios" ? 90 : 72,
            paddingTop: 6,
            paddingBottom: Platform.OS === "ios" ? 28 : 12,
          },
          tabBarIconStyle: {
            marginBottom: 0,
            height: 26,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
            marginTop: 0,
            marginBottom: 2,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: tabIcon("home-outline"),
          }}
        />

        <Tabs.Screen
          name="assistant"
          options={{
            title: "Copilot",
            tabBarIcon: tabIcon("chatbubble-outline"),
          }}
        />

        <Tabs.Screen
          name="inbox"
          options={{
            title: "Review",
            tabBarIcon: tabIcon("checkbox-outline"),
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: "Horizon",
            tabBarIcon: tabIcon("calendar-outline"),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: tabIcon("settings-outline"),
          }}
        />

        <Tabs.Screen
          name="connect-platforms"
          options={{
            href: null,
            title: "Connections",
          }}
        />
      </Tabs>
    </Animated.View>
  );
}
