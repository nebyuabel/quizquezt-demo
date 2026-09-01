import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  coins: number;
  current_streak: number;
  longest_streak: number;
  joined_at: string;
  school: string | null;
  preferences: {
    theme: string;
    notifications: {
      dailyReminders: boolean;
      weeklyReports: boolean;
      leaderboardAlerts: boolean;
    };
    privacy: {
      publicProfile: boolean;
    };
    selected_frame?: string | null;
    uiDensity: string;
  } | null;
}

export function useUser() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user, supabase]);

  const refresh = async () => {
    setLoading(true);
    await fetchProfile();
  };

  return { profile, loading, refresh };
}
