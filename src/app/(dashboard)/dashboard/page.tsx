"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useLevel } from "@/hooks/useLevel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SubjectMatrix from "@/components/dashboard/SubjectMatrix";
import ActiveUnits from "@/components/dashboard/ActiveUnits";
import DailyObjectives from "@/components/dashboard/DailyObjectives";
import WeeklyProgress from "@/components/dashboard/WeeklyProgress";
import QuickActions from "@/components/dashboard/QuickActions";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const { level, tier, progress } = useLevel(profile?.total_xp || 0);
  const router = useRouter();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full px-sm md:px-xl py-lg md:py-xl space-y-xl md:space-y-16">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-sm">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-primary tracking-widest uppercase mb-base">
                {greeting}, {profile?.display_name || "Scholar"}
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface">
                Your Dashboard
              </h1>
            </div>
            <div className="bg-surface-container-low px-md py-sm rounded-xl shadow-md flex items-center gap-md">
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Current Streak
                </span>
                <div className="flex items-center gap-base text-warning-orange">
                  <span className="material-symbols-outlined fill-1">
                    local_fire_department
                  </span>
                  <span className="font-headline-md text-headline-md">
                    {profile?.current_streak || 0} Days
                  </span>
                </div>
              </div>
              <div className="w-px h-8 bg-surface-variant"></div>
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Total XP
                </span>
                <div className="flex items-center gap-base text-primary">
                  <span className="material-symbols-outlined">star</span>
                  <span className="font-headline-md text-headline-md">
                    {profile?.total_xp?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
            <div className="lg:col-span-8 space-y-md">
              <SubjectMatrix />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <QuickActions />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-md">
              <DailyObjectives />
              <WeeklyProgress />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
