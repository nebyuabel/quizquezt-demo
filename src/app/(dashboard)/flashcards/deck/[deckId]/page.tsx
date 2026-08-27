"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFlashcardDeck } from "@/hooks/useFlashcardDeck";
import { useFlashcardSession } from "@/hooks/useFlashcardSession";
import { useFlashcardAttempts } from "@/hooks/useFlashcardAttempts";
import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function FlashcardStudyPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { deck, loading: deckLoading } = useFlashcardDeck(deckId);
  const {
    session,
    loading: sessionLoading,
    updateProgress,
    completeSession,
  } = useFlashcardSession(deckId);
  const { recordAttempt } = useFlashcardAttempts();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // Store session ID when it loads
  useEffect(() => {
    if (session?.id) {
      sessionIdRef.current = session.id;
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (session) {
      setCurrentIndex(session.current_card_index);
    }
  }, [session]);

  useEffect(() => {
    if (session && currentIndex !== session.current_card_index) {
      updateProgress(currentIndex);
    }
  }, [currentIndex, session, updateProgress]);

  if (authLoading || deckLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!deck || !session) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="bg-surface-charcoal rounded-xl p-8 text-center">
          <p className="text-on-surface text-body-lg">Deck not found.</p>
          <button
            onClick={() => router.push("/flashcards")}
            className="mt-4 bg-primary text-on-primary px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const cards = deck.cards;
  const totalCards = cards.length;
  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (difficulty: "easy" | "good" | "hard") => {
    if (!currentCard) return;

    await recordAttempt(currentCard.id, difficulty);

    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Last card – complete session and go to results
      const result = await completeSession();
      if (result && sessionIdRef.current) {
        router.push(`/flashcards/session/${sessionIdRef.current}/results`);
      } else {
        // fallback: go to flashcards list
        router.push("/flashcards");
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-col gap-xl w-full max-w-[1200px] mx-auto px-md py-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                  {deck.name}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    folder
                  </span>
                  Science / Biology
                  <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                  {totalCards - currentIndex} Cards Remaining
                </p>
              </div>
              <div className="flex items-center gap-sm bg-surface-container rounded-xl p-xs">
                <div className="flex flex-col px-md py-xs items-center justify-center border-r border-outline-variant/20">
                  <span className="font-label-sm text-label-sm text-on-surface-variant mb-[2px]">
                    Mastered
                  </span>
                  <span className="font-headline-md text-headline-md text-success-green">
                    0
                  </span>
                </div>
                <div className="flex flex-col px-md py-xs items-center justify-center border-r border-outline-variant/20">
                  <span className="font-label-sm text-label-sm text-on-surface-variant mb-[2px]">
                    Learning
                  </span>
                  <span className="font-headline-md text-headline-md text-warning-orange">
                    0
                  </span>
                </div>
                <div className="flex flex-col px-md py-xs items-center justify-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant mb-[2px]">
                    To Review
                  </span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {totalCards - currentIndex}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden shadow-sm">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Flashcard */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative w-full max-w-3xl mx-auto group perspective-[1000px]">
              <div
                className={`relative w-full h-[400px] transition-transform duration-700 preserve-3d cursor-pointer shadow-xl rounded-2xl ${isFlipped ? "flipped" : ""}`}
                onClick={handleFlip}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-surface-container-high rounded-2xl p-xl flex flex-col justify-center items-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-outline-variant/30 hover:shadow-[0_8px_32px_rgba(157,78,221,0.15)] transition-shadow">
                  <span className="absolute top-sm right-sm text-on-surface-variant/50 font-label-sm text-label-sm">
                    Prompt
                  </span>
                  <p className="font-headline-lg text-headline-lg text-on-surface mb-lg">
                    {currentCard.front}
                  </p>
                  <div className="mt-auto text-on-surface-variant/70 font-label-md text-label-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">
                      touch_app
                    </span>{" "}
                    Click to reveal answer
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface-container-highest rounded-2xl p-xl flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-primary/30">
                  <span className="absolute top-sm left-sm text-primary/70 font-label-sm text-label-sm">
                    Answer
                  </span>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-headline-md text-headline-md text-on-surface text-center">
                      {currentCard.back}
                    </p>
                  </div>
                  <div className="mt-auto flex justify-between items-center gap-md pt-md border-t border-outline-variant/20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("hard");
                      }}
                      className="flex-1 py-sm px-md rounded-xl bg-surface-container hover:bg-error-container text-on-surface hover:text-on-error-container font-label-md text-label-md transition-colors shadow-sm flex flex-col items-center gap-xs"
                    >
                      <span className="material-symbols-outlined">
                        sentiment_dissatisfied
                      </span>
                      Hard{" "}
                      <span className="text-[10px] text-on-surface-variant opacity-70">
                        10m
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("good");
                      }}
                      className="flex-1 py-sm px-md rounded-xl bg-surface-container hover:bg-warning-orange/20 text-on-surface hover:text-warning-orange font-label-md text-label-md transition-colors shadow-sm flex flex-col items-center gap-xs"
                    >
                      <span className="material-symbols-outlined">
                        sentiment_neutral
                      </span>
                      Good{" "}
                      <span className="text-[10px] text-on-surface-variant opacity-70">
                        1d
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("easy");
                      }}
                      className="flex-1 py-sm px-md rounded-xl bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md transition-colors shadow-sm flex flex-col items-center gap-xs"
                    >
                      <span className="material-symbols-outlined">
                        sentiment_satisfied
                      </span>
                      Easy{" "}
                      <span className="text-[10px] text-on-primary/70">4d</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center w-full max-w-3xl mx-auto mt-md">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-xs p-xs rounded-lg hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">
                  keyboard_arrow_left
                </span>{" "}
                Previous
              </button>
              <div className="flex gap-xs">
                <button
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
                  title="Edit Card"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
                  title="Flag Card"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    flag
                  </span>
                </button>
              </div>
              <button
                onClick={handleSkip}
                disabled={currentIndex === totalCards - 1}
                className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-xs p-xs rounded-lg hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip{" "}
                <span className="material-symbols-outlined text-[20px]">
                  keyboard_arrow_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
