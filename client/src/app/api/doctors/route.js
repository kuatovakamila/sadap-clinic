import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const specialization = searchParams.get("specialization");

    let query = supabaseAdmin
      .from("doctors")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Filter by specialty if provided
    if (specialty) {
      query = query.ilike("specialization_title", `%${specialty}%`);
    }

    // Filter by specialization if provided (for services)
    if (specialization) {
      query = query.ilike("specialization_title", `%${specialization}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching doctors:", error);
      return NextResponse.json(
        { error: "Ошибка при получении списка врачей" },
        { status: 500 }
      );
    }

    console.log("Doctors fetched:", data?.length);

    return NextResponse.json({ 
      success: true, 
      doctors: data || []
    });

  } catch (error) {
    console.error("Error in get doctors:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
