"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Redirect will happen automatically via the useEffect above after auth state change
      // but we can also push here for immediate feedback
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // OAuth redirects away, no need to handle further
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleTelegramSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "telegram",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Telegram");
      setLoading(false);
    }
  };

  return (
    <main className="w-full flex items-center justify-center min-h-screen bg-surface">
      <div className="flex flex-col w-full min-h-screen relative overflow-hidden items-center justify-center">
        {/* Ambient Background Glows */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container/10 blur-[120px]"></div>
          <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-primary-container/5 blur-[80px]"></div>
        </div>

        {/* Login Container */}
        <div className="w-full max-w-md mx-auto relative z-10 p-margin-mobile md:p-margin-desktop">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center justify-center mb-lg">
            <div className="w-16 h-16 rounded-xl bg-surface-container-high shadow-xl flex items-center justify-center mb-md relative overflow-hidden group cursor-default">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span
                className="material-symbols-outlined text-display-lg text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mb-xs tracking-tight">
              Welcome back, Quester!
            </h1>
            <p className="font-body-md text-body-md text-text-muted text-center max-w-[280px]">
              Resume your journey to academic excellence.
            </p>
          </div>

          {/* Card */}
          <div className="bg-surface-charcoal rounded-xl shadow-2xl p-lg relative overflow-hidden">
            {/* Subtle Top Border Highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            {/* Error message */}
            {error && (
              <div className="mb-md p-sm bg-error/10 border border-error/20 rounded-lg text-error text-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px]">
                  error
                </span>
                {error}
              </div>
            )}

            {/* Social Logins */}
            <div className="flex flex-col gap-sm mb-lg">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-xs rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors duration-200 text-on-surface font-label-md text-label-md group relative disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="absolute left-0 w-1 h-full bg-on-surface-variant/20 rounded-l-lg group-hover:bg-primary/50 transition-colors"></span>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  login
                </span>
                Continue with Google
              </button>
              <button
                onClick={handleTelegramSignIn}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-xs rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors duration-200 text-on-surface font-label-md text-label-md group relative disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="absolute left-0 w-1 h-full bg-[#2AABEE]/20 rounded-l-lg group-hover:bg-[#2AABEE] transition-colors"></span>
                <svg
                  className="w-[20px] h-[20px] fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Continue with Telegram
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-md mb-lg">
              <div className="flex-1 h-[1px] bg-border-subtle"></div>
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">
                Or
              </span>
              <div className="flex-1 h-[1px] bg-border-subtle"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs relative">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">
                  Email
                </label>
                <div className="relative group">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#14141A] rounded-lg h-12 pl-xl pr-sm font-body-md text-body-md text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="student@university.edu.et"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-xs relative">
                <div className="flex justify-between items-center ml-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#14141A] rounded-lg h-12 pl-xl pr-sm font-body-md text-body-md text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-xs w-full h-12 bg-primary rounded-lg text-on-primary font-label-md text-label-md flex items-center justify-center gap-xs hover:-translate-y-[1px] hover:shadow-[0_0_15px_rgba(157,78,221,0.3)] transition-all duration-200 relative overflow-hidden group disabled:opacity-80 disabled:pointer-events-none"
              >
                <span className="relative z-10 flex items-center gap-xs group-hover:gap-sm transition-all">
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      refresh
                    </span>
                  ) : (
                    <>
                      Start Studying
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-lg text-center font-body-md text-body-md text-text-muted">
            New to QuizQuest?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary-fixed transition-colors font-label-md"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
