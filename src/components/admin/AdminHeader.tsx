"use client";

import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-md md:px-xl border-b border-outline-variant/10">
      <div className="md:hidden flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary">
          admin_panel_settings
        </span>
        <span className="font-label-md text-label-md text-on-surface">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-sm md:gap-lg ml-auto">
        <span className="font-label-sm text-label-sm text-text-muted">
          Admin
        </span>
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:ring-2 hover:ring-primary/40 transition-all"
        >
          <span className="material-symbols-outlined text-on-primary text-[18px]">
            logout
          </span>
        </button>
      </div>
    </header>
  );
}
