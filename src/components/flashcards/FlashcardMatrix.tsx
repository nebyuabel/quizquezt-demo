"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Grade {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
}

export default function FlashcardMatrix() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) fetchSubjects(selectedGrade);
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSubject) fetchUnits(selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedUnit) fetchDecks(selectedUnit);
  }, [selectedUnit]);

  const fetchGrades = async () => {
    const { data } = await supabase
      .from("grades")
      .select("*")
      .order("display_order");
    if (data) {
      setGrades(data);
      if (data.length > 0) setSelectedGrade(data[0].id);
    }
  };

  const fetchSubjects = async (gradeId: string) => {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("grade_id", gradeId)
      .order("display_order");
    if (data) {
      setSubjects(data);
      if (data.length > 0) setSelectedSubject(data[0].id);
    }
  };

  const fetchUnits = async (subjectId: string) => {
    const { data } = await supabase
      .from("units")
      .select("*")
      .eq("subject_id", subjectId)
      .order("display_order");
    if (data) {
      setUnits(data);
      if (data.length > 0) setSelectedUnit(data[0].id);
    }
  };

  const fetchDecks = async (unitId: string) => {
    const { data } = await supabase
      .from("flashcard_decks")
      .select("id, name, description")
      .eq("unit_id", unitId);
    if (data) {
      setDecks(data);
    }
  };

  const startDeck = (deckId: string) => {
    router.push(`/flashcards/deck/${deckId}`);
  };

  return (
    <div className="bg-surface-container-highest rounded-2xl p-md md:p-lg shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-sm mb-md">
          <span className="material-symbols-outlined text-primary">style</span>
          Flashcard Decks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-sm mb-lg">
          <div className="bg-surface-container rounded-xl p-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">
              Select Grade
            </span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-lg p-1 cursor-pointer"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-surface-container rounded-xl p-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">
              Select Subject
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-lg p-1 cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-surface-container rounded-xl p-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">
              Select Unit
            </span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-lg p-1 cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => startDeck(deck.id)}
                className="bg-surface-container rounded-xl p-sm hover:bg-surface-variant transition-colors text-left cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                      {deck.name}
                    </h3>
                    <p className="font-label-sm text-label-sm text-text-muted">
                      {deck.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary">
                    play_arrow
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-xl p-md text-center text-text-muted">
            No flashcard decks available for this unit.
          </div>
        )}
      </div>
    </div>
  );
}
