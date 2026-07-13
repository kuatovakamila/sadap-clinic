import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/doctors/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await sadapFetch("GET", `/public-api/doctors/${id}`);
    return NextResponse.json({ success: true, doctor: data });
  } catch (err) {
    console.error("sadap doctor error:", err);
    return NextResponse.json(
      { error: "Врач не найден" },
      { status: err.status || 500 }
    );
  }
}
