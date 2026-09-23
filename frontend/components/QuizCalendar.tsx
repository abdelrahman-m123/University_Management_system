"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuizCalendarEvent {
  course_name: string;
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
  open_date: string;
  close_date: string;
  is_visible: boolean;
}

const pad = (value: number) => value.toString().padStart(2, "0");

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const isValidDate = (value?: string) => {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatSelectedDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const getStatus = (event: QuizCalendarEvent) => {
  const now = new Date();
  const open = new Date(event.open_date);
  const close = new Date(event.close_date);

  if (now < open) return "upcoming";
  if (now <= close) return "active";
  return "closed";
};

interface QuizCalendarProps {
  events: QuizCalendarEvent[];
  loading?: boolean;
}

export function QuizCalendar({ events, loading = false }: QuizCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const validEvents = useMemo(
    () =>
      events.filter(
        (event) => isValidDate(event.open_date) && isValidDate(event.close_date)
      ),
    [events]
  );

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, QuizCalendarEvent[]>();

    validEvents.forEach((event) => {
      const open = startOfDay(new Date(event.open_date));
      const close = endOfDay(new Date(event.close_date));
      const cursor = new Date(open);

      while (cursor <= close) {
        const key = toDayKey(cursor);
        const dayEvents = grouped.get(key) ?? [];
        dayEvents.push(event);
        grouped.set(key, dayEvents);
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return grouped;
  }, [validEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1
    );
    const firstGridDay = new Date(firstDay);
    firstGridDay.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(firstGridDay);
      day.setDate(firstGridDay.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const selectedEvents = eventsByDay.get(toDayKey(selectedDate)) ?? [];
  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  };

  const goToToday = () => {
    const current = new Date();
    setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    setSelectedDate(current);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">Quiz schedule</p>
            <p className="text-xs text-slate-500">Select a day to see its quizzes</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="px-3 pb-3 pt-4 sm:px-6 sm:pb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-900">{monthLabel}</h2>
            <span className="text-xs text-slate-500">
              {validEvents.length} scheduled quiz{validEvents.length === 1 ? "" : "zes"}
            </span>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 pb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayKey = toDayKey(day);
              const dayEvents = eventsByDay.get(dayKey) ?? [];
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const isToday = dayKey === toDayKey(today);
              const isSelected = dayKey === toDayKey(selectedDate);

              return (
                <button
                  type="button"
                  key={dayKey}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-20 rounded-lg border p-2 text-left transition-colors sm:min-h-24 ${
                    isSelected
                      ? "border-blue-900 bg-blue-50"
                      : "border-transparent hover:border-blue-200 hover:bg-slate-50"
                  } ${isCurrentMonth ? "" : "opacity-40"}`}
                  aria-label={`${day.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}, ${dayEvents.length} quizzes`}
                >
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${
                      isToday ? "bg-blue-900 text-white" : "text-slate-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <span className="mt-1 block space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <span
                        key={`${dayKey}-${event.quiz_id}`}
                        className="block truncate rounded bg-white px-1 py-0.5 text-[10px] font-medium text-blue-900 shadow-sm ring-1 ring-blue-100"
                        title={event.quiz_title}
                      >
                        {event.quiz_title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="block text-[10px] font-medium text-slate-500">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{formatSelectedDate(selectedDate)}</h2>
            <p className="text-sm text-slate-500">
              {selectedEvents.length} quiz{selectedEvents.length === 1 ? "" : "zes"}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading quizzes...</p>
        ) : selectedEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No quizzes on this day.</p>
        ) : (
          <div className="space-y-3 pt-4">
            {selectedEvents.map((event) => {
              const status = getStatus(event);
              const courseCode = event.course_name.split(": ")[0] || event.course_name;

              return (
                <div key={event.quiz_id} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{event.quiz_title}</p>
                      <p className="text-xs text-slate-500">{courseCode}</p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${
                      status === "active"
                        ? "bg-blue-900 text-white"
                        : status === "upcoming"
                        ? "bg-blue-50 text-blue-900"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(event.open_date)} - {formatTime(event.close_date)}
                  </div>
                  {status === "active" && event.google_form_url && (
                    <a
                      href={event.google_form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-blue-900 underline-offset-4 hover:underline"
                    >
                      Open quiz
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}
