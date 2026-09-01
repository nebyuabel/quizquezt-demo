"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SubjectMatrix from "@/components/dashboard/SubjectMatrix";

export default function EueePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-rank-gold">
                workspace_premium
              </span>
              <div>
                <h1 className="font-display-lg text-display-lg text-on-surface">
                  EUEE Practice
                </h1>
                <p className="font-body-md text-body-md text-text-muted mt-1">
                  Ethiopian University Entrance Exam preparation with higher
                  rewards.
                </p>
              </div>
            </div>
          </div>
          <SubjectMatrix isEuee={true} />
        </div>
      </main>
    </div>
  );
}
