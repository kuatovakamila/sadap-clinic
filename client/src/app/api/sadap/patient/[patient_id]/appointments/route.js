import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/patient/[patient_id]/appointments
export async function GET(request, { params }) {
  try {
    const { patient_id } = await params;
    const data = await sadapFetch(
      "GET",
      `/public-api/patient/${patient_id}/appointments`
    );
    return NextResponse.json({ success: true, appointments: data });
  } catch (err) {
    console.error("sadap patient appointments error:", err);
    return NextResponse.json(
      { error: "Ошибка получения записей" },
      { status: err.status || 500 }
    );
  }
}
