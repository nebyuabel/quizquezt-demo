import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface DayData {
  day: string;
  xp: number;
  isToday: boolean;
  date: Date;
}

export function useWeeklyProgress() {
  const { user } = useAuth();
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWeekly = async () => {
      const today = new Date();
      const daysArray: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        daysArray.push(subDays(today, i));
      }

      const startDate = startOfDay(daysArray[0]);
      const endDate = endOfDay(daysArray[6]);

      const { data, error } = await supabase
        .from("xp_transactions")
        .select("amount, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) {
        console.error("Error fetching weekly XP:", error);
        setLoading(false);
        return;
      }

      const grouped: Record<string, number> = {};
      data?.forEach((tx) => {
        const dateStr = format(new Date(tx.created_at), "yyyy-MM-dd");
        grouped[dateStr] = (grouped[dateStr] || 0) + tx.amount;
      });

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const result: DayData[] = daysArray.map((d) => {
        const dateStr = format(d, "yyyy-MM-dd");
        const xp = grouped[dateStr] || 0;
        const isToday = dateStr === format(today, "yyyy-MM-dd");
        return {
          day: dayNames[d.getDay()],
          xp,
          isToday,
          date: d,
        };
      });

      setDays(result);
      setLoading(false);
    };

    fetchWeekly();
  }, [user, supabase]);

  return { days, loading };
}
