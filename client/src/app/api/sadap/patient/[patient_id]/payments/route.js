import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/patient/[patient_id]/payments
export async function GET(request, { params }) {
  try {
    const { patient_id } = await params;
    const data = await sadapFetch(
      "GET",
      `/public-api/patient/${patient_id}/payments`
    );
    return NextResponse.json({ success: true, payments: data });
  } catch (err) {
    console.error("sadap payments error:", err);
    return NextResponse.json(
      { error: "Ошибка получения истории оплат" },
      { status: err.status || 500 }
    );
  }
}
