import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// POST /api/sadap/verify-patient
// Body: { iin, phone, lastname }
// Returns: { patient_id }
export async function POST(request) {
  try {
    const { iin, phone, lastname, full_name } = await request.json();

    if (!iin || !phone || !lastname) {
      return NextResponse.json(
        { error: "ИИН, телефон и фамилия обязательны" },
        { status: 400 }
      );
    }

    const payload = { iin, phone, lastname };

    // 1. Сначала пробуем найти существующего пациента
    try {
      const data = await sadapFetch("POST", "/public-api/verify-patient", payload);
      const patient_id = data.patient_id ?? data.id;
      if (patient_id) {
        return NextResponse.json({ success: true, patient_id, created: false });
      }
    } catch (verifyErr) {
      // Если не найден (404) — пробуем создать
      if (verifyErr.status !== 404) {
        return NextResponse.json(
          { error: verifyErr.body?.message || verifyErr.body?.error || "Ошибка верификации" },
          { status: verifyErr.status || 500 }
        );
      }
    }

    // 2. Пациент не найден — создаём нового
    const created = await sadapFetch("POST", "/public-api/patients", {
      iin,
      phone,
      full_name: full_name || lastname,
    });
    const patient_id = created.patient_id ?? created.id;

    if (!patient_id) {
      return NextResponse.json(
        { error: "Не удалось создать пациента" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, patient_id, created: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.body?.message || err.body?.error || "Ошибка привязки" },
      { status: err.status || 500 }
    );
  }
}
