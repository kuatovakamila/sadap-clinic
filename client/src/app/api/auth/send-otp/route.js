import { NextResponse } from "next/server";

if (!global.otpStore) {
  global.otpStore = new Map();
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    global.otpStore.set(cleanPhone, {
      code: otp,
      fullName: fullName || "",
      mode: mode || "login",
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // ── Send via Wazzup ──────────────────────────────────────────────────────
    const wazzupApiKey  = process.env.WAZZUP_API_KEY;
    const wazzupChannel = process.env.WAZZUP_CHANNEL_ID;

    // chatId for Wazzup = phone without leading +
    const chatId = cleanPhone.replace("+", "");

    console.log("=== SENDING OTP via Wazzup (WhatsApp) ===");
    console.log("Phone:", cleanPhone, "→ chatId:", chatId);
    console.log("OTP:", otp);

    const wazzupRes = await fetch("https://api.wazzup24.com/v3/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${wazzupApiKey}`,
      },
      body: JSON.stringify({
        channelId: wazzupChannel,
        chatId:    chatId,
        chatType:  "whatsapp",
        text:      `Ваш код подтверждения SADAP Clinic: *${otp}*\n\nКод действителен 5 минут.`,
      }),
    });

    const wazzupResult = await wazzupRes.json();
    console.log("Wazzup response:", JSON.stringify(wazzupResult, null, 2));

    if (!wazzupRes.ok) {
      console.error("Wazzup error:", wazzupResult);
      return NextResponse.json(
        { error: `Ошибка отправки WhatsApp: ${wazzupResult.message || wazzupRes.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Код отправлен в WhatsApp",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка. Попробуйте позже." },
      { status: 500 }
    );
  }
}
