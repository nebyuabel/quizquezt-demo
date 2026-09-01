"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },

  { path: "/flashcards", label: "Flashcards", icon: "style" },
  { path: "/notes", label: "Notes", icon: "description" },
  { path: "/streak", label: "Streak", icon: "local_fire_department" },
  { path: "/marketplace", label: "Store", icon: "shopping_cart" },
  { path: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex-col pt-lg pb-lg shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="px-md mb-xl flex items-center gap-xs">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.4)]">
          <span className="material-symbols-outlined text-on-primary">
            school
          </span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
          QuizQuest
        </span>
      </div>

      <nav className="flex-1 px-sm space-y-base">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-md py-sm rounded-xl transition-all group ${
                isActive
                  ? "bg-primary-container text-on-primary-container shadow-[0_0_10px_rgba(157,78,221,0.2)]"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span
                className={`material-symbols-outlined mr-sm group-hover:scale-110 transition-transform ${isActive ? "text-on-primary-container" : ""}`}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-md mt-md border-t border-outline-variant/30">
          <Link
            href="/settings"
            className="flex items-center px-md py-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group"
          >
            <span className="material-symbols-outlined mr-sm group-hover:scale-110 transition-transform">
              settings
            </span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
