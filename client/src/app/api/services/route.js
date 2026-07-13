import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const raw = await sadapFetch("GET", "/public-api/services");
    const list = Array.isArray(raw) ? raw : raw?.services || raw?.data || [];

    const services = list
      .filter(s => !s.is_test)
      .map(s => ({
        id:               s.id,
        sadap_service_id: s.id,
        slug:             `service-${s.id}`,
        name:             s.name?.trim() || "",
        code:             s.code || null,
        description:      s.description || null,
        category:         s.category || null,
        price:            s.price1 ? parseFloat(s.price1) : null,
        duration_minutes: s.duration_minutes || null,
      }));

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("SADAP services error:", error.message);
    return NextResponse.json(
      { error: "Ошибка получения списка услуг" },
      { status: 500 }
    );
  }
}
