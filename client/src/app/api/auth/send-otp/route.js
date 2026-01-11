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

    // Send SMS via Infobip
    const infobipUrl = `${process.env.INFOBIP_API_URL}/sms/2/text/advanced`;
    
    const smsResponse = await fetch(infobipUrl, {
      method: "POST",
      headers: {
        "Authorization": `App ${process.env.INFOBIP_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to: cleanPhone.replace("+", "") }],
            from: process.env.INFOBIP_SENDER || "SADAP",
            text: `Ваш код подтверждения SADAP Clinic: ${otp}. Код действителен 5 минут.`,
          },
        ],
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      console.error("Infobip error:", smsResult);
      return NextResponse.json(
        { error: "Ошибка отправки SMS. Попробуйте позже." },
        { status: 500 }
      );
    }

    // Check if message was accepted
    const messageStatus = smsResult.messages?.[0]?.status;
    if (messageStatus?.groupId > 3) {
      console.error("SMS delivery failed:", messageStatus);
      return NextResponse.json(
        { error: `Ошибка доставки SMS: ${messageStatus?.description || "Неизвестная ошибка"}` },
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
