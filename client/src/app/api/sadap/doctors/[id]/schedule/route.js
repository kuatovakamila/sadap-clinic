import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/doctors/[id]/schedule
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await sadapFetch("GET", `/public-api/doctors/${id}/schedule`);
    return NextResponse.json({ success: true, schedule: data });
  } catch (err) {
    console.error("sadap schedule error:", err);
    return NextResponse.json(
      { error: "Расписание не найдено" },
      { status: err.status || 500 }
    );
  }
}
