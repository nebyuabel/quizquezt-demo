"use client";

import { useRouter } from "next/navigation";
import { useActiveUnits } from "@/hooks/useActiveUnits";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function ActiveUnits() {
  const { units, loading } = useActiveUnits();
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const resumeUnit = async (unitId: string) => {
    if (!user) return;

    try {
      // Check if there's an in-progress session for this unit
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("unit_id", unitId)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        router.push(`/quiz/${data.id}`);
      } else {
        // Create a new session for this unit
        // We could also navigate to the selection page
        alert(
          "Please select this unit from the Subject Matrix above to start a new quiz.",
        );
      }
    } catch (error) {
      console.error("Error resuming unit:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-md">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          Active Units
        </h3>
        <div className="space-y-sm">
          <div className="animate-pulse flex items-center justify-between p-sm rounded-lg bg-surface">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-variant"></div>
              <div>
                <div className="h-4 w-32 bg-surface-variant rounded"></div>
                <div className="h-3 w-20 bg-surface-variant rounded mt-1"></div>
              </div>
            </div>
            <div className="w-24 h-1.5 bg-surface-variant rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-md">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          Active Units
        </h3>
        <div className="p-sm rounded-lg bg-surface text-center text-text-muted">
          <p>No active units yet. Start a quiz to track progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-md">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
        Active Units
      </h3>
      <div className="space-y-sm">
        {units.map((unit) => (
          <div
            key={unit.unit_id}
            onClick={() => resumeUnit(unit.unit_id)}
            className="flex items-center justify-between p-sm rounded-lg bg-surface hover:bg-surface-variant transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">
                  science
                </span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {unit.subject_name} - {unit.unit_name}
                </p>
                <p className="font-label-sm text-label-sm text-text-muted">
                  {unit.unit_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="hidden md:flex flex-col items-end">
                <span className="font-label-sm text-label-sm text-on-surface">
                  {unit.progress}% Mastery
                </span>
                <div className="w-24 h-1.5 bg-surface-variant rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full ${unit.progress >= 50 ? "bg-primary" : "bg-tertiary"} rounded-full shadow-[0_0_8px_rgba(224,182,255,0.8)]`}
                    style={{ width: `${unit.progress}%` }}
                  ></div>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary">
                play_circle
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
