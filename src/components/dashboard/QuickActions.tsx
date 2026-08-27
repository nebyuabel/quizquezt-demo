"use client";

import Link from "next/link";

export default function QuickActions() {
  return (
    <>
      <Link
        href="/flashcards"
        className="block bg-surface-container rounded-2xl p-md shadow-lg group hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdu5qRrrO3pKvNnEEbZNsyabX8L82qryTSLwSiy0Mno1aO78OsAR6GsOWYQwCe9NuDePyggAk7xVOH1o5_gEiUAbeMaIFEojdQ3zjB3sFlZS0B_bulk7CyvqYZh5MxRSs5mnuYJsFczfcFzeTULcts4p5H7lwEhhbK0_QXsW-NUX12Rv2qBdd9B0rY3lksi-G90vbcUBF2Y0XEEuZSKZwaN0TO1_KrtSpRnof3JAi5A_Br6YrT2UYN')",
          }}
        ></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-lg">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[24px]">
                style
              </span>
            </div>
            {/* Remove the badge if we don't have real data */}
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs group-hover:text-primary transition-colors">
              Daily Flashcards
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Review spaced repetition deck.
            </p>
          </div>
        </div>
      </Link>

      <Link
        href="/quizzes"
        className="block bg-surface-container rounded-2xl p-md shadow-lg group hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABEEetVduvRbAIXYl9OOSI7SBd-WlPl98nHejUiW-VBKLco2D2Dctc4QPY_o4FZn15aEymBMoc4_5O5jE5DNACK2-D7FhD6_fa8rx8aYeHr3keW-Pmtn1BBg0IucgrcsncsgUTYSsD-Wg2eQ8z-J3hbzHh9yzTPQpB2OmvDMkvRSlIn5e5Zijfr4vKFc2KJmaVFp5iRmzRdPoZ62mmvJs7Ff255VczJjIqaJZJzO8-RxLGmyw4dUFf')",
          }}
        ></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-lg">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container text-[24px]">
                quiz
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs group-hover:text-secondary transition-colors">
              Mock Exam
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Take a comprehensive test.
            </p>
          </div>
        </div>
      </Link>
    </>
  );
}
