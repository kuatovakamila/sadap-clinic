import { NextResponse } from "next/server";

// Simple in-memory OTP storage (for production, use Redis or database)
// This is stored in a global variable to persist between requests
if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(request) {
  try {
    const { phone, fullName, mode } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Номер телефона обязателен" },
        { status: 400 }
      );
    }

    if (mode === "register" && !fullName) {
      return NextResponse.json(
        { error: "ФИО обязательно для регистрации" },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (5 minutes)
    global.otpStore.set(cleanPhone, {
      code: otp,
      fullName: fullName || "",
      mode: mode || "login",
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    // Send SMS via SMSC.kz
    console.log("=== SENDING OTP via SMSC.kz ===");
    console.log("Phone:", cleanPhone);
    console.log("OTP:", otp);

    // SMSC.kz API - using HTTP GET method
    const smscLogin = process.env.SMSC_LOGIN;
    const smscPassword = process.env.SMSC_PASSWORD;
    const message = `Kod podtverzhdeniya SADAP Clinic: ${otp}`;
    const phoneNumber = cleanPhone.replace("+", "");

    const smscUrl = `https://smsc.kz/sys/send.php?login=${encodeURIComponent(smscLogin)}&psw=${encodeURIComponent(smscPassword)}&phones=${phoneNumber}&mes=${encodeURIComponent(message)}&fmt=3&charset=utf-8`;

    console.log("SMSC URL (without password):", smscUrl.replace(smscPassword, "***"));

    const smsResponse = await fetch(smscUrl);
    const smsResult = await smsResponse.json();
    
    console.log("SMSC response:", JSON.stringify(smsResult, null, 2));

    // SMSC.kz returns { id: X, cnt: Y } on success, or { error: "message", error_code: N } on failure
    if (smsResult.error) {
      console.error("SMSC error:", smsResult);
      return NextResponse.json(
        { error: `Ошибка отправки SMS: ${smsResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Код отправлен на ваш телефон",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка. Попробуйте позже." },
      { status: 500 }
    );
  }
}
