"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminGuard from "@/components/admin/AdminGuard";

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
        // Fetch counts from Supabase
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#131316",
          color: "#e4e1e6",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div
        style={{
          padding: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          color: "#e4e1e6",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h1 style={{ fontSize: "48px", fontWeight: "700", margin: 0 }}>
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e0b6ff",
              color: "#4c007d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>
        <p style={{ color: "#A0A0AB", fontSize: "18px", marginBottom: "32px" }}>
          Welcome to the admin panel. Manage your platform content.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: "#1E1E24",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #2D2D35",
            }}
          >
            <p style={{ color: "#A0A0AB", fontSize: "14px", margin: 0 }}>
              Total Users
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "4px 0 0 0",
              }}
            >
              {stats?.users ?? 0}
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#1E1E24",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #2D2D35",
            }}
          >
            <p style={{ color: "#A0A0AB", fontSize: "14px", margin: 0 }}>
              Questions
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "4px 0 0 0",
              }}
            >
              {stats?.questions ?? 0}
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#1E1E24",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #2D2D35",
            }}
          >
            <p style={{ color: "#A0A0AB", fontSize: "14px", margin: 0 }}>
              Flashcards
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "4px 0 0 0",
              }}
            >
              {stats?.flashcards ?? 0}
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#1E1E24",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #2D2D35",
            }}
          >
            <p style={{ color: "#A0A0AB", fontSize: "14px", margin: 0 }}>
              Notes
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "4px 0 0 0",
              }}
            >
              {stats?.notes ?? 0}
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1E1E24",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #2D2D35",
          }}
        >
          <p style={{ color: "#A0A0AB", fontSize: "14px" }}>
            Use the sidebar to import questions, flashcards, and notes in bulk
            via JSON.
          </p>
        </div>
      </div>
    </AdminGuard>
  );
}
