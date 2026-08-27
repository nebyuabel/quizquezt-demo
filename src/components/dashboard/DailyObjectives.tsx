"use client";

import { useDailyObjectives } from "@/hooks/useDailyObjectives";

export default function DailyObjectives() {
  const { objectives, completedCount, loading } = useDailyObjectives();

  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-md shadow-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-surface-variant rounded"></div>
          <div className="h-2 w-full bg-surface-variant rounded"></div>
          <div className="h-16 bg-surface-variant rounded"></div>
          <div className="h-16 bg-surface-variant rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-md shadow-lg">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary">flag</span>
          Daily Objectives
        </h3>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {completedCount}/{objectives.length} Completed
        </span>
      </div>
      <div className="w-full bg-surface-variant h-2 rounded-full mb-md overflow-hidden">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${(completedCount / objectives.length) * 100}%` }}
        ></div>
      </div>
      <div className="space-y-sm">
        {objectives.map((obj) => (
          <div
            key={obj.id}
            className={`flex items-start gap-sm p-sm rounded-xl ${obj.completed ? "bg-surface-container-highest opacity-70" : "bg-surface hover:bg-surface-variant transition-colors cursor-pointer group"}`}
          >
            <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center">
              {obj.completed ? (
                <div className="bg-success-green/20 w-full h-full rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-success-green text-[16px]">
                    check
                  </span>
                </div>
              ) : (
                <div className="border-2 border-outline-variant group-hover:border-primary transition-colors w-full h-full rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-label-md text-label-md ${obj.completed ? "text-on-surface line-through decoration-text-muted" : "text-on-surface group-hover:text-primary transition-colors"}`}
              >
                {obj.description}
              </p>
              {obj.completed ? (
                <p className="font-label-sm text-label-sm text-success-green">
                  +{obj.reward_xp} XP Earned
                </p>
              ) : (
                <p className="font-label-sm text-label-sm text-text-muted">
                  +{obj.reward_xp} XP
                </p>
              )}
            </div>
            {!obj.completed && (
              <div className="px-xs py-base bg-surface-container-highest rounded text-label-sm font-label-sm text-warning-orange">
                {obj.reward_xp} XP
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
