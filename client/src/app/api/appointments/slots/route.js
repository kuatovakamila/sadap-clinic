import { supabaseAdmin } from "@/lib/supabase-server";
import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";

const ALL_SLOTS = [];
for (let hour = 9; hour <= 17; hour++) {
  ALL_SLOTS.push(`${hour.toString().padStart(2, "0")}:00`);
  if (hour < 17) ALL_SLOTS.push(`${hour.toString().padStart(2, "0")}:30`);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorSlug = searchParams.get("doctor_slug");
  const sadapDoctorId = searchParams.get("sadap_doctor_id");
  const date = searchParams.get("date");

  // Use SADAP API when sadap_doctor_id is provided
  if (sadapDoctorId && date) {
    try {
      const data = await sadapFetch(
        "GET",
        `/public-api/doctors/${sadapDoctorId}/slots?date=${date}`
      );
      return NextResponse.json({ slots: data });
    } catch (err) {
      console.error("SADAP slots error, falling back to Supabase:", err);
    }
  }

  // Fallback: compute free slots from Supabase appointments
  if (!doctorSlug || !date) {
    return NextResponse.json({ slots: ALL_SLOTS });
  }

  const { data } = await supabaseAdmin
    .from("appointments")
    .select("appointment_time")
    .eq("doctor_slug", doctorSlug)
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  const booked = new Set((data || []).map((a) => a.appointment_time));
  const free = ALL_SLOTS.filter((s) => !booked.has(s));

  return NextResponse.json({ slots: free });
}
