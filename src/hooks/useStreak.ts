import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalXP: number;
  xpGainedDuringStreak: number;
  weeklyActivity: {
    day: string;
    date: Date;
    active: boolean;
    isToday: boolean;
  }[];
  monthlyActivity: { date: Date; count: number }[];
  insights: {
    longestRun: number;
    mostActiveDay: string;
    currentRank: string;
  };
}

export function useStreak() {
  const { user } = useAuth();
  const supabase = createClient();
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStreakData = async () => {
      try {
        // 1. Profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "current_streak, longest_streak, last_activity_date, total_xp",
          )
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        // 2. Streak history for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: history, error: historyError } = await supabase
          .from("streak_history")
          .select("activity_date, activity_count")
          .eq("user_id", user.id)
          .gte("activity_date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("activity_date", { ascending: true });

        if (historyError) throw historyError;

        // 3. Weekly activity (last 7 days)
        const now = new Date();
        const weekly: {
          day: string;
          date: Date;
          active: boolean;
          isToday: boolean;
        }[] = [];
        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const found = history.find((h) => h.activity_date === dateStr);
          const isToday = i === 0;
          weekly.push({
            day: weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1],
            date: d,
            active: !!found,
            isToday,
          });
        }

        // 4. Monthly activity map (for heatmap)
        const monthly = history.map((h) => ({
          date: new Date(h.activity_date + "T00:00:00"),
          count: h.activity_count || 1,
        }));

        // 5. XP gained during current streak
        let xpDuringStreak = 0;
        if (profile.current_streak > 0 && profile.last_activity_date) {
          const streakStart = new Date(profile.last_activity_date);
          streakStart.setDate(
            streakStart.getDate() - profile.current_streak + 1,
          );
          const { data: txData, error: txError } = await supabase
            .from("xp_transactions")
            .select("amount")
            .eq("user_id", user.id)
            .gte("created_at", streakStart.toISOString());
          if (!txError && txData) {
            xpDuringStreak = txData.reduce((sum, tx) => sum + tx.amount, 0);
          }
        }

        // 6. Insights: most active day
        const dayCounts: Record<number, number> = {};
        history.forEach((h) => {
          const day = new Date(h.activity_date + "T00:00:00").getDay();
          dayCounts[day] = (dayCounts[day] || 0) + h.activity_count;
        });
        let maxDay = -1;
        let maxCount = -1;
        for (const [day, count] of Object.entries(dayCounts)) {
          if (count > maxCount) {
            maxCount = count;
            maxDay = parseInt(day);
          }
        }
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const mostActiveDay = maxDay >= 0 ? dayNames[maxDay] : "N/A";

        // 7. Current rank placeholder (we could compute later)
        const currentRank = "Top 5%"; // placeholder

        setData({
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          lastActivityDate: profile.last_activity_date,
          totalXP: profile.total_xp || 0,
          xpGainedDuringStreak: xpDuringStreak,
          weeklyActivity: weekly,
          monthlyActivity: monthly,
          insights: {
            longestRun: profile.longest_streak || 0,
            mostActiveDay,
            currentRank,
          },
        });
      } catch (error) {
        console.error("Error fetching streak data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [user, supabase]);

  return { data, loading };
}
