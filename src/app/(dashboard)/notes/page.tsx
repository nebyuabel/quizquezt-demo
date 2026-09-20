"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import UnitList from "@/components/notes/UnitList";
import StudyChecklist from "@/components/notes/StudyChecklist";
import NoteReader from "@/components/notes/NoteReader";
import ContinueStudying from "@/components/notes/ContinueStudying";
import { useNotes } from "@/hooks/useNotes";

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { notes, loading: notesLoading } = useNotes(selectedUnitId);

  // Auto-select first note when notes load
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || notesLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
     
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-max-width mx-auto px-margin-mobile md:px-0 py-lg flex flex-col gap-lg">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md relative">
              <div className="flex flex-col gap-xs z-10">
                <h1 className="font-display-lg text-display-lg text-on-surface">
                  Study Notes
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Organize your thoughts, units, and action items.
                </p>
              </div>
              <div className="flex gap-sm z-10">
                <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">
                    filter_list
                  </span>
                  Filter
                </button>
                <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:-translate-y-0.5 transition-transform shadow-md shadow-primary/20">
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                  New Note
                </button>
              </div>
              <div className="absolute -top-xl -right-xl w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

            <ContinueStudying onSelectNote={setSelectedNoteId} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-lg relative">
              {/* Left Column */}
              <div className="md:col-span-4 flex flex-col gap-lg">
                <UnitList
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={setSelectedUnitId}
                />
                <StudyChecklist />
              </div>

              {/* Right Column: Note Editor */}
              <div className="md:col-span-8 flex flex-col h-full min-h-[600px]">
                <NoteReader note={selectedNote} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
