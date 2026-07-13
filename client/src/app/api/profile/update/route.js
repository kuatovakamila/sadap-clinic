import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, full_name } = await request.json();
    if (!userId || !full_name?.trim()) {
      return NextResponse.json({ error: "userId и full_name обязательны" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: full_name.trim() })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: "Ошибка обновления профиля" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
