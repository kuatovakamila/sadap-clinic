import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "services";

  // ?mode=verify&iin=...&phone=...&lastname=...
  if (mode === "verify") {
    const iin      = searchParams.get("iin")      || "";
    const phone    = searchParams.get("phone")    || "";
    const lastname = searchParams.get("lastname") || "";

    const results = {};

    // Try multiple phone formats
    // Strip all spaces and non-digits first
    const digits = phone.replace(/\D/g, "");
    // Last 10 digits (local number without country code)
    const local10 = digits.slice(-10);

    const phoneVariants = {
      digits_only:   digits,
      plus_digits:   `+${digits}`,
      local_10:      local10,
      seven_local:   `7${local10}`,
      plus7_local:   `+7${local10}`,
      eight_local:   `8${local10}`,
    };

    for (const [label, ph] of Object.entries(phoneVariants)) {
      try {
        const data = await sadapFetch("POST", "/public-api/verify-patient", {
          iin, phone: ph, lastname,
        });
        results[label] = { phone: ph, success: true, data };
      } catch (err) {
        results[label] = { phone: ph, success: false, status: err.status, body: err.body };
      }
    }

    return NextResponse.json({ mode: "verify", iin, lastname, results });
  }

  // default: services
  try {
    const raw = await sadapFetch("GET", "/public-api/services");
    return NextResponse.json({ services_raw: raw });
  } catch (err) {
    return NextResponse.json({ error: err.message, body: err.body }, { status: 500 });
  }
}
