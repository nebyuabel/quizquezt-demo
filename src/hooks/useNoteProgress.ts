import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useNoteProgress(noteId: string | null) {
  const { user } = useAuth();
  const supabase = createClient();
  const [progress, setProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Get progress on mount or when note changes
  useEffect(() => {
    if (!user || !noteId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("note_progress")
        .select("last_position")
        .eq("user_id", user.id)
        .eq("note_id", noteId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching note progress:", error);
        setLoading(false);
        return;
      }

      setProgress(data?.last_position || 0);
      setLoading(false);
    };

    fetchProgress();
  }, [user, noteId, supabase]);

  // Update progress
  const updateProgress = useCallback(
    async (position: number) => {
      if (!user || !noteId) return;

      const { error } = await supabase.from("note_progress").upsert(
        {
          user_id: user.id,
          note_id: noteId,
          last_position: position,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, note_id" },
      );

      if (error) console.error("Error updating note progress:", error);
    },
    [user, noteId, supabase],
  );

  return { progress, loading, updateProgress };
}
