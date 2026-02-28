"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: { email: string; name?: string }[];
  color?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user?.id) return;
    loadEvents();
  }, [user?.id]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/calendar/events?userId=${user!.id}`);
      setEvents(data.events || []);
    } catch (e: any) {
      console.error("Failed to load events:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.start);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-serif font-semibold text-[var(--text-primary)] mb-6">
        Calendar
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4 sm:gap-6">
        {/* Mini calendar */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-[var(--accent-soft)] rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
            </button>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-[var(--accent-soft)] rounded-lg transition-colors"
            >
              <ChevronRight
                size={18}
                className="text-[var(--text-secondary)]"
              />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-medium text-[var(--text-muted)] py-1"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                day === new Date().getDate() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear();
              const isSelected =
                day === selectedDate.getDate() &&
                currentMonth.getMonth() === selectedDate.getMonth() &&
                currentMonth.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day,
                      ),
                    )
                  }
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-[var(--accent)] text-white"
                      : isToday
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events for selected date */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
            </div>
          ) : todayEvents.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-3xl">📅</p>
              <p className="text-sm text-[var(--text-secondary)]">
                No events scheduled
              </p>
            </div>
          ) : (
            todayEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {event.title}
                  </h3>
                  {event.color && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(event.start).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(event.end).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {event.location}
                    </span>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {event.attendees.length} attendee
                      {event.attendees.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
