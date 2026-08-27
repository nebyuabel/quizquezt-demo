import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useFlashcardAttempts() {
  const { user } = useAuth();
  const supabase = createClient();

  const recordAttempt = useCallback(
    async (cardId: string, difficulty: "easy" | "good" | "hard") => {
      if (!user) return;

      const { error } = await supabase.from("flashcard_attempts").insert({
        user_id: user.id,
        flashcard_id: cardId,
        correct: difficulty === "easy" || difficulty === "good", // treat good/easy as correct, hard as incorrect
        // We don't have a session_id yet, but we could link to flashcard_sessions
        // For now, leave session_id null.
      });

      if (error) {
        console.error("Error recording attempt:", error);
      }
    },
    [user, supabase],
  );

  return { recordAttempt };
}
