// src/hooks/useActiveUnits.ts
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface UnitProgress {
  unit_id: string;
  unit_name: string;
  subject_name: string;
  progress: number; // average score percentage
}

export function useActiveUnits() {
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActiveUnits = async () => {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select(
          `
          unit_id,
          score,
          units!inner (
            name,
            subject:subject_id (
              name
            )
          )
        `,
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching active units:", error);
        setLoading(false);
        return;
      }

      const unitMap = new Map<
        string,
        {
          totalScore: number;
          count: number;
          unitName: string;
          subjectName: string;
        }
      >();
      data?.forEach((session) => {
        const unitId = session.unit_id;
        if (!unitId) return;
        const unitData = session.units;
        // unitData is an array of objects? Actually it's a single object because we used "inner" but may return array.
        // Let's handle both.
        let unitName = "Unknown";
        let subjectName = "Unknown";
        if (Array.isArray(unitData) && unitData.length > 0) {
          const first = unitData[0];
          unitName = first.name || "Unknown";
          if (
            first.subject &&
            Array.isArray(first.subject) &&
            first.subject.length > 0
          ) {
            subjectName = first.subject[0].name || "Unknown";
          }
        } else if (unitData && typeof unitData === "object") {
          // If it's a single object
          unitName = (unitData as any).name || "Unknown";
          if (
            (unitData as any).subject &&
            Array.isArray((unitData as any).subject) &&
            (unitData as any).subject.length > 0
          ) {
            subjectName = (unitData as any).subject[0].name || "Unknown";
          }
        }

        if (!unitMap.has(unitId)) {
          unitMap.set(unitId, {
            totalScore: 0,
            count: 0,
            unitName,
            subjectName,
          });
        }
        const entry = unitMap.get(unitId)!;
        entry.totalScore += session.score || 0;
        entry.count++;
      });

      const result: UnitProgress[] = Array.from(unitMap.entries()).map(
        ([unit_id, data]) => ({
          unit_id,
          unit_name: data.unitName,
          subject_name: data.subjectName,
          progress:
            data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
        }),
      );

      result.sort((a, b) => a.unit_name.localeCompare(b.unit_name));
      setUnits(result);
      setLoading(false);
    };

    fetchActiveUnits();
  }, [user, supabase]);

  return { units, loading };
}
