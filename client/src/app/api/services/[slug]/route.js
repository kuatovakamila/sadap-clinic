import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    // Fetch service by slug
    const { data: service, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !service) {
      console.error("Error fetching service:", error);
      return NextResponse.json(
        { success: false, error: "Услуга не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      service: service
    });

  } catch (error) {
    console.error("Error in get service:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
