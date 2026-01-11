import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // REMOVED LABELS for reduced mental load
        
        // The Floating Glass Dock Style
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          height: 64,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 32, // Pill/Dock Shape
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          paddingBottom: 0, // Reset default padding
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
            height: 64,
            paddingTop: 14, // Center icons vertically within the dock
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      
      {/* 
         CENTERPIECE: The "Assistant" tab is now more distinctive. 
         This acts as the "Brain" of the dock.
      */}
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
                styles.assistantButton, 
                { backgroundColor: focused ? colors.primary[500] : (isDark ? '#334155' : '#E2E8F0') }
            ]}>
                <Ionicons name="sparkles" size={20} color={focused ? '#FFF' : colors.textSecondary} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons name={focused ? "file-tray-full" : "file-tray-full-outline"} size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons name={focused ? "options" : "options-outline"} size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    assistantButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        // Slight shadow to make it pop
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    }
});
