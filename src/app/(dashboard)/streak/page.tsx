"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useStreak } from "@/hooks/useStreak";

export default function StreakPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading } = useStreak();

  // Helper: generate calendar grid for current month
  const generateCalendar = () => {
    if (!data) return [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=Sun

    // Map activity dates to counts
    const activityMap: Record<string, number> = {};
    data.monthlyActivity.forEach((a) => {
      const key = a.date.toISOString().split("T")[0];
      activityMap[key] = a.count;
    });

    const grid: { day: number; count: number; date: Date }[] = [];
    // Add empty cells for days before month start
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({ day: 0, count: 0, date: new Date(0) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = date.toISOString().split("T")[0];
      grid.push({ day: d, count: activityMap[key] || 0, date });
    }
    return grid;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !data) return null;

  const calendarGrid = generateCalendar();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();

  // Determine activity level for heatmap coloring
  const getActivityLevel = (count: number) => {
    if (count === 0) return "bg-surface-charcoal";
    if (count <= 2) return "bg-warning-orange/20 text-warning-orange";
    if (count <= 5) return "bg-warning-orange/40 text-warning-orange";
    if (count <= 10) return "bg-warning-orange/60 text-surface";
    if (count <= 20) return "bg-warning-orange/80 text-surface";
    return "bg-warning-orange text-surface shadow-[0_0_25px_rgba(243,156,18,0.8)]";
  };

  // Weekly goal progress
  const activeDays = data.weeklyActivity.filter((d) => d.active).length;
  const totalDays = 7;
  const goalProgress = Math.min(100, (activeDays / totalDays) * 100);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen ">
        <div className="flex flex-col w-full relative">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-3/4 h-96 bg-gradient-to-bl from-warning-orange/10 via-warning-orange/5 to-transparent rounded-bl-full pointer-events-none blur-3xl mix-blend-screen"></div>

          <div className="w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl relative z-10 flex flex-col gap-lg md:gap-xl">
            <div className="flex flex-col md:flex-row gap-lg md:gap-xl">
              {/* Left Column: Stats and Weekly Goal */}
              <div className="w-full md:w-1/3 flex flex-col gap-md">
                <h1 className="font-display-lg text-display-lg text-on-surface">
                  Keep the fire alive
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-sm">
                  Consistency is the key to mastery. Track your daily progress
                  and build unstoppable momentum.
                </p>

                {/* Current Streak Card */}
                <div className="bg-surface-container-high rounded-xl p-md mt-sm shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-warning-orange/20 rounded-full blur-2xl group-hover:bg-warning-orange/30 transition-colors duration-500"></div>
                  <div className="flex items-center gap-md relative z-10">
                    <div className="w-16 h-16 rounded-full bg-surface-charcoal shadow-inner flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-[36px] text-warning-orange"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_fire_department
                      </span>
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                        Current Streak
                      </p>
                      <div className="flex items-baseline gap-xs">
                        <span className="font-display-lg text-display-lg text-on-surface">
                          {data.currentStreak}
                        </span>
                        <span className="font-label-md text-label-md text-text-muted">
                          Days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-md pt-md border-t border-surface-variant flex justify-between relative z-10">
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Best Streak
                      </p>
                      <p className="font-headline-md text-headline-md text-on-surface">
                        {data.longestStreak}
                      </p>
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        XP Gained
                      </p>
                      <p className="font-headline-md text-headline-md text-primary">
                        {data.xpGainedDuringStreak.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weekly Goal */}
                <div className="bg-surface-charcoal rounded-xl p-md shadow-md">
                  <div className="flex justify-between items-center mb-sm">
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Weekly Goal
                    </h3>
                    <span
                      className={`font-label-md text-label-md ${goalProgress >= 70 ? "text-success-green" : "text-warning-orange"}`}
                    >
                      {goalProgress >= 70
                        ? "On Track"
                        : `${activeDays}/${totalDays}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-base mt-md">
                    {data.weeklyActivity.map((day, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-xs"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center relative ${day.isToday && day.active ? "shadow-[0_0_15px_rgba(243,156,18,0.4)]" : ""} ${
                            day.active
                              ? "bg-warning-orange/20 text-warning-orange"
                              : "bg-surface-container-high text-surface-variant"
                          }`}
                        >
                          {day.isToday && day.active && (
                            <div className="absolute inset-0 bg-warning-orange/10 rounded-full animate-ping"></div>
                          )}
                          {day.active ? (
                            <span
                              className="material-symbols-outlined text-[20px] relative z-10"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {day.isToday
                                ? "local_fire_department"
                                : "check_circle"}
                            </span>
                          ) : (
                            <span className="font-label-md text-label-md">
                              {day.date.getDate()}
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-label-sm text-label-sm ${day.isToday ? "text-warning-orange" : day.active ? "text-on-surface-variant" : "text-text-muted"}`}
                        >
                          {day.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Map */}
              <div className="w-full md:w-2/3 bg-surface-container rounded-xl p-md md:p-xl shadow-xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-center mb-lg">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Activity Map
                  </h2>
                  <select className="bg-surface-container-high text-on-surface font-label-md text-label-md px-sm py-xs rounded-lg border-none outline-none appearance-none cursor-pointer pr-xl relative">
                    <option>
                      {today.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-7 gap-xs md:gap-sm flex-1">
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className="font-label-sm text-label-sm text-on-surface-variant text-center pb-xs"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarGrid.map((cell, idx) => {
                    if (cell.day === 0) {
                      return (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg bg-surface-charcoal flex items-center justify-center opacity-50"
                        ></div>
                      );
                    }
                    const isToday =
                      cell.date.toDateString() === today.toDateString();
                    const levelClass = getActivityLevel(cell.count);
                    const isHigh = cell.count > 10;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-lg flex items-center justify-center font-label-md text-label-md relative ${levelClass} ${isHigh ? "shadow-[0_0_15px_rgba(243,156,18,0.5)]" : ""} ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container" : ""}`}
                      >
                        {cell.day}
                        {isHigh && (
                          <span
                            className="material-symbols-outlined text-[16px] absolute top-1 right-1 opacity-50"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="col-span-7 flex items-center justify-end gap-sm mt-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Less Activity
                  </span>
                  <div className="flex gap-xs">
                    <div className="w-4 h-4 rounded-sm bg-surface-charcoal"></div>
                    <div className="w-4 h-4 rounded-sm bg-warning-orange/20"></div>
                    <div className="w-4 h-4 rounded-sm bg-warning-orange/60"></div>
                    <div className="w-4 h-4 rounded-sm bg-warning-orange"></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    More Activity
                  </span>
                </div>
              </div>
            </div>

            {/* Consistency Insights */}
            <div className="mt-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
                Consistency Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md md:gap-lg">
                <div className="bg-surface-container rounded-xl p-md shadow-md flex flex-col justify-between h-48 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div>
                    <span className="material-symbols-outlined text-primary mb-sm">
                      military_tech
                    </span>
                    <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
                      Longest Run
                    </h4>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-xs">
                      <span className="font-display-lg text-display-lg text-on-surface">
                        {data.insights.longestRun}
                      </span>
                      <span className="font-body-md text-body-md text-text-muted">
                        Days
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-success-green mt-xs">
                      {data.longestStreak > 0
                        ? "Achieved in current streak"
                        : "Keep going!"}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container rounded-xl p-md shadow-md flex flex-col justify-between h-48 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div>
                    <span className="material-symbols-outlined text-secondary mb-sm">
                      weekend
                    </span>
                    <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
                      Most Active Day
                    </h4>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-xs">
                      <span className="font-display-lg text-display-lg text-on-surface">
                        {data.insights.mostActiveDay}
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                      Based on your activity history
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container rounded-xl p-md shadow-md flex flex-col justify-between h-48 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div>
                    <span className="material-symbols-outlined text-tertiary mb-sm">
                      bolt
                    </span>
                    <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
                      Current Rank
                    </h4>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-xs">
                      <span className="font-display-lg text-display-lg text-on-surface">
                        {data.insights.currentRank}
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                      Among all students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
