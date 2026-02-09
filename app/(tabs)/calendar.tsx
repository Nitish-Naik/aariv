import { addDays } from "date-fns";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

/* ─── Palette ─── */
const pal = (isDark: boolean) => ({
  bgDeep: isDark ? "#0c0c0e" : "#f7f6f4",
  bgCard: isDark ? "#141416" : "#ffffff",
  bgElevated: isDark ? "#1a1a1d" : "#ffffff",
  accent: isDark ? "#8b95b0" : "#6b7490",
  textPrimary: isDark ? "#e4e2df" : "#1a1918",
  textSecondary: isDark ? "#908c88" : "#6a6662",
  textMuted: isDark ? "#5a5754" : "#9a9794",
  border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
});

const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  status?: string;
  isAllDay?: boolean;
}

const MOCK_EVENTS_TODAY: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    description: "Zoom",
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 30, 0, 0)),
    location: "Zoom",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Lunch with Mike",
    description: "The Mill",
    startTime: new Date(new Date().setHours(13, 0, 0, 0)),
    endTime: new Date(new Date().setHours(14, 0, 0, 0)),
    location: "The Mill",
    status: "confirmed",
  },
  {
    id: "3",
    title: "Focus block",
    description: "Deep work",
    startTime: new Date(new Date().setHours(15, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    status: "tentative",
  },
];

const MOCK_EVENTS_TOMORROW: CalendarEvent[] = [
  {
    id: "t1",
    title: "Design Review",
    startTime: (() => {
      const d = addDays(new Date(), 1);
      d.setHours(9, 0, 0, 0);
      return d;
    })(),
    endTime: (() => {
      const d = addDays(new Date(), 1);
      d.setHours(10, 0, 0, 0);
      return d;
    })(),
    location: "Room 302",
    status: "confirmed",
  },
  {
    id: "t2",
    title: "1:1 with Lisa",
    startTime: (() => {
      const d = addDays(new Date(), 1);
      d.setHours(11, 0, 0, 0);
      return d;
    })(),
    endTime: (() => {
      const d = addDays(new Date(), 1);
      d.setHours(11, 30, 0, 0);
      return d;
    })(),
    location: "Zoom",
    status: "confirmed",
  },
  {
    id: "t3",
    title: "Product sync",
    startTime: (() => {
      const d = addDays(new Date(), 1);
      d.setHours(14, 0, 0, 0);
      return d;
    })(),
    endTime: (() => {
      const d = addDays(new Date(), 1);
      d.setHours(14, 45, 0, 0);
      return d;
    })(),
    location: "Room 201",
    status: "confirmed",
  },
];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export default function HorizonTab() {
  const { isDark } = useTheme();
  const p = pal(isDark);
  const router = useRouter();

  const [activeDay, setActiveDay] = useState<"today" | "tomorrow">("today");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDate = useMemo(() => {
    const now = new Date();
    return activeDay === "today" ? now : addDays(now, 1);
  }, [activeDay]);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const user = await getCurrentUser();
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      if (!user) {
        setEvents(
          activeDay === "today" ? MOCK_EVENTS_TODAY : MOCK_EVENTS_TOMORROW,
        );
        return;
      }

      const data = await api.get(
        `/calendar?userId=${user.id}&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`,
      );

      let normalized = Array.isArray(data.events) ? data.events : [];
      if (normalized.length === 0) {
        normalized =
          activeDay === "today" ? MOCK_EVENTS_TODAY : MOCK_EVENTS_TOMORROW;
      }

      setEvents(
        normalized.map((e: any) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime),
        })),
      );
    } catch (e: any) {
      console.error("Falling back to mock data", e);
      setEvents(
        activeDay === "today" ? MOCK_EVENTS_TODAY : MOCK_EVENTS_TOMORROW,
      );
      setError(e?.message || "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, activeDay]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const eventsByHour = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((event) => {
      const hour = event.startTime.getHours();
      if (!map.has(hour)) map.set(hour, []);
      map.get(hour)?.push(event);
    });
    return map;
  }, [events]);

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 60000),
    );
    if (minutes >= 60) return `${Math.round(minutes / 60)} hr`;
    return `${minutes} min`;
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: p.bgDeep }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[styles.title, { color: p.textPrimary, fontFamily: serif }]}
        >
          Horizon
        </Text>
        <Text style={[styles.subtitle, { color: p.textMuted }]}>
          Your day at a glance
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={p.accent}
          />
        }
      >
        {/* Today / Tomorrow toggle */}
        <View style={[styles.toggle, { backgroundColor: p.bgCard }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeDay === "today" && [
                styles.toggleBtnActive,
                { backgroundColor: p.bgElevated },
              ],
            ]}
            onPress={() => setActiveDay("today")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: p.textMuted },
                activeDay === "today" && { color: p.textPrimary },
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeDay === "tomorrow" && [
                styles.toggleBtnActive,
                { backgroundColor: p.bgElevated },
              ],
            ]}
            onPress={() => setActiveDay("tomorrow")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: p.textMuted },
                activeDay === "tomorrow" && { color: p.textPrimary },
              ]}
            >
              Tomorrow
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && !refreshing && (
          <ActivityIndicator style={{ marginTop: 40 }} color={p.accent} />
        )}

        {/* Timeline */}
        {!loading && (
          <View style={styles.timeline}>
            {HOURS.map((hour) => {
              const slotEvents = eventsByHour.get(hour) || [];
              return (
                <View
                  key={hour}
                  style={[styles.hourRow, { borderBottomColor: p.border }]}
                >
                  <Text style={[styles.hourLabel, { color: p.textMuted }]}>
                    {formatHour(hour)}
                  </Text>
                  <View style={styles.hourContent}>
                    {slotEvents.map((event) => {
                      const isFocus =
                        event.status === "tentative" ||
                        event.title.toLowerCase().includes("focus");
                      const subtitleParts = [];
                      if (event.startTime && event.endTime)
                        subtitleParts.push(
                          formatDuration(event.startTime, event.endTime),
                        );
                      if (event.location) subtitleParts.push(event.location);

                      return (
                        <TouchableOpacity
                          key={event.id}
                          activeOpacity={0.8}
                          onPress={() =>
                            router.push({
                              pathname: "/event-detail",
                              params: { eventData: JSON.stringify(event) },
                            })
                          }
                          style={[
                            styles.eventCard,
                            {
                              backgroundColor: p.bgCard,
                              borderColor: p.border,
                            },
                            isFocus && styles.eventFocus,
                          ]}
                        >
                          <Text
                            style={[
                              styles.eventTitle,
                              { color: p.textPrimary },
                              isFocus && { opacity: 0.7 },
                            ]}
                          >
                            {event.title}
                          </Text>
                          {subtitleParts.length > 0 && (
                            <Text
                              style={[styles.eventMeta, { color: p.textMuted }]}
                            >
                              {subtitleParts.join(" · ")}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  /* Toggle */
  toggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleBtnActive: {},
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* Timeline */
  timeline: {},
  hourRow: {
    flexDirection: "row",
    minHeight: 60,
    borderBottomWidth: 1,
  },
  hourLabel: {
    width: 50,
    fontSize: 12,
    paddingTop: 2,
    flexShrink: 0,
  },
  hourContent: {
    flex: 1,
    paddingVertical: 4,
  },

  /* Event */
  eventCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  eventFocus: {
    borderStyle: "dashed",
    opacity: 0.7,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 12,
  },
});
