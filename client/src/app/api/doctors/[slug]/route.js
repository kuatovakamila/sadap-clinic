import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const { data, error } = await supabaseAdmin
      .from("doctors")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      console.error("Error fetching doctor:", error);
      return NextResponse.json(
        { success: false, error: "Врач не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      doctor: data
    });

  } catch (error) {
    console.error("Error in get doctor:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
