import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getLevelFromXP } from "@/lib/config/levels";

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  current_streak: number;
  level: number;
  tier: string;
  rank?: number;
}

export type Scope = "all" | "my-tier" | "my-level";
export type TimeFilter = "daily" | "weekly" | "all-time";

export function useLeaderboard(scope: Scope, timeFilter: TimeFilter) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      setLoading(true);
      const now = new Date(); // <-- added this line

      // Get current user's profile to know their tier/level
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user profile:", userError);
        setLoading(false);
        return;
      }

      const userLevel = getLevelFromXP(userProfile.total_xp || 0);
      const userTier = userLevel.tier;

      let data: any[] = [];
      let error: any = null;

      if (timeFilter === "all-time") {
        // Use total_xp from profiles
        const result = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url, total_xp, current_streak",
          )
          .order("total_xp", { ascending: false })
          .limit(100);

        data = result.data || [];
        error = result.error;
      } else {
        // Get start date for period
        let startDate = new Date(now);
        if (timeFilter === "daily") {
          startDate.setDate(now.getDate() - 1);
        } else if (timeFilter === "weekly") {
          startDate.setDate(now.getDate() - 7);
        }

        // Get total XP earned per user in period
        const { data: txData, error: txError } = await supabase
          .from("xp_transactions")
          .select("user_id, amount")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", now.toISOString());

        if (txError) {
          console.error("Error fetching transactions:", txError);
          setLoading(false);
          return;
        }

        // Aggregate XP per user
        const xpMap: Record<string, number> = {};
        txData?.forEach((tx) => {
          xpMap[tx.user_id] = (xpMap[tx.user_id] || 0) + tx.amount;
        });

        // Get profiles for those users
        const userIds = Object.keys(xpMap);
        if (userIds.length === 0) {
          setEntries([]);
          setTotalPlayers(0);
          setLoading(false);
          return;
        }
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url, total_xp, current_streak",
          )
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          setLoading(false);
          return;
        }

        // Combine XP from period and profile data
        data = profiles.map((p) => ({
          ...p,
          period_xp: xpMap[p.id] || 0,
        }));

        // Sort by period XP descending
        data.sort((a, b) => (b.period_xp || 0) - (a.period_xp || 0));
      }

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }

      // Filter by scope if needed
      let filteredData = data;
      if (scope === "my-tier") {
        filteredData = data.filter((p) => {
          const level = getLevelFromXP(p.total_xp || 0);
          return level.tier === userTier;
        });
      } else if (scope === "my-level") {
        filteredData = data.filter((p) => {
          const level = getLevelFromXP(p.total_xp || 0);
          return level.level === userLevel.level;
        });
      }

      // Map to LeaderboardEntry
      const entries: LeaderboardEntry[] = filteredData.map((p, index) => {
        const level = getLevelFromXP(p.total_xp || 0);
        return {
          user_id: p.id,
          username: p.username,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          total_xp: timeFilter === "all-time" ? p.total_xp : p.period_xp || 0,
          current_streak: p.current_streak,
          level: level.level,
          tier: level.tier,
          rank: index + 1,
        };
      });

      setEntries(entries);
      setTotalPlayers(data.length);

      // Compute time left until reset (for daily/weekly)
      if (timeFilter !== "all-time") {
        const nextReset = new Date(now);
        if (timeFilter === "daily") {
          nextReset.setDate(nextReset.getDate() + 1);
          nextReset.setHours(0, 0, 0, 0);
        } else if (timeFilter === "weekly") {
          // Reset on Monday 00:00
          const day = nextReset.getDay();
          const diff = day === 0 ? 6 : day - 1;
          nextReset.setDate(nextReset.getDate() - diff + 7);
          nextReset.setHours(0, 0, 0, 0);
        }
        const diffMs = nextReset.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        setTimeLeft(`${diffDays}d ${diffHours}h`);
      } else {
        setTimeLeft("∞");
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [user, scope, timeFilter, supabase]);

  return { entries, loading, totalPlayers, timeLeft };
}
