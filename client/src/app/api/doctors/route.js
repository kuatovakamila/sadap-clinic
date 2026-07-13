import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";

const SADAP_BASE = process.env.SADAP_API_BASE || "https://mis.sadapclinic.kz";

function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SADAP_BASE}${path}`;
}

function experienceYears(sd) {
  if (sd.experience_years) return sd.experience_years;
  if (sd.experience)       return sd.experience;
  if (sd.experience_start_year) {
    return new Date().getFullYear() - sd.experience_start_year;
  }
  return null;
}

export function normalize(sd) {
  return {
    id:               sd.id,
    sadap_doctor_id:  sd.id,
    slug:             `sadap-${sd.id}`,
    full_name:        sd.full_name || sd.fio || sd.name || "",
    specialization_title: sd.specialization_title || sd.specialization || sd.specialty || "",
    experience:       experienceYears(sd),
    experience_years: experienceYears(sd),
    avatar_url:       photoUrl(sd.avatar_url || sd.photo_url || sd.photo),
    rating:           sd.rating || 5,
    education_text:   sd.education_text || sd.education || sd.about || null,
    cabinet:          sd.cabinet || null,
    min_patient_age:  sd.min_patient_age ?? null,
    workingHours:     null,
    // Embedded schedule: [{ day_of_week, start_time, end_time, slot_duration }]
    schedules:        sd.schedules || [],
    // Embedded services: [{ id, name, price1, duration_minutes }]
    services:         sd.services  || [],
    certificates:     sd.certificates  || [],
    directions:       sd.directions    || [],
    treatmentTags:    sd.treatment_tags || sd.treatmentTags || [],
    is_published:     true,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = (
      searchParams.get("specialty") || searchParams.get("specialization") || ""
    ).toLowerCase();

    const raw  = await sadapFetch("GET", "/public-api/doctors");
    const list = Array.isArray(raw) ? raw : raw?.doctors || raw?.data || [];

    let doctors = list.map(normalize);

    if (filter) {
      doctors = doctors.filter(d =>
        (d.specialization_title || "").toLowerCase().includes(filter)
      );
    }

    // Doctors with photos come first
    doctors.sort((a, b) => (b.avatar_url ? 1 : 0) - (a.avatar_url ? 1 : 0));

    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error("SADAP doctors error:", error.message, error.body);
    return NextResponse.json(
      { error: "Ошибка получения списка врачей" },
      { status: 500 }
    );
  }
}
