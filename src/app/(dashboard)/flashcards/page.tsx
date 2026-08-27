"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FlashcardMatrix from "@/components/flashcards/FlashcardMatrix";
import ContinueSession from "@/components/flashcards/ContinueSession";

export default function FlashcardsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-sm md:px-lg py-lg md:py-xl space-y-xl md:space-y-16">
          <div className="flex flex-col">
            <h1 className="font-display-lg text-display-lg text-on-surface">
              Flashcards
            </h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Master concepts with spaced repetition.
            </p>
          </div>

          <ContinueSession />
          <FlashcardMatrix />
        </div>
      </main>
    </div>
  );
}
