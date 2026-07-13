import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/doctors/[id]/slots?date=YYYY-MM-DD
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date обязателен" }, { status: 400 });
    }

    const data = await sadapFetch(
      "GET",
      `/public-api/doctors/${id}/slots?date=${date}`
    );
    const raw = Array.isArray(data) ? data : (Array.isArray(data?.slots) ? data.slots : []);
    const slots = raw
      .map(s => ({
        start_time: s.start || s.start_time || s.time || "",
        end_time:   s.end   || s.end_time   || "",
      }))
      .filter(s => s.start_time);
    return NextResponse.json({ success: true, slots });
  } catch (err) {
    console.error("sadap slots error:", err);
    return NextResponse.json(
      { error: "Ошибка получения слотов" },
      { status: err.status || 500 }
    );
  }
}
