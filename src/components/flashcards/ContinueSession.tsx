"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Session {
  id: string;
  deck_id: string;
  deck_name: string;
  current_card_index: number;
  total_cards: number;
}

export default function ContinueSession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("flashcard_sessions")
        .select(
          `
          id,
          deck_id,
          current_card_index,
          flashcard_decks!inner (name)
        `,
        )
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
        return;
      }

      // Also get total cards per deck
      const sessionsWithCount = await Promise.all(
        (data || []).map(async (s: any) => {
          const { count } = await supabase
            .from("flashcards")
            .select("id", { count: "exact", head: true })
            .eq("deck_id", s.deck_id);
          return {
            id: s.id,
            deck_id: s.deck_id,
            deck_name: s.flashcard_decks.name,
            current_card_index: s.current_card_index,
            total_cards: count || 0,
          };
        }),
      );

      setSessions(sessionsWithCount);
    };

    fetchSessions();
  }, [user, supabase]);

  if (sessions.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-2xl p-md shadow-lg mb-md">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
        Continue Studying
      </h3>
      <div className="space-y-sm">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => router.push(`/flashcards/deck/${session.deck_id}`)}
            className="w-full flex items-center justify-between p-sm rounded-lg bg-surface hover:bg-surface-variant transition-colors"
          >
            <div>
              <p className="font-label-md text-label-md text-on-surface">
                {session.deck_name}
              </p>
              <p className="font-label-sm text-label-sm text-text-muted">
                {session.current_card_index + 1} of {session.total_cards} cards
              </p>
            </div>
            <span className="material-symbols-outlined text-primary">
              play_circle
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
