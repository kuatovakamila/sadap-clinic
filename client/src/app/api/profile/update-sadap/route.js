import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST /api/profile/update-sadap
// Body: { userId, sadap_patient_id }
export async function POST(request) {
  try {
    const { userId, sadap_patient_id } = await request.json();

    if (!userId || !sadap_patient_id) {
      return NextResponse.json(
        { error: "userId и sadap_patient_id обязательны" },
        { status: 400 }
      );
    }

    // Try update first
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ sadap_patient_id: Number(sadap_patient_id), updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select();

    if (updateError) {
      console.error("Error updating sadap_patient_id:", updateError);
      return NextResponse.json({ error: "Ошибка обновления профиля" }, { status: 500 });
    }

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({ id: userId, sadap_patient_id: Number(sadap_patient_id), updated_at: new Date().toISOString() });
      if (insertError) {
        console.error("Error inserting profile:", insertError);
        return NextResponse.json({ error: "Ошибка создания профиля" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-sadap error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка" },
      { status: 500 }
    );
  }
}
