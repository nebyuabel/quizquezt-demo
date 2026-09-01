"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import ActiveUnits from "./ActiveUnits";

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

export default function SubjectMatrix(prop: { isEuee: boolean }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchSubjects(selectedGrade);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSubject) {
      fetchUnits(selectedSubject);
    }
  }, [selectedSubject]);

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

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
  };

  // Start a new quiz
  const startQuiz = async (mode: "normal" | "hard") => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedUnit) {
      alert("Please select a unit first.");
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch questions for the selected unit
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("unit_id", selectedUnit);

      if (questionsError) throw questionsError;

      if (!questions || questions.length === 0) {
        alert("No questions available for this unit yet.");
        setLoading(false);
        return;
      }

      // 2. Format questions for the session
      const formattedQuestions = questions.map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        user_answer: null,
        flagged: false,
      }));

      // 3. Create a new quiz session
      const { data: session, error: sessionError } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          unit_id: selectedUnit,
          mode: mode,
          is_euee: false,
          status: "in_progress",
          questions: formattedQuestions,
          current_index: 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 4. Navigate to the quiz page
      router.push(`/quiz/${session.id}`);
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Failed to start quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resume last study session
  const resumeLastStudy = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // No in-progress session, start a new one
        if (selectedUnit) {
          startQuiz("normal");
        } else {
          alert("Please select a unit first.");
        }
        return;
      }

      if (data) {
        router.push(`/quiz/${data.id}`);
      }
    } catch (error) {
      console.error("Error resuming study:", error);
    }
  };

  return (
    <div className="bg-surface-container-highest rounded-2xl p-md md:p-lg shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-md">
        <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[32px]">
            dashboard_customize
          </span>
          Subject Matrix
        </h2>
        <button
          onClick={resumeLastStudy}
          className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:-translate-y-1 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Loading..." : "Resume Last Study"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-sm mb-lg">
        <div className="bg-surface-container rounded-xl p-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">
            Select Grade
          </span>
          <select
            value={selectedGrade}
            onChange={handleGradeChange}
            className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-lg p-1 cursor-pointer"
            disabled={loading}
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id} className="bg-surface-container">
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
            onChange={handleSubjectChange}
            className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-lg p-1 cursor-pointer"
            disabled={loading}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface-container">
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
            onChange={handleUnitChange}
            className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-lg p-1 cursor-pointer"
            disabled={loading}
          >
            {units.map((u) => (
              <option key={u.id} value={u.id} className="bg-surface-container">
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Mode Selection Buttons */}
      <div className="flex gap-sm mb-lg">
        <button
          onClick={() => startQuiz("normal")}
          className="flex-1 py-sm rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20 font-label-md text-label-md text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !selectedUnit}
        >
          <span className="flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined text-[20px]">
              school
            </span>
            Normal Mode
          </span>
        </button>
        <button
          onClick={() => startQuiz("hard")}
          className="flex-1 py-sm rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/30 font-label-md text-label-md text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !selectedUnit}
        >
          <span className="flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            Hard Mode
          </span>
        </button>
      </div>

      <ActiveUnits />
    </div>
  );
}
