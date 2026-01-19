import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID обязателен" },
        { status: 400 }
      );
    }

    // Get user's appointments
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return NextResponse.json(
        { error: "Ошибка при получении записей" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      appointments: data || []
    });

  } catch (error) {
    console.error("Error in get appointments:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
