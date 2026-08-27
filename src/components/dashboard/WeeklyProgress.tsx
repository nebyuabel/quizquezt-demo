"use client";

import { useWeeklyProgress } from "@/hooks/useWeeklyProgress";

export default function WeeklyProgress() {
  const { days, loading } = useWeeklyProgress();

  if (loading) {
    return (
      <div className="bg-surface-container rounded-2xl p-md shadow-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-surface-variant rounded"></div>
          <div className="h-32 flex items-end justify-between gap-xs">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-surface-variant rounded-t-md h-12"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxXP = Math.max(...days.map((d) => d.xp), 1);

  return (
    <div className="bg-surface-container rounded-2xl p-md shadow-lg overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm relative z-10 flex items-center gap-xs">
        <span className="material-symbols-outlined text-secondary">
          trending_up
        </span>
        Weekly Progress
      </h3>
      <div className="h-32 flex items-end justify-between gap-xs relative z-10">
        {days.map((day, i) => {
          const height = (day.xp / maxXP) * 100;
          return (
            <div
              key={i}
              className="w-full flex flex-col items-center relative group"
            >
              <div
                className={`w-full rounded-t-md transition-colors ${day.isToday ? "bg-primary hover:bg-primary-container shadow-[0_0_10px_rgba(157,78,221,0.4)]" : "bg-primary/20 hover:bg-primary/40"}`}
                style={{ height: `${height}%` }}
              />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-label-sm text-label-sm text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                {day.xp}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-xs font-label-sm text-label-sm text-text-muted">
        {days.map((day, i) => (
          <span key={i} className={day.isToday ? "text-primary font-bold" : ""}>
            {day.day}
          </span>
        ))}
      </div>
    </div>
  );
}
