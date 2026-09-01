"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useLeaderboard, Scope, TimeFilter } from "@/hooks/useLeaderboard";
import { getLevelFromXP } from "@/lib/config/levels";

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("my-level");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");
  const { entries, loading, totalPlayers, timeLeft } = useLeaderboard(
    scope,
    timeFilter,
  );

  // Find current user's entry
  const currentUserEntry = entries.find((e) => e.user_id === user?.id);
  const userRank = currentUserEntry?.rank || null;

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

  if (!user) return null;

  // Get top 3 entries
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full relative">
          {/* Header Section */}
          <div className="px-xl py-lg flex justify-between items-end relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-sm">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center shadow-lg shadow-surface-container-highest/20">
                  <span className="material-symbols-outlined text-primary text-[28px] transform rotate-12">
                    emoji_events
                  </span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface m-0 tracking-tight">
                  Top Questers
                </h1>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl m-0">
                Compete globally, earn XP, and secure your place among the
                academic elite. The top 3 win exclusive weekly rewards.
              </p>
            </div>
            <div className="relative z-10 flex gap-sm">
              <div className="px-md py-sm bg-surface-container-low rounded-xl shadow-sm flex flex-col items-center justify-center border border-outline-variant/10 min-w-[120px]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
                  Time Left
                </span>
                <div className="flex items-center gap-xs text-warning-orange">
                  <span className="material-symbols-outlined text-[20px]">
                    schedule
                  </span>
                  <span className="font-headline-md text-headline-md m-0 leading-none">
                    {timeLeft}
                  </span>
                </div>
              </div>
              <div className="px-md py-sm bg-surface-container-low rounded-xl shadow-sm flex flex-col items-center justify-center border border-outline-variant/10 min-w-[120px]">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
                  Total Players
                </span>
                <div className="flex items-center gap-xs text-secondary">
                  <span className="material-symbols-outlined text-[20px]">
                    groups
                  </span>
                  <span className="font-headline-md text-headline-md m-0 leading-none">
                    {totalPlayers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-xl py-sm flex flex-wrap items-center gap-md">
            <div className="flex items-center gap-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Scope:
              </span>
              <div className="flex rounded-lg bg-surface-container p-1">
                <button
                  onClick={() => setScope("all")}
                  className={`px-md py-sm rounded-md font-label-sm text-label-sm transition-colors ${
                    scope === "all"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setScope("my-tier")}
                  className={`px-md py-sm rounded-md font-label-sm text-label-sm transition-colors ${
                    scope === "my-tier"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  My Tier
                </button>
                <button
                  onClick={() => setScope("my-level")}
                  className={`px-md py-sm rounded-md font-label-sm text-label-sm transition-colors ${
                    scope === "my-level"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  My Level
                </button>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Time:
              </span>
              <div className="flex rounded-lg bg-surface-container p-1">
                <button
                  onClick={() => setTimeFilter("daily")}
                  className={`px-md py-sm rounded-md font-label-sm text-label-sm transition-colors ${
                    timeFilter === "daily"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeFilter("weekly")}
                  className={`px-md py-sm rounded-md font-label-sm text-label-sm transition-colors ${
                    timeFilter === "weekly"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeFilter("all-time")}
                  className={`px-md py-sm rounded-md font-label-sm text-label-sm transition-colors ${
                    timeFilter === "all-time"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>

          {/* My Rank Sticky */}
          {userRank !== null && (
            <div className="sticky top-16 z-30 px-xl py-sm">
              <div className="bg-primary/10 backdrop-blur-md rounded-2xl p-md flex items-center justify-between shadow-[0_8px_32px_rgba(157,78,221,0.15)] border border-primary/20 relative overflow-hidden group hover:bg-primary/15 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex items-center gap-lg relative z-10">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-surface-container border border-outline-variant/30 shadow-inner">
                    <span className="font-label-sm text-label-sm text-on-surface-variant mb-0.5">
                      RANK
                    </span>
                    <span className="font-headline-lg text-headline-lg text-on-surface m-0 leading-none">
                      {userRank}
                    </span>
                  </div>
                  <div className="flex items-center gap-md">
                    <div className="relative w-14 h-14 rounded-full p-1 bg-gradient-to-br from-primary to-secondary">
                      <div className="w-full h-full rounded-full overflow-hidden bg-surface">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            className="w-full h-full object-cover"
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface">
                            <span className="material-symbols-outlined text-[28px]">
                              person
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-container rounded-full flex items-center justify-center border border-outline-variant/50">
                        <div className="w-2 h-2 rounded-full bg-success-green animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface m-0">
                        You
                      </h3>
                      <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          school
                        </span>
                        {getLevelFromXP(currentUserEntry?.total_xp || 0).tier} ·
                        Level{" "}
                        {getLevelFromXP(currentUserEntry?.total_xp || 0).level}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-md relative z-10">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-xs">
                      <span className="font-headline-lg text-headline-lg text-on-surface m-0">
                        {currentUserEntry?.total_xp || 0}
                      </span>
                      <span className="font-label-md text-label-md text-primary font-bold">
                        XP
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {userRank > 1
                        ? `${entries[userRank - 2]?.total_xp - (currentUserEntry?.total_xp || 0)} XP to Rank ${userRank - 1}`
                        : "You are rank 1!"}
                    </span>
                  </div>
                  <div className="w-1 h-12 bg-outline-variant/30 rounded-full"></div>
                  <button className="px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all active:translate-y-0">
                    Earn XP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div className="px-xl py-lg max-w-[1000px] mx-auto w-full">
            <div className="bg-surface-charcoal rounded-3xl p-md shadow-2xl relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM0ZDQzNTMiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3N2Zz4=')] opacity-50 rounded-3xl pointer-events-none"></div>
              <div className="flex items-center justify-between px-md py-sm mb-sm border-b border-outline-variant/10">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest w-24">
                  Rank
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest flex-1">
                  Student
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-right w-32">
                  Total XP
                </span>
              </div>
              <div className="space-y-xs relative z-10">
                {/* Top 3 */}
                {top3.map((entry, index) => {
                  const rank = index + 1;
                  let rankColor = "rank-gold";
                  let rankBg = "rank-gold/20";
                  let borderColor = "rank-gold";
                  let medalIcon = "workspace_premium";
                  if (rank === 2) {
                    rankColor = "on-surface-variant";
                    rankBg = "on-surface-variant/20";
                    borderColor = "on-surface-variant/50";
                  } else if (rank === 3) {
                    rankColor = "tertiary";
                    rankBg = "tertiary/20";
                    borderColor = "tertiary/50";
                  }
                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between px-md py-md bg-gradient-to-r from-${rankColor}/10 via-surface-container-low to-surface-container-low rounded-2xl group hover:bg-surface-container transition-colors cursor-pointer border border-${rankColor}/20 shadow-[0_4px_20px_rgba(255,215,0,0.05)]`}
                    >
                      <div className="w-24 flex items-center gap-xs">
                        <div
                          className={`w-10 h-10 rounded-full bg-${rankBg} flex items-center justify-center border border-${borderColor}/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]`}
                        >
                          <span
                            className={`font-headline-md text-headline-md text-${rankColor} m-0`}
                          >
                            {rank}
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined text-${rankColor} drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {medalIcon}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-md">
                        {entry.avatar_url ? (
                          <img
                            className="w-12 h-12 rounded-full object-cover border-2 border-rank-gold/50"
                            src={entry.avatar_url}
                            alt="Avatar"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
                            <span className="material-symbols-outlined text-[24px]">
                              person
                            </span>
                          </div>
                        )}
                        <div>
                          <h4
                            className={`font-headline-md text-headline-md text-on-surface m-0 group-hover:text-${rankColor} transition-colors`}
                          >
                            {entry.display_name}
                          </h4>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Tier {entry.tier} · Level {entry.level}
                          </span>
                        </div>
                      </div>
                      <div className="w-32 text-right flex flex-col items-end">
                        <span
                          className={`font-headline-lg text-headline-lg text-on-surface m-0`}
                        >
                          {entry.total_xp.toLocaleString()}
                        </span>
                        <div className="h-1.5 w-full bg-surface-container-highest rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full bg-${rankColor} w-full rounded-full shadow-[0_0_8px_rgba(255,215,0,0.6)]`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Ranks 4+ */}
                {rest.map((entry) => (
                  <div
                    key={entry.user_id}
                    className="flex items-center justify-between px-md py-sm bg-surface-container-low rounded-xl group hover:bg-surface-container transition-all hover:translate-x-1 cursor-pointer"
                  >
                    <div className="w-24 flex items-center pl-sm">
                      <span className="font-headline-md text-headline-md text-on-surface-variant m-0 w-8 text-center">
                        {entry.rank}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-md">
                      {entry.avatar_url ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={entry.avatar_url}
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-label-md">
                          {entry.display_name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-body-lg text-body-lg text-on-surface m-0 group-hover:text-primary transition-colors">
                          {entry.display_name}
                        </h4>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Level {entry.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-warning-orange text-[16px]">
                        local_fire_department
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {entry.current_streak}
                      </span>
                    </div>
                    <div className="w-32 text-right flex flex-col items-end pr-sm">
                      <span className="font-body-lg text-body-lg text-on-surface m-0 font-medium">
                        {entry.total_xp.toLocaleString()}
                      </span>
                      <div className="h-1 w-full bg-surface-container-highest rounded-full mt-1 overflow-hidden opacity-30 group-hover:opacity-100 transition-opacity">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(entry.total_xp / (entries[0]?.total_xp || 1)) * 100}%`,
                          }}
                        ></div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-warning-orange text-[16px]">
                            local_fire_department
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {entry.current_streak}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
