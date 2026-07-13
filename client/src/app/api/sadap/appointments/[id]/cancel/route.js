import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// POST /api/sadap/appointments/[id]/cancel
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const data = await sadapFetch(
      "POST",
      `/public-api/appointments/${id}/cancel`
    );
    return NextResponse.json({ success: true, result: data });
  } catch (err) {
    console.error("sadap cancel appointment error:", err);
    return NextResponse.json(
      { error: err.body?.message || "Ошибка отмены записи" },
      { status: err.status || 500 }
    );
  }
}
