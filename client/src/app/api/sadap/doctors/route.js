import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/doctors
export async function GET() {
  try {
    const data = await sadapFetch("GET", "/public-api/doctors");
    return NextResponse.json({ success: true, doctors: data });
  } catch (err) {
    console.error("sadap doctors list error:", err);
    return NextResponse.json(
      { error: "Ошибка получения списка врачей" },
      { status: err.status || 500 }
    );
  }
}
