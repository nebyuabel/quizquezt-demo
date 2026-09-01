"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useLevel } from "@/hooks/useLevel";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useUser();
  const { level, tier } = useLevel(profile?.total_xp || 0);

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between md:justify-end px-md md:px-xl gap-sm md:gap-lg border-b border-outline-variant/10">
      <div className="md:hidden flex items-center gap-xs">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[18px]">
            school
          </span>
        </div>
        <span className="font-label-md text-label-md text-on-surface">
          QuizQuest
        </span>
      </div>

      <div className="flex items-center gap-sm md:gap-lg">
        {/* XP Display */}
        <div className="flex items-center gap-xs bg-surface-container-low px-sm py-base rounded-full border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-[18px]">
            star
          </span>
          <span className="font-label-sm text-label-sm text-on-surface">
            {profile?.total_xp ? profile.total_xp.toLocaleString() : 0} XP
          </span>
        </div>

        {/* Streak Display */}
        <a href="/streak">
          <div className="flex items-center gap-xs text-warning-orange">
            <span className="material-symbols-outlined fill-1 text-[20px]">
              local_fire_department
            </span>

            <span className="font-label-md text-label-md md:text-headline-md">
              {profile?.current_streak || 0}
            </span>
          </div>
        </a>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
          <a href="/profile">
            {" "}
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
