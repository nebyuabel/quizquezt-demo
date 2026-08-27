"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuizSession } from "@/hooks/useQuizSessions";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuestionNavigator from "@/components/quiz/QuestionNavigator";
import Timer from "@/components/quiz/Timer";
import ProgressBar from "@/components/quiz/ProgressBar";
import { useEffect, useState } from "react";

export default function QuizPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    session,
    loading,
    currentIndex,
    questions,
    answers,
    flagged,
    setAnswer,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    totalQuestions,
    isComplete,
  } = useQuizSession(sessionId);

  const [showFormula, setShowFormula] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Redirect if session is completed
  useEffect(() => {
    if (isComplete) {
      router.push(`/quiz/${sessionId}/results`);
    }
  }, [isComplete, router, sessionId]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="bg-surface-charcoal rounded-xl p-8 text-center">
          <p className="text-on-surface text-body-lg">
            Quiz session not found.
          </p>
          <button
            onClick={() => router.push("/quizzes")}
            className="mt-4 bg-primary text-on-primary px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] || null;
  const isFlagged = flagged[currentIndex] || false;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full h-full max-w-[1200px] mx-auto px-sm md:px-lg py-lg md:py-xl gap-lg">
          {/* Top Bar: Title, Timer, etc. */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">
                  {session.is_euee ? "EUEE Exam" : "Quiz"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(157,78,221,0.6)]"></span>
                <span className="font-label-sm text-label-sm text-text-muted">
                  {session.mode === "hard" ? "Hard Mode" : "Normal Mode"}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                {session.unit_id ? "Unit Quiz" : "Practice Quiz"}
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-md">
              {session.mode === "hard" && (
                <div className="flex flex-col items-end gap-base">
                  <span className="font-label-sm text-label-sm text-text-muted">
                    Time Remaining
                  </span>
                  <Timer
                    duration={15 * 60}
                    onTimeUp={() => alert("Time is up!")}
                  />
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">
                  pause
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-lg md:gap-xl w-full">
            {/* Left: Question */}
            <div className="flex-1 flex flex-col gap-md order-2 md:order-1">
              <div className="relative">
                <ProgressBar current={currentIndex} total={totalQuestions} />
              </div>

              <QuizQuestion
                question={currentQuestion}
                index={currentIndex}
                selectedAnswer={selectedAnswer}
                onSelect={(answer) => setAnswer(currentIndex, answer)}
                onFlag={() => toggleFlag(currentIndex)}
                flagged={isFlagged}
              />

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-sm">
                <button
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="px-lg py-sm rounded-xl font-label-md text-label-md text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_back
                  </span>
                  Previous
                </button>
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="px-lg py-sm rounded-xl font-label-md text-label-md text-on-primary bg-primary hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(157,78,221,0.39)] flex items-center gap-xs"
                  >
                    Next Question
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={completeQuiz}
                    className="px-lg py-sm rounded-xl font-label-md text-label-md text-on-primary bg-success-green hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(46,204,113,0.39)] flex items-center gap-xs"
                  >
                    Submit Quiz
                    <span className="material-symbols-outlined text-[20px]">
                      check_circle
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Sidebar: Navigator & Formula */}
            <div className="w-full md:w-80 flex flex-col gap-md order-1 md:order-2">
              {/* Mobile Timer */}
              {session.mode === "hard" && (
                <div className="md:hidden flex items-center justify-between bg-surface-charcoal p-md rounded-xl shadow-md">
                  <div className="flex flex-col gap-base">
                    <span className="font-label-sm text-label-sm text-text-muted">
                      Time Remaining
                    </span>
                    <Timer
                      duration={15 * 60}
                      onTimeUp={() => alert("Time is up!")}
                    />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center cursor-pointer">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      pause
                    </span>
                  </div>
                </div>
              )}

              <QuestionNavigator
                total={totalQuestions}
                current={currentIndex}
                answers={answers}
                flagged={flagged}
                onSelect={goToQuestion}
              />

              <div className="bg-surface-charcoal rounded-xl p-md shadow-md flex flex-col gap-sm">
                <h3 className="font-label-md text-label-md text-on-surface">
                  Formula Sheet
                </h3>
                <p className="font-body-sm text-label-sm text-text-muted mb-xs">
                  Quick access to allowed formulas for this unit.
                </p>
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="w-full py-sm rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    calculate
                  </span>
                  {showFormula ? "Hide Formulas" : "View Formulas"}
                </button>
                {showFormula && (
                  <div className="mt-2 p-3 bg-surface-container rounded-lg text-label-sm text-on-surface-variant">
                    <p className="font-mono">v = u + at</p>
                    <p className="font-mono mt-1">s = ut + ½at²</p>
                    <p className="font-mono mt-1">v² = u² + 2as</p>
                    <p className="font-mono mt-1">F = ma</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
