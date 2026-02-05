import { Ionicons } from "@expo/vector-icons";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { borderRadius, spacing, typography } from "../../theme";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  location?: string | null;
  attendeesCount?: number;
  meetingLink?: string | null;
  status?: string;
  color?: string;
  isAllDay?: boolean;
}

const MOCK_EVENTS: CalendarEvent[] = [
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
    description: "Q4 deck work",
    startTime: new Date(new Date().setHours(15, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    status: "tentative",
  },
];

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const TIME_COLUMN_WIDTH = 64;
const LINE_OFFSET = 12;

export default function CalendarTab() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(isDark);
  const router = useRouter();
  const sparkleColor = isDark ? "#E6D6C6" : "#7C6C5A";
  const inputPlaceholderColor = isDark ? "rgba(255,255,255,0.45)" : "#A39487";
  const navIconColor = isDark ? "#CFC8BF" : "#7C6C5A";

  const [selectedDate, setSelectedDate] = useState(() =>
    addDays(new Date(), 1),
  );
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "month">("day");

  const [schedulingQuery, setSchedulingQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const user = await getCurrentUser();

      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      if (!user) {
        setEvents(MOCK_EVENTS.filter((e) => isSameDay(selectedDate, e.startTime)));
        return;
      }

      const data = await api.get(
        `/calendar?userId=${user.id}&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`,
      );

      let normalized = Array.isArray(data.events) ? data.events : [];
      if (normalized.length === 0) {
        normalized = MOCK_EVENTS.filter((e) => isSameDay(selectedDate, e.startTime));
      }

      setEvents(
        normalized.map((e: any) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime),
        })),
      );
    } catch (e: any) {
      console.error("Failed to fetch calendar, falling back to mock data", e);
      setEvents(MOCK_EVENTS.filter((e) => isSameDay(selectedDate, e.startTime)));
      setError(e?.message || "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setCurrentMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    if (viewMode === "month") {
      setShowSuggestions(false);
    }
  }, [viewMode]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const handleFindTime = async () => {
    if (!schedulingQuery.trim()) return;

    setLoadingSuggestions(true);
    setShowSuggestions(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError("Please sign in to get suggestions.");
        setSuggestions([]);
        return;
      }

      const response = await api.post("/calendar/suggest-times", {
        userId: user.id,
        query: schedulingQuery,
      });

      const suggestionsData =
        response?.data?.suggestions || response?.suggestions || [];
      setSuggestions(suggestionsData);

      if (suggestionsData.length === 0) {
        setError("No available time slots found for your query.");
      }
    } catch (err: any) {
      console.error("Failed to get time suggestions:", err);
      setError(err.response?.data?.error || "Failed to find available times");
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCreateEvent = async (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setCreatingEvent(true);
    setEventTitle("");
  };

  const confirmCreateEvent = async () => {
    if (!eventTitle.trim() || !selectedSuggestion) return;

    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Sign in required", "Please sign in to create events.");
        return;
      }

      const response = await api.post("/calendar/create", {
        userId: user.id,
        title: eventTitle.trim(),
        startTime: selectedSuggestion.startTime,
        endTime: selectedSuggestion.endTime,
        description: "Created via scheduling assistant",
      });

      if (response?.success || response?.data?.success) {
        Alert.alert("Event created", `"${eventTitle}" has been added.`);
        setCreatingEvent(false);
        setEventTitle("");
        setSelectedSuggestion(null);
        setShowSuggestions(false);
        setSuggestions([]);
        setSchedulingQuery("");
        await fetchEvents();
      } else {
        throw new Error("Event creation failed");
      }
    } catch (err: any) {
      console.error("Failed to create event:", err);
      Alert.alert(
        "Error",
        err.response?.data?.error ||
          err.response?.data?.details ||
          "Failed to create event. Please try again.",
      );
      setCreatingEvent(false);
    }
  };

  const cancelCreateEvent = () => {
    setCreatingEvent(false);
    setEventTitle("");
    setSelectedSuggestion(null);
  };

  const headerTitle = useMemo(() => {
    const today = new Date();
    if (isSameDay(selectedDate, today)) {
      return `Today, ${format(selectedDate, "EEEE")}`;
    }
    if (isSameDay(selectedDate, addDays(today, 1))) {
      return `Tomorrow, ${format(selectedDate, "EEEE")}`;
    }
    return format(selectedDate, "EEEE, MMM d");
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), {
      weekStartsOn: 0,
    });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventDaySet = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => {
      set.add(format(event.startTime, "yyyy-MM-dd"));
    });
    return set;
  }, [events]);

  const eventsByHour = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((event) => {
      const hour = event.startTime.getHours();
      if (!map.has(hour)) map.set(hour, []);
      map.get(hour)?.push(event);
    });
    map.forEach((list) =>
      list.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    );
    return map;
  }, [events]);

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const shiftMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = addMonths(prev, delta);
      setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
      return next;
    });
  };

  const handlePrevMonth = () => shiftMonth(-1);
  const handleNextMonth = () => shiftMonth(1);

  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    if (minutes >= 60) {
      const hours = Math.round(minutes / 60);
      return `${hours} hr`;
    }
    return `${minutes} min`;
  };

  const renderEventCard = (event: CalendarEvent) => {
    const isMuted =
      event.status === "tentative" ||
      event.status === "cancelled" ||
      event.title.toLowerCase().includes("focus");
    const subtitleParts = [];
    if (event.startTime && event.endTime) {
      subtitleParts.push(formatDuration(event.startTime, event.endTime));
    }
    if (event.location || event.description) {
      subtitleParts.push(event.location || event.description);
    }
    const subtitle = subtitleParts.join(" · ");

    return (
      <TouchableOpacity
        key={event.id}
        onPress={() =>
          router.push({
            pathname: "/event-detail",
            params: { eventData: JSON.stringify(event) },
          })
        }
        activeOpacity={0.8}
        style={{ marginBottom: spacing[2] }}
      >
        <View
          style={[
            styles.eventCard,
            isMuted && styles.eventCardMuted,
          ]}
        >
          <Text style={[styles.eventTitle, isMuted && styles.eventTitleMuted]}>
            {event.title}
          </Text>
          {!!subtitle && (
            <Text style={[styles.eventMeta, isMuted && styles.eventMetaMuted]}>
              {subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>Calendar</Text>
            <Text style={styles.pageSubtitle}>Manage your schedule</Text>
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "day" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("day")}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "day" && styles.viewToggleTextActive,
                ]}
              >
                Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "month" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("month")}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "month" && styles.viewToggleTextActive,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === "month" ? (
          <View style={styles.monthCard}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {format(currentMonth, "MMMM yyyy")}
              </Text>
              <View style={styles.monthControls}>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={handlePrevMonth}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={navIconColor}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={handleNextMonth}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={navIconColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekRow}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text key={day} style={styles.weekLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.monthGrid}>
              {monthDays.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const hasEvent = eventDaySet.has(format(day, "yyyy-MM-dd"));

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      !inMonth && styles.dayCellMuted,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => setSelectedDate(day)}
                    activeOpacity={0.8}
                  >
                    {isToday && !isSelected && <View style={styles.todayDot} />}
                    <Text
                      style={[
                        styles.dayText,
                        !inMonth && styles.dayTextMuted,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {format(day, "d")}
                    </Text>
                    {hasEvent && <View style={styles.eventDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.headerEyebrow}>Horizon</Text>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
            </View>

            <View style={styles.schedulingAssistant}>
              <Text style={styles.schedulingLabel}>Suggestion</Text>
              <View style={styles.schedulingInputContainer}>
                <Ionicons name="sparkles" size={18} color={sparkleColor} />
                <TextInput
                  placeholder="Ask me to find time..."
                  placeholderTextColor={inputPlaceholderColor}
                  value={schedulingQuery}
                  onChangeText={setSchedulingQuery}
                  onSubmitEditing={handleFindTime}
                  returnKeyType="search"
                  style={styles.schedulingInput}
                />
                {schedulingQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={handleFindTime}
                    disabled={loadingSuggestions}
                  >
                    {loadingSuggestions ? (
                      <ActivityIndicator size="small" color={sparkleColor} />
                    ) : (
                      <Ionicons name="send" size={16} color={sparkleColor} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  {suggestions.length > 0 ? (
                    <>
                      <Text style={styles.suggestionsTitle}>
                        Suggested Times ({suggestions.length})
                      </Text>
                      {suggestions.map((suggestion, index) => (
                        <View key={index} style={styles.suggestionCard}>
                          {index === 0 && (
                            <View style={styles.recommendedBadge}>
                              <Ionicons name="star" size={12} color="#F6BF26" />
                              <Text style={styles.recommendedText}>
                                Recommended
                              </Text>
                            </View>
                          )}
                          <Text style={styles.suggestionDate}>
                            {format(
                              new Date(suggestion.startTime),
                              "EEEE, MMM d",
                            )}
                          </Text>
                          <Text style={styles.suggestionTime}>
                            {format(
                              new Date(suggestion.startTime),
                              "h:mm a",
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(suggestion.endTime),
                              "h:mm a",
                            )}
                          </Text>
                          <Text style={styles.suggestionReason}>
                            {suggestion.reason}
                          </Text>

                          {creatingEvent &&
                          selectedSuggestion === suggestion ? (
                            <View style={styles.eventCreationContainer}>
                              <TextInput
                                placeholder="Event title..."
                                placeholderTextColor={inputPlaceholderColor}
                                value={eventTitle}
                                onChangeText={setEventTitle}
                                autoFocus
                                style={styles.eventTitleInput}
                              />
                              <View style={styles.eventCreationButtons}>
                                <TouchableOpacity
                                  style={styles.cancelButton}
                                  onPress={cancelCreateEvent}
                                >
                                  <Text style={styles.cancelButtonText}>
                                    Cancel
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.confirmButton}
                                  onPress={confirmCreateEvent}
                                  disabled={!eventTitle.trim()}
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color="#FFFFFF"
                                  />
                                  <Text style={styles.confirmButtonText}>
                                    Create
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.createEventButton}
                              onPress={() => handleCreateEvent(suggestion)}
                            >
                              <Ionicons
                                name="add-circle-outline"
                                size={16}
                                color="#FFFFFF"
                              />
                              <Text style={styles.createEventButtonText}>
                                Create Event
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.closeSuggestionsButton}
                        onPress={() => setShowSuggestions(false)}
                      >
                        <Text style={styles.closeSuggestionsText}>Close</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.emptySuggestionState}>
                      <Text style={styles.emptySuggestionTitle}>
                        No Available Slots
                      </Text>
                      <Text style={styles.emptySuggestionText}>
                        Try a different time range or day.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {loading && !refreshing && (
              <ActivityIndicator
                style={{ paddingVertical: spacing[6] }}
                color={colors.primary[500]}
              />
            )}

            {!loading && error && (
              <View style={styles.errorState}>
                <Ionicons
                  name="warning"
                  size={28}
                  color={styles.errorIcon.color}
                />
                <Text style={styles.errorText}>Could not load events.</Text>
              </View>
            )}

            {!loading && !error && (
              <View style={styles.timeline}>
                <View style={styles.timelineLine} />
                {HOURS.map((hour) => {
                  const slotEvents = eventsByHour.get(hour) || [];
                  return (
                    <View key={hour} style={styles.hourRow}>
                      <View style={styles.timeCell}>
                        <Text style={styles.timeLabel}>
                          {formatHour(hour)}
                        </Text>
                      </View>
                      <View style={styles.eventCell}>
                        {slotEvents.length > 0 ? (
                          slotEvents.map(renderEventCard)
                        ) : (
                          <View style={{ height: 1 }} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
    },
    pageHeader: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[6],
      paddingBottom: spacing[4],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pageHeaderText: {
      flex: 1,
      paddingRight: spacing[4],
    },
    pageTitle: {
      ...typography.textStyles.h3,
      color: isDark ? "#F2EDE6" : "#2E2620",
      marginBottom: spacing[1],
      letterSpacing: 0.2,
    },
    pageSubtitle: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "rgba(255,255,255,0.55)" : "#6E6258",
    },
    viewToggle: {
      flexDirection: "row",
      backgroundColor: isDark ? "#17181C" : "#EEE7DF",
      borderRadius: borderRadius.full,
      padding: 2,
      gap: 2,
    },
    viewToggleButton: {
      paddingHorizontal: spacing[3],
      paddingVertical: 6,
      borderRadius: borderRadius.full,
      minWidth: 56,
      alignItems: "center",
    },
    viewToggleButtonActive: {
      backgroundColor: isDark ? "#6B7390" : "#69708A",
    },
    viewToggleText: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.6)" : "#7C6C5A",
      letterSpacing: 0.4,
    },
    viewToggleTextActive: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    monthCard: {
      backgroundColor: isDark ? "#111216" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      borderWidth: 1,
      borderColor: isDark ? "#1F2025" : "#EFE6DC",
      marginBottom: spacing[6],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 20,
      elevation: 8,
    },
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing[4],
    },
    monthTitle: {
      ...typography.textStyles.body,
      fontWeight: "600",
      color: isDark ? "#F2EDE6" : "#2E2620",
      letterSpacing: 0.2,
    },
    monthControls: {
      flexDirection: "row",
      gap: spacing[2],
    },
    monthNavButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#1B1C20" : "#EEE7DF",
      borderWidth: 1,
      borderColor: isDark ? "#23242A" : "#E6DED3",
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing[3],
    },
    weekLabel: {
      width: "14.2857%",
      textAlign: "center",
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.4)" : "#A39487",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontSize: 11,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: "14.2857%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing[2],
      marginBottom: spacing[2],
      minHeight: 40,
    },
    dayCellMuted: {
      opacity: 0.4,
    },
    dayCellSelected: {
      backgroundColor: isDark ? "#6B7390" : "#69708A",
      borderRadius: 12,
      shadowColor: isDark ? "#6B7390" : "#69708A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    dayText: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "#F2EDE6" : "#2E2620",
      fontWeight: "500",
    },
    dayTextMuted: {
      color: isDark ? "rgba(255,255,255,0.35)" : "#A39487",
    },
    dayTextSelected: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    todayDot: {
      position: "absolute",
      top: 6,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "#E6D6C6" : "#7C6C5A",
    },
    eventDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: 6,
      backgroundColor: isDark ? "#6B7390" : "#69708A",
      opacity: 0.9,
    },
    sectionHeader: {
      paddingHorizontal: spacing[6],
      paddingBottom: spacing[3],
    },
    headerEyebrow: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.45)" : "#A39487",
      letterSpacing: 1,
      marginBottom: spacing[1],
    },
    headerTitle: {
      ...typography.textStyles.h3,
      color: isDark ? "#F2EDE6" : "#2E2620",
    },
    timelineContent: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[2],
      paddingBottom: spacing[12],
    },
    schedulingAssistant: {
      marginBottom: spacing[6],
      gap: spacing[3],
    },
    schedulingLabel: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.45)" : "#A39487",
      letterSpacing: 1,
    },
    schedulingInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#15151A" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderWidth: 1,
      borderColor: isDark ? "#222228" : "#EFE6DC",
      gap: spacing[2],
    },
    schedulingInput: {
      flex: 1,
      ...typography.textStyles.bodySmall,
      color: isDark ? "#E7DFD5" : "#2E2620",
    },
    suggestionsContainer: {
      gap: spacing[3],
    },
    suggestionsTitle: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "#D8D1C8" : "#6E6258",
    },
    suggestionCard: {
      backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: isDark ? "#24242A" : "#EEE7DF",
      gap: spacing[2],
    },
    recommendedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[1],
    },
    recommendedText: {
      ...typography.textStyles.caption,
      color: "#F6BF26",
    },
    suggestionDate: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.6)" : "#8D8176",
    },
    suggestionTime: {
      ...typography.textStyles.body,
      fontWeight: "600",
      color: isDark ? "#F2EDE6" : "#2E2620",
    },
    suggestionReason: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.45)" : "#8D8176",
    },
    createEventButton: {
      marginTop: spacing[2],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing[2],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.md,
      backgroundColor: isDark ? "#6B7390" : "#69708A",
    },
    createEventButtonText: {
      ...typography.textStyles.caption,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    closeSuggestionsButton: {
      alignSelf: "center",
      paddingVertical: spacing[2],
    },
    closeSuggestionsText: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.5)" : "#8D8176",
    },
    eventCreationContainer: {
      marginTop: spacing[3],
      gap: spacing[2],
    },
    eventTitleInput: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "#E7DFD5" : "#2E2620",
      backgroundColor: isDark ? "#101013" : "#F7F4F1",
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? "#2A2A30" : "#E5DED6",
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    eventCreationButtons: {
      flexDirection: "row",
      gap: spacing[2],
    },
    cancelButton: {
      flex: 1,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? "#32323A" : "#D9D2C9",
      paddingVertical: spacing[2],
      alignItems: "center",
    },
    cancelButtonText: {
      ...typography.textStyles.caption,
      color: isDark ? "#D8D1C8" : "#6E6258",
    },
    confirmButton: {
      flex: 1,
      borderRadius: borderRadius.md,
      backgroundColor: isDark ? "#6B7390" : "#69708A",
      paddingVertical: spacing[2],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing[2],
    },
    confirmButtonText: {
      ...typography.textStyles.caption,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    emptySuggestionState: {
      backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: isDark ? "#24242A" : "#EEE7DF",
      alignItems: "center",
      gap: spacing[2],
    },
    emptySuggestionTitle: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "#F2EDE6" : "#2E2620",
    },
    emptySuggestionText: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.5)" : "#8D8176",
      textAlign: "center",
    },
    timeline: {
      position: "relative",
      paddingTop: spacing[2],
    },
    timelineLine: {
      position: "absolute",
      left: TIME_COLUMN_WIDTH + LINE_OFFSET,
      top: spacing[2],
      bottom: spacing[2],
      width: 1,
      backgroundColor: isDark ? "#1F2025" : "#E5DED6",
    },
    hourRow: {
      flexDirection: "row",
      minHeight: 72,
    },
    timeCell: {
      width: TIME_COLUMN_WIDTH,
      alignItems: "flex-start",
      paddingTop: 4,
    },
    timeLabel: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.35)" : "#A39487",
      letterSpacing: 0.4,
    },
    eventCell: {
      flex: 1,
      paddingLeft: LINE_OFFSET + 18,
      paddingBottom: spacing[2],
    },
    eventCard: {
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "#24242A" : "#EEE7DF",
    },
    eventCardMuted: {
      opacity: 0.5,
      borderStyle: "dashed",
    },
    eventTitle: {
      ...typography.textStyles.body,
      fontWeight: "600",
      color: isDark ? "#F2EDE6" : "#2E2620",
      marginBottom: 2,
    },
    eventTitleMuted: {
      color: isDark ? "#B8B1A8" : "#8D8176",
    },
    eventMeta: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.45)" : "#8D8176",
    },
    eventMetaMuted: {
      color: isDark ? "rgba(255,255,255,0.35)" : "#A39487",
    },
    errorState: {
      alignItems: "center",
      paddingVertical: spacing[6],
      gap: spacing[2],
    },
    errorIcon: {
      color: isDark ? "#6B7390" : "#A39487",
    },
    errorText: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "rgba(255,255,255,0.6)" : "#6E6258",
    },
  });
