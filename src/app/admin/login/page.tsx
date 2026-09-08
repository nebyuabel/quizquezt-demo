"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundery";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("admin_auth", "true");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
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
        <div
          style={{
            backgroundColor: "#1E1E24",
            padding: "40px",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "#e0b6ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <span style={{ color: "#4c007d", fontSize: "32px" }}>🔐</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
              Admin Access
            </h1>
            <p style={{ color: "#A0A0AB", fontSize: "14px", marginTop: "4px" }}>
              Enter the admin password
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "rgba(255,180,171,0.1)",
                border: "1px solid rgba(255,180,171,0.2)",
                borderRadius: "8px",
                padding: "12px",
                color: "#ffb4ab",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#d0c2d5",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#14141A",
                  border: "1px solid transparent",
                  borderRadius: "8px",
                  color: "#e4e1e6",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e0b6ff")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#e0b6ff",
                color: "#4c007d",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "opacity 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Checking..." : "Access Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
}
