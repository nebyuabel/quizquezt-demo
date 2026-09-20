"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  users: number;
  questions: number;
  flashcards: number;
  notes: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, questionsRes, flashcardsRes, notesRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("questions")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("flashcards")
              .select("*", { count: "exact", head: true }),
            supabase.from("notes").select("*", { count: "exact", head: true }),
          ]);

        setStats({
          users: usersRes.count || 0,
          questions: questionsRes.count || 0,
          flashcards: flashcardsRes.count || 0,
          notes: notesRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-text-muted">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display-lg text-display-lg text-on-surface">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:opacity-80 transition"
        >
          Logout
        </button>
      </div>
      <p className="text-text-muted text-body-lg mb-8">
        Welcome to the admin panel. Manage your platform content.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats?.users },
          { label: "Questions", value: stats?.questions },
          { label: "Flashcards", value: stats?.flashcards },
          { label: "Notes", value: stats?.notes },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-surface-charcoal p-6 rounded-xl border border-border-subtle"
          >
            <p className="text-text-muted text-sm m-0">{item.label}</p>
            <p className="text-3xl font-bold text-on-surface mt-1">
              {item.value ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-surface-charcoal p-6 rounded-xl border border-border-subtle">
        <p className="text-text-muted text-sm">
          Use the sidebar to import questions, flashcards, and notes in bulk via
          JSON.
        </p>
      </div>
    </div>
  );
}
