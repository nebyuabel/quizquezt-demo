import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function useNotes(unitId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!unitId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, created_at")
        .eq("unit_id", unitId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching notes:", error);
        setLoading(false);
        return;
      }

      setNotes(data || []);
      setLoading(false);
    };

    fetchNotes();
  }, [unitId, supabase]);

  return { notes, loading };
}
