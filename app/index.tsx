
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING.';
  if (hour < 18) return 'GOOD AFTERNOON.';
  return 'GOOD EVENING.';
};

const getDayPeriod = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const day = days[now.getDay()];
  if (now.getHours() < 12) return `${day} morning`;
  if (now.getHours() < 18) return `${day} afternoon`;
  return `${day} evening`;
};

export default function Index() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Top spacing */}

      <View style={{ flex: 1.2 }} />

      {/* Day period label */}

      <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{getDayPeriod()}</Text>

      {/* Greeting */}

      <Text
        style={[
          styles.greeting,
          {
            color: colors.text,
            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
            fontSize: 36,
            letterSpacing: 4,
            fontWeight: '700',
          },
        ]}
      >
        {getGreeting()}
      </Text>

      {/* Center icon button */}

      <View style={styles.centerIconWrap}>
        <View
          style={[
            styles.centerIcon,
            {
              backgroundColor: isDark ? colors.text : colors.text,
              opacity: 0.08,
              borderColor: 'transparent',
            },
          ]}
        >
          <Ionicons name="star" size={32} color={isDark ? '#fff' : '#000'} />
        </View>
      </View>


      {/* Message */}
      <Text style={[styles.message, { color: colors.text, marginTop: 24 }]}> 
        <Text style={{ fontWeight: '700', color: colors.text }}>Nothing needs your attention</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: '400' }}> right now. Your{""}day is complete.</Text>
      </Text>


      <View style={{ flex: 2 }} />

      {/* Bottom nav bar */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: isDark ? colors.background : colors.background,
            borderColor: isDark ? '#222' : '#eee',
            shadowColor: isDark ? '#000' : '#aaa',
          },
        ]}
      >
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={28} color={colors.primary[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="message-circle" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="event-note" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome5 name="calendar-alt" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-sharp" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  subLabel: {
    fontSize: 15,
    marginBottom: 6,
    letterSpacing: 1.1,
    fontWeight: '400',
    opacity: 0.7,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 28,
    textAlign: 'center',
  },
  centerIconWrap: {
    alignItems: 'center',
    marginVertical: 18,
  },
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 32,
    lineHeight: 28,
    marginTop: 18,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '96%',
    alignSelf: 'center',
    borderRadius: 28,
    marginBottom: 18,
    paddingVertical: 12,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
});
