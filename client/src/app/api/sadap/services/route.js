import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// GET /api/sadap/services
export async function GET() {
  try {
    const data = await sadapFetch("GET", "/public-api/services");
    return NextResponse.json({ success: true, services: data });
  } catch (err) {
    console.error("sadap services error:", err);
    return NextResponse.json(
      { error: "Ошибка получения услуг" },
      { status: err.status || 500 }
    );
  }
}
