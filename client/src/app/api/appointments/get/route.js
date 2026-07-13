import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";

const SADAP_BASE = process.env.SADAP_API_BASE || "https://mis.sadapclinic.kz";
function photoUrl(p) {
  if (!p) return null;
  return p.startsWith("http") ? p : `${SADAP_BASE}${p}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sadapPatientId = searchParams.get("sadap_patient_id");

    if (!sadapPatientId) {
      return NextResponse.json({ success: true, appointments: [] });
    }

    // Fetch appointments from SADAP MIS
    const sadapData = await sadapFetch(
      "GET",
      `/public-api/patient/${sadapPatientId}/appointments`
    );

    const raw = Array.isArray(sadapData) ? sadapData : sadapData?.appointments || [];

    const appointments = raw.map((a) => ({
      id:                   `sadap_${a.id}`,
      sadap_appointment_id: a.id,
      doctor_name:          a.doctor_name || a.doctor?.name || "",
      doctor_slug:          a.doctor_id ? `sadap-${a.doctor_id}` : null,
      doctor_id:            a.doctor_id || null,
      patient_name:         a.patient_name || "",
      patient_phone:        a.patient_phone || "",
      appointment_date:     a.date || a.appointment_date || "",
      appointment_time:     a.start_time || a.appointment_time || "",
      end_time:             a.end_time || null,
      status:               a.status || "confirmed",
      reason:               a.notes || a.reason || "",
      service_name:         a.service_name || a.service?.name || null,
      source:               "sadap",
    }));

    appointments.sort((a, b) => {
      const da = `${a.appointment_date}T${a.appointment_time}`;
      const db = `${b.appointment_date}T${b.appointment_time}`;
      return da.localeCompare(db);
    });

    // Enrich with doctor avatar_url
    let doctorAvatarMap = {};
    try {
      const raw = await sadapFetch("GET", "/public-api/doctors");
      const list = Array.isArray(raw) ? raw : raw?.doctors || raw?.data || [];
      for (const d of list) {
        const url = photoUrl(d.avatar_url || d.photo_url || d.photo);
        const name = (d.full_name || d.fio || d.name || "").toLowerCase();
        if (url && name) doctorAvatarMap[name] = url;
        if (url && d.id) doctorAvatarMap[`sadap-${d.id}`] = url;
      }
    } catch {}

    const enriched = appointments.map(a => ({
      ...a,
      doctor_avatar_url:
        doctorAvatarMap[a.doctor_slug] ||
        doctorAvatarMap[(a.doctor_name || "").toLowerCase()] ||
        null,
    }));

    return NextResponse.json({ success: true, appointments: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка получения записей" },
      { status: error.status || 500 }
    );
  }
}
