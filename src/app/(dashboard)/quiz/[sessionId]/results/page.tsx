"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function QuizResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { results, loading } = useQuizResults(sessionId);

  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger confetti only if score >= 60
  useEffect(() => {
    if (results && results.score >= 60) {
      setShowConfetti(true);
    }
  }, [results]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Confetti animation
  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
    }[] = [];

    const colors = ["#e0b6ff", "#9d4edd", "#edc156", "#2ECC71", "#F39C12"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 5 - 2.5,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y > canvas.height) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showConfetti]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="bg-surface-charcoal rounded-xl p-8 text-center">
          <p className="text-on-surface text-body-lg">Results not found.</p>
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

  const isPassed = results.score >= 60;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="relative pt-16 bg-surface min-h-screen md:pl-64">
        <div className="flex flex-col w-full h-full min-h-[calc(100vh-64px)] relative overflow-hidden bg-surface items-center justify-center p-md">
          {/* Background Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[100px] animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px]"
              style={{
                animation:
                  "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate",
              }}
            ></div>
          </div>

          {/* Confetti Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          />

          {/* Main Content */}
          <div className="relative z-20 flex flex-col items-center max-w-[600px] w-full gap-lg">
            {/* Icon */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-md">
              <div className="absolute inset-0 bg-rank-gold/20 rounded-full blur-xl"></div>
              <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)] relative z-10">
                <span
                  className="material-symbols-outlined text-[64px] text-rank-gold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPassed ? "emoji_events" : "sentiment_dissatisfied"}
                </span>
              </div>
            </div>

            {/* Headings */}
            <div className="text-center space-y-sm">
              <span className="font-label-md text-label-md text-tertiary uppercase tracking-widest block">
                {isPassed ? "Mission Accomplished" : "Keep Going!"}
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tighter">
                {isPassed ? "Quest Complete!" : "Nice Try!"}
              </h1>
              <p className="font-body-md text-body-md text-text-muted">
                {isPassed
                  ? "You demonstrated mastery. Keep the momentum!"
                  : "Practice makes perfect. Review the questions and try again."}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-md mt-sm">
              {/* XP Earned */}
              <div className="bg-surface-container-low p-md rounded-2xl flex flex-col items-center justify-center gap-xs shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span
                  className="material-symbols-outlined text-[32px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-headline-lg text-headline-lg text-on-surface">
                  {results.xp_earned}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  XP Earned
                </span>
              </div>

              {/* Accuracy */}
              <div className="bg-surface-container-low p-md rounded-2xl flex flex-col items-center justify-center gap-xs shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute inset-0 bg-success-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span
                  className="material-symbols-outlined text-[32px] text-success-green"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-on-surface">
                    {results.correct_count}
                  </span>
                  <span className="font-headline-md text-headline-md text-on-surface-variant">
                    / {results.total_questions}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Correct
                </span>
              </div>

              {/* Score */}
              <div className="bg-surface-container-low p-md rounded-2xl flex flex-col items-center justify-center gap-xs shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute inset-0 bg-warning-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span
                  className="material-symbols-outlined text-[32px] text-warning-orange"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  score
                </span>
                <span className="font-headline-lg text-headline-lg text-on-surface">
                  {results.score}%
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Score
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-lg w-full flex justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-primary text-on-primary px-xl py-sm rounded-full font-headline-md text-headline-md shadow-[0_4px_20px_rgba(157,78,221,0.4)] hover:shadow-[0_6px_25px_rgba(157,78,221,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-sm group relative overflow-hidden"
              >
                <span className="relative z-10">Continue Journey</span>
                <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-0"></div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
