"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  if (isAuthorized === null) {
    return null;
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
