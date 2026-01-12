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
        tabBarShowLabel: false, 

        // "Invisible Floor" - Pure Minimalist
        // No background, no borders, just icons floating.
        // The ultimate "Quiet UI".
        
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)', // Slight transp for glass effect
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65, // Standard height
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarActiveTintColor: colors.primary[500], 
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Central "AI" Button - Clean, Static, Minimal */}
      <Tabs.Screen
        name="assistant"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: focused ? colors.primary[500] : (isDark ? '#333' : '#f0f0f0'),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
               <Ionicons 
                    name="sparkles" 
                    size={24} 
                    color={focused ? "#FFFFFF" : colors.textSecondary} 
                />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "file-tray-full" : "file-tray-outline"} 
              size={28} 
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={28} 
              color={color} 
            />
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
    width: 60,
  }
});