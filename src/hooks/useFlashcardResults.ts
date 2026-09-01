// src/hooks/useFlashcardResults.ts
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface FlashcardResults {
  id: string;
  deck_name: string;
  cards_studied: number;
  xp_earned: number;
  coins_earned: number;
  completed_at: string;
}

export function useFlashcardResults(sessionId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  const [results, setResults] = useState<FlashcardResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("flashcard_sessions")
        .select(
          `
          id,
          xp_earned,
          coins_earned,
          cards_studied,
          completed_at,
          flashcard_decks!inner (
            name
          )
        `,
        )
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching flashcard results:", error);
        setLoading(false);
        return;
      }

      // Handle deck name: data.flashcard_decks is an array
      let deckName = "Unknown Deck";
      if (
        Array.isArray(data.flashcard_decks) &&
        data.flashcard_decks.length > 0
      ) {
        deckName = data.flashcard_decks[0].name || "Unknown Deck";
      } else if (
        data.flashcard_decks &&
        typeof data.flashcard_decks === "object" &&
        "name" in data.flashcard_decks
      ) {
        deckName = (data.flashcard_decks as any).name;
      }

      setResults({
        id: data.id,
        deck_name: deckName,
        cards_studied: data.cards_studied || 0,
        xp_earned: data.xp_earned || 0,
        coins_earned: data.coins_earned || 0,
        completed_at: data.completed_at,
      });
      setLoading(false);
    };

    fetchResults();
  }, [user, sessionId, supabase]);

  return { results, loading };
}
