import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/patient/[patient_id]/diagnoses
export async function GET(request, { params }) {
  try {
    const { patient_id } = await params;
    const data = await sadapFetch(
      "GET",
      `/public-api/patient/${patient_id}/diagnoses`
    );
    return NextResponse.json({ success: true, diagnoses: data });
  } catch (err) {
    console.error("sadap diagnoses error:", err);
    return NextResponse.json(
      { error: "Ошибка получения диагнозов" },
      { status: err.status || 500 }
    );
  }
}
