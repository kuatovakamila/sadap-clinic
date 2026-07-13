import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";
import { normalize } from "../route";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const match = slug.match(/^sadap-(\d+)$/);
    if (!match) {
      return NextResponse.json(
        { success: false, error: "Врач не найден" },
        { status: 404 }
      );
    }

    const sadapId = Number(match[1]);
    const raw = await sadapFetch("GET", `/public-api/doctors/${sadapId}`);
    const sd = raw?.doctor || raw;

    return NextResponse.json({ success: true, doctor: normalize(sd) });
  } catch (error) {
    console.error("SADAP doctor detail error:", error.message);
    return NextResponse.json(
      { success: false, error: "Врач не найден" },
      { status: 404 }
    );
  }
}
