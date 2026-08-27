"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Unit {
  id: string;
  name: string;
  note_count: number;
}

interface UnitListProps {
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
}

export default function UnitList({
  selectedUnitId,
  onSelectUnit,
}: UnitListProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUnitsWithCount = async () => {
      const { data, error } = await supabase
        .from("units")
        .select(
          `
          id,
          name,
          notes (id)
        `,
        )
        .order("name");

      if (error) {
        console.error("Error fetching units:", error);
        return;
      }

      const formatted = (data || []).map((unit: any) => ({
        id: unit.id,
        name: unit.name,
        note_count: unit.notes?.length || 0,
      }));

      setUnits(formatted);
    };

    fetchUnitsWithCount();
  }, [supabase]);

  return (
    <div className="bg-surface-container rounded-xl p-md shadow-md flex flex-col gap-sm">
      <div className="flex items-center justify-between mb-xs">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Units
        </h2>
        <button className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
      <div className="flex flex-col gap-base">
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(unit.id)}
            className={`flex items-center justify-between w-full p-sm rounded-lg transition-colors text-left group ${
              selectedUnitId === unit.id
                ? "bg-primary-container/20 text-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined">
                {selectedUnitId === unit.id ? "folder_open" : "folder"}
              </span>
              <span className="font-label-md text-label-md">{unit.name}</span>
            </div>
            <span
              className={`font-label-sm text-label-sm px-xs py-base rounded ${
                selectedUnitId === unit.id
                  ? "bg-primary/20"
                  : "bg-surface-container-high group-hover:bg-surface-container-highest"
              }`}
            >
              {unit.note_count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
