import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

import { useRouter } from "next/navigation";

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  user_answer: string | null;
  flagged: boolean;
}

export interface QuizSession {
  id: string;
  unit_id: string;
  mode: "normal" | "hard";
  is_euee: boolean;
  started_at: string;
  questions: QuizQuestion[];
  current_index: number;
  status: "in_progress" | "completed" | "abandoned";
  score: number | null;
  correct_count: number | null;
  incorrect_count: number | null;
  xp_earned: number | null;
  coins_earned: number | null;
}

export function useQuizSession(sessionId: string) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  // Fetch session on mount
  useEffect(() => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching session:", error);
        router.push("/quizzes");
        return;
      }

      // Check if completed
      if (data.status === "completed") {
        // Redirect to results page (we'll implement later)
        router.push(`/quiz/${sessionId}/results`);
        return;
      }

      // Parse questions JSON
      const questions: QuizQuestion[] = data.questions || [];
      const current = data.current_index || 0;

      // Build answer and flagged maps
      const answerMap: Record<number, string> = {};
      const flagMap: Record<number, boolean> = {};
      questions.forEach((q, idx) => {
        if (q.user_answer) answerMap[idx] = q.user_answer;
        if (q.flagged) flagMap[idx] = true;
      });

      setSession({
        id: data.id,
        unit_id: data.unit_id,
        mode: data.mode,
        is_euee: data.is_euee,
        started_at: data.started_at,
        questions,
        current_index: current,
        status: data.status,
        score: data.score,
        correct_count: data.correct_count,
        incorrect_count: data.incorrect_count,
        xp_earned: data.xp_earned,
        coins_earned: data.coins_earned,
      });
      setCurrentIndex(current);
      setAnswers(answerMap);
      setFlagged(flagMap);
      setLoading(false);
    };

    fetchSession();
  }, [user, sessionId, supabase, router]);

  // Save current state to DB (debounced)
  const saveState = useCallback(async () => {
    if (!session) return;

    // Update questions array with answers and flags
    const updatedQuestions = session.questions.map((q, idx) => ({
      ...q,
      user_answer: answers[idx] || null,
      flagged: flagged[idx] || false,
    }));

    const { error } = await supabase
      .from("quiz_sessions")
      .update({
        questions: updatedQuestions,
        current_index: currentIndex,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (error) console.error("Error saving quiz state:", error);
  }, [session, answers, flagged, currentIndex, supabase]);

  // Auto-save on changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (session && !loading) {
        saveState();
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [answers, flagged, currentIndex, saveState, session, loading]);

  // Update answer for a question
  const setAnswer = useCallback((index: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  }, []);

  // Toggle flag for a question
  const toggleFlag = useCallback((index: number) => {
    setFlagged((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  // Navigate to question
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < (session?.questions.length || 0)) {
        setCurrentIndex(index);
      }
    },
    [session],
  );

  // Next question
  const nextQuestion = useCallback(() => {
    if (session && currentIndex < session.questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, session, goToQuestion]);

  // Previous question
  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  // Complete quiz (submit)
  const completeQuiz = useCallback(async () => {
    if (!session) return;

    // Ensure all questions are answered (optional: allow skipping)
    // For now, we'll allow incomplete

    // Call a secure function to complete the quiz
    const { data, error } = await supabase.rpc("complete_quiz_session", {
      session_id: session.id,
    });

    if (error) {
      console.error("Error completing quiz:", error);
      throw new Error("Failed to complete quiz");
    }

    // Redirect to results page
    router.push(`/quiz/${session.id}/results`);
  }, [session, supabase, router]);

  return {
    session,
    loading,
    currentIndex,
    questions: session?.questions || [],
    answers,
    flagged,
    setAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    totalQuestions: session?.questions.length || 0,
    isComplete: session?.status === "completed",
  };
}
