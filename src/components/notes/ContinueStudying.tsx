"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface RecentNote {
  id: string;
  title: string;
  unit_name: string;
  last_position: number;
}

export default function ContinueStudying({
  onSelectNote,
}: {
  onSelectNote: (noteId: string) => void;
}) {
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchRecent = async () => {
      const { data, error } = await supabase
        .from("note_progress")
        .select(
          `
          note_id,
          last_position,
          notes!inner (id, title, unit_id, units (name))
        `,
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent notes:", error);
        return;
      }

      const formatted = (data || []).map((item: any) => ({
        id: item.notes.id,
        title: item.notes.title,
        unit_name: item.notes.units?.name || "Unknown Unit",
        last_position: item.last_position || 0,
      }));

      setRecentNotes(formatted);
    };

    fetchRecent();
  }, [user, supabase]);

  if (recentNotes.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-2xl p-md shadow-lg mb-md">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
        Continue Studying
      </h3>
      <div className="space-y-sm">
        {recentNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className="w-full flex items-center justify-between p-sm rounded-lg bg-surface hover:bg-surface-variant transition-colors"
          >
            <div className="text-left">
              <p className="font-label-md text-label-md text-on-surface">
                {note.title}
              </p>
              <p className="font-label-sm text-label-sm text-text-muted">
                {note.unit_name}
              </p>
            </div>
            <div className="flex items-center gap-sm">
              {note.last_position > 0 && (
                <span className="font-label-sm text-label-sm text-text-muted">
                  Resume
                </span>
              )}
              <span className="material-symbols-outlined text-primary">
                play_circle
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
