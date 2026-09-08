"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },

  { path: "/flashcards", label: "Flashcards", icon: "style" },
  { path: "/notes", label: "Notes", icon: "description" },

  { path: "/marketplace", label: "Store", icon: "shopping_cart" },
  { path: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low border-t border-outline-variant/20 z-50 flex items-center justify-around px-sm">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-base transition-colors ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-label-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
