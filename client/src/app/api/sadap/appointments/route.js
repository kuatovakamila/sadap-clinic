import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// POST /api/sadap/appointments
// Body: { doctor_id, date, start_time, end_time, patient_id?, patient_name?, patient_phone?, service_id?, notes? }
export async function POST(request) {
  try {
    const body = await request.json();
    const { doctor_id, date, start_time, end_time } = body;

    if (!doctor_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: "doctor_id, date, start_time и end_time обязательны" },
        { status: 400 }
      );
    }

    const data = await sadapFetch("POST", "/public-api/appointments", body);
    return NextResponse.json({ success: true, appointment: data });
  } catch (err) {
    console.error("sadap create appointment error:", err);
    return NextResponse.json(
      { error: err.body?.message || "Ошибка создания записи" },
      { status: err.status || 500 }
    );
  }
}
