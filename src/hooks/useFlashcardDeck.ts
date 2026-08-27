import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  total_cards: number;
}

export function useFlashcardDeck(deckId: string | null) {
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!deckId) {
      setLoading(false);
      return;
    }

    const fetchDeck = async () => {
      // Fetch deck info
      const { data: deckData, error: deckError } = await supabase
        .from("flashcard_decks")
        .select("id, name, description")
        .eq("id", deckId)
        .single();

      if (deckError || !deckData) {
        console.error("Error fetching deck:", deckError);
        setLoading(false);
        return;
      }

      // Fetch cards
      const { data: cards, error: cardsError } = await supabase
        .from("flashcards")
        .select("id, front, back")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true });

      if (cardsError) {
        console.error("Error fetching cards:", cardsError);
        setLoading(false);
        return;
      }

      setDeck({
        id: deckData.id,
        name: deckData.name,
        description: deckData.description,
        cards: cards || [],
        total_cards: cards?.length || 0,
      });
      setLoading(false);
    };

    fetchDeck();
  }, [deckId, supabase]);

  return { deck, loading };
}
