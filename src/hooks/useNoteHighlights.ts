import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Highlight {
  id: string;
  start_offset: number;
  end_offset: number;
  color: string;
  annotation?: string;
}

export function useNoteHighlights(noteId: string | null) {
  const { user } = useAuth();
  const supabase = createClient();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !noteId) {
      setHighlights([]);
      setLoading(false);
      return;
    }

    const fetchHighlights = async () => {
      const { data, error } = await supabase
        .from("note_highlights")
        .select(
          `
          id,
          start_offset,
          end_offset,
          color,
          note_annotations (annotation)
        `,
        )
        .eq("user_id", user.id)
        .eq("note_id", noteId);

      if (error) {
        console.error("Error fetching highlights:", error);
        setLoading(false);
        return;
      }

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        start_offset: item.start_offset,
        end_offset: item.end_offset,
        color: item.color || "#fbbf24",
        annotation: item.note_annotations?.[0]?.annotation || undefined,
      }));

      setHighlights(formatted);
      setLoading(false);
    };

    fetchHighlights();
  }, [user, noteId, supabase]);

  const addHighlight = useCallback(
    async (start: number, end: number, annotation?: string) => {
      if (!user || !noteId) return;

      // Insert highlight
      const { data: highlightData, error: highlightError } = await supabase
        .from("note_highlights")
        .insert({
          user_id: user.id,
          note_id: noteId,
          start_offset: start,
          end_offset: end,
          color: "#fbbf24",
        })
        .select()
        .single();

      if (highlightError) {
        console.error("Error adding highlight:", highlightError);
        return;
      }

      // If annotation provided, insert it
      if (annotation && highlightData) {
        const { error: annotationError } = await supabase
          .from("note_annotations")
          .insert({
            user_id: user.id,
            note_id: noteId,
            highlight_id: highlightData.id,
            annotation: annotation,
          });

        if (annotationError)
          console.error("Error adding annotation:", annotationError);
      }

      // Update local state
      setHighlights((prev) => [
        ...prev,
        {
          id: highlightData.id,
          start_offset: start,
          end_offset: end,
          color: "#fbbf24",
          annotation: annotation,
        },
      ]);
    },
    [user, noteId, supabase],
  );

  return { highlights, loading, addHighlight };
}
