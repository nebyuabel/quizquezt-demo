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

    const supabase = createAdminClient(); // Uses service role – bypasses RLS
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
      const {
        question_text,
        options,
        correct_answer,
        explanation,
        difficulty,
        grade,
        subject,
        unit,
      } = item;
      if (!question_text || !options || !correct_answer) {
        errors.push(`Missing required fields: ${JSON.stringify(item)}`);
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

      // Insert question
      const { error: insertError } = await supabase.from("questions").insert({
        unit_id: unitId,
        question_text,
        options,
        correct_answer,
        explanation: explanation || null,
        difficulty: difficulty || 1,
      });
      if (insertError) {
        errors.push(
          `DB error: ${insertError.message} for question: ${question_text}`,
        );
      } else {
        imported++;
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
