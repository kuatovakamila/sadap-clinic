import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const ALL_SLOTS = [];
for (let hour = 9; hour <= 17; hour++) {
  ALL_SLOTS.push(`${hour.toString().padStart(2, "0")}:00`);
  if (hour < 17) ALL_SLOTS.push(`${hour.toString().padStart(2, "0")}:30`);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorSlug = searchParams.get("doctor_slug");
  const date = searchParams.get("date");

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
