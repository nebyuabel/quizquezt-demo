import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface FlashcardSession {
  id: string;
  deck_id: string;
  current_card_index: number;
  status: "in_progress" | "completed";
}

export function useFlashcardSession(deckId: string | null) {
  const { user } = useAuth();
  const supabase = createClient();
  const [session, setSession] = useState<FlashcardSession | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionIdRef = useRef<string | null>(null);

  // Get or create session
  useEffect(() => {
    if (!user || !deckId) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      // Check for existing in-progress session
      const { data, error } = await supabase
        .from("flashcard_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("deck_id", deckId)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching session:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setSession(data);
        setLoading(false);
        return;
      }

      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from("flashcard_sessions")
        .insert({
          user_id: user.id,
          deck_id: deckId,
          current_card_index: 0,
          status: "in_progress",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating session:", createError);
        setLoading(false);
        return;
      }

      setSession(newSession);
      setLoading(false);
    };

    getSession();
  }, [user, deckId, supabase]);

  const updateProgress = useCallback(
    async (newIndex: number) => {
      if (!session) return;
      const { error } = await supabase
        .from("flashcard_sessions")
        .update({ current_card_index: newIndex })
        .eq("id", session.id);

      if (error) {
        console.error("Error updating session:", error);
      } else {
        setSession((prev) =>
          prev ? { ...prev, current_card_index: newIndex } : null,
        );
      }
    },
    [session, supabase],
  );

  const completeSession = useCallback(async () => {
    // Use the ref to ensure we have the ID even if session state is cleared
    const id = sessionIdRef.current || session?.id;
    if (!id) {
      console.error("No session ID available");
      return null;
    }

    const { data, error } = await supabase.rpc("complete_flashcard_session", {
      session_id: id,
    });

    if (error) {
      console.error("Error completing flashcard session:", error);
      return null;
    }

    // Update local state to completed
    setSession((prev) => (prev ? { ...prev, status: "completed" } : null));

    return data;
  }, [session, supabase]);

  return { session, loading, updateProgress, completeSession };
}
