import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export interface QuizResults {
  id: string;
  score: number;
  correct_count: number;
  incorrect_count: number;
  xp_earned: number;
  coins_earned: number;
  total_questions: number;
  mode: "normal" | "hard";
  is_euee: boolean;
  completed_at: string;
}

export function useQuizResults(sessionId: string) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select(
          "id, score, correct_count, incorrect_count, xp_earned, coins_earned, mode, is_euee, completed_at, questions",
        )
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching results:", error);
        router.push("/quizzes");
        return;
      }

      // If not completed, redirect to quiz page
      if (data.score === null) {
        router.push(`/quiz/${sessionId}`);
        return;
      }

      const totalQuestions = data.questions ? data.questions.length : 0;

      setResults({
        id: data.id,
        score: data.score,
        correct_count: data.correct_count || 0,
        incorrect_count: data.incorrect_count || 0,
        xp_earned: data.xp_earned || 0,
        coins_earned: data.coins_earned || 0,
        total_questions: totalQuestions,
        mode: data.mode,
        is_euee: data.is_euee,
        completed_at: data.completed_at,
      });
      setLoading(false);
    };

    fetchResults();
  }, [user, sessionId, supabase, router]);

  return { results, loading };
}
