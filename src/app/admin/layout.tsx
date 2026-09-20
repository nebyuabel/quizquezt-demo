"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on the login page
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      router.replace("/admin/login");
    }
  }, [router, pathname]);

  // Login page – render without admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthorized === null) {
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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminHeader />
      <div className="md:pl-64">
        <main className="relative pt-16 bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
