import { NextResponse } from "next/server";
import { sadapFetch } from "@/lib/sadap-api";

// Carries fullName/mode from the send-otp step through to verify-otp.
// The OTP code itself is generated, stored and validated by the SADAP API.
if (!global.otpMeta) {
  global.otpMeta = new Map();
}

export async function POST(request) {
  try {
    const { phone, fullName, mode } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Номер телефона обязателен" }, { status: 400 });
    }

    if (mode === "register" && !fullName) {
      return NextResponse.json({ error: "ФИО обязательно для регистрации" }, { status: 400 });
    }

    const cleanPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;

    global.otpMeta.set(cleanPhone, {
      fullName: fullName || "",
      mode: mode || "login",
    });

    await sadapFetch("POST", "/public-api/portal/send-otp", { phone: cleanPhone });

    return NextResponse.json({
      success: true,
      message: "Код отправлен",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: error.body?.error || error.body?.message || "Произошла ошибка. Попробуйте позже." },
      { status: error.status || 500 }
    );
  }
}
