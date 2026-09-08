import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth");
    if (!adminAuth || adminAuth.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const items = body.items;
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 },
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (const item of items) {
      const { front, back, grade, subject, unit } = item;
      if (!front || !back) {
        errors.push(`Missing front or back: ${JSON.stringify(item)}`);
        continue;
      }

      // Ensure grade exists
      let gradeId: string;
      const { data: gradeData } = await supabase
        .from("grades")
        .select("id")
        .eq("name", grade)
        .maybeSingle();
      if (gradeData) {
        gradeId = gradeData.id;
      } else {
        const { data: newGrade, error: gradeError } = await supabase
          .from("grades")
          .insert({ name: grade })
          .select()
          .single();
        if (gradeError) {
          errors.push(`Failed to create grade ${grade}: ${gradeError.message}`);
          continue;
        }
        gradeId = newGrade.id;
      }

      // Ensure subject exists
      let subjectId: string;
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("grade_id", gradeId)
        .eq("name", subject)
        .maybeSingle();
      if (subjectData) {
        subjectId = subjectData.id;
      } else {
        const { data: newSubject, error: subjectError } = await supabase
          .from("subjects")
          .insert({ grade_id: gradeId, name: subject })
          .select()
          .single();
        if (subjectError) {
          errors.push(
            `Failed to create subject ${subject}: ${subjectError.message}`,
          );
          continue;
        }
        subjectId = newSubject.id;
      }

      // Ensure unit exists
      let unitId: string;
      const { data: unitData } = await supabase
        .from("units")
        .select("id")
        .eq("subject_id", subjectId)
        .eq("name", unit)
        .maybeSingle();
      if (unitData) {
        unitId = unitData.id;
      } else {
        const { data: newUnit, error: unitError } = await supabase
          .from("units")
          .insert({ subject_id: subjectId, name: unit })
          .select()
          .single();
        if (unitError) {
          errors.push(`Failed to create unit ${unit}: ${unitError.message}`);
          continue;
        }
        unitId = newUnit.id;
      }

      // Get or create deck
      let deckId: string;
      const { data: existingDeck } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("unit_id", unitId)
        .eq("name", unit)
        .maybeSingle();
      if (existingDeck) {
        deckId = existingDeck.id;
      } else {
        const { data: newDeck, error: deckError } = await supabase
          .from("flashcard_decks")
          .insert({
            unit_id: unitId,
            name: unit,
            description: `Auto-generated deck for ${unit}`,
          })
          .select()
          .single();
        if (deckError) {
          errors.push(`Failed to create deck: ${deckError.message}`);
          continue;
        }
        deckId = newDeck.id;
      }

      // Insert flashcard
      const { error: insertError } = await supabase
        .from("flashcards")
        .insert({ deck_id: deckId, front, back });
      if (insertError) {
        errors.push(`DB error: ${insertError.message} for flashcard: ${front}`);
      } else {
        imported++;
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
