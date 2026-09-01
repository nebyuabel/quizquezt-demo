import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Objective {
  id: string;
  description: string;
  reward_xp: number;
  progress: number;
  target: number;
  completed: boolean;
}

export function useDailyObjectives() {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchObjectives = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Get all quest templates
    const { data: quests, error: questsError } = await supabase
      .from("daily_quests")
      .select("*");

    if (questsError) {
      console.error("Error fetching daily quests:", questsError);
      setLoading(false);
      return;
    }

    // Get today's progress
    const { data: progressData, error: progressError } = await supabase
      .from("user_daily_quest_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("quest_date", today);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      setLoading(false);
      return;
    }

    const progressMap = new Map();
    progressData?.forEach((p) => progressMap.set(p.quest_id, p));

    const result: Objective[] = quests.map((q) => {
      const prog = progressMap.get(q.id);
      const completed = prog?.completed || prog?.progress >= q.objective_target;
      return {
        id: q.id,
        description:
          q.description || `Complete ${q.objective_target} ${q.objective_type}`,
        reward_xp: q.reward_xp || 4,
        progress: prog?.progress || 0,
        target: q.objective_target,
        completed,
      };
    });

    setObjectives(result);
    setCompletedCount(result.filter((o) => o.completed).length);
    setLoading(false);
  };

  useEffect(() => {
    fetchObjectives();
  }, [user]);

  const refresh = async () => {
    setLoading(true);
    await fetchObjectives();
  };

  return { objectives, completedCount, loading, refresh };
}
