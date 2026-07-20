import { NextResponse } from "next/server";
import { epayConfigured, getEpayToken, EPAY_ENV, EPAY_TERMINAL_ID } from "@/lib/epay";

// POST /api/payments/create
// Body: { appointmentId, amount, description, phone, email }
// Prepares what the ePayment widget needs (access token + invoice id) to open its
// hosted card-entry form — no card data ever touches this backend or the client DOM.
export async function POST(request) {
  try {
    const { appointmentId, amount, description, phone, email } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Некорректная сумма оплаты" }, { status: 400 });
    }

    if (!epayConfigured()) {
      return NextResponse.json(
        { error: "Онлайн-оплата пока не настроена. Вы можете оплатить приём в клинике." },
        { status: 501 }
      );
    }

    const accessToken = await getEpayToken();
    // ePayment requires a unique 6-15 digit invoice id
    const invoiceId = String(Date.now()).slice(-13);

    return NextResponse.json({
      success: true,
      env: EPAY_ENV,
      terminalId: EPAY_TERMINAL_ID,
      accessToken,
      invoiceId,
      appointmentId: appointmentId || null,
      amount: Number(amount),
      currency: "KZT",
      description: description || "Оплата услуги SADAP Clinic",
      phone: phone || undefined,
      email: email || undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.body?.error_description || error.body?.error || "Ошибка платёжного шлюза" },
      { status: error.status || 500 }
    );
  }
}
