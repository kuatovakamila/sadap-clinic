import { sadapFetch } from "@/lib/sadap-api";
import { NextResponse } from "next/server";

function calcEndTime(start, durationMin = 30) {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + durationMin;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sadapDoctorId,
      sadapPatientId,
      patientName,
      patientPhone,
      appointmentDate,
      appointmentTime,
      endTime,
      serviceId,
      serviceDuration,
      reason,
    } = body;

    if (!sadapDoctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "doctor_id, date и start_time обязательны" },
        { status: 400 }
      );
    }

    const end = endTime || calcEndTime(appointmentTime, serviceDuration || 30);

    const payload = {
      doctor_id:  Number(sadapDoctorId),
      date:       appointmentDate,
      start_time: appointmentTime,
      end_time:   end,
    };

    if (sadapPatientId) payload.patient_id    = Number(sadapPatientId);
    if (patientName)    payload.patient_name  = patientName;
    if (patientPhone)   payload.patient_phone = patientPhone;
    if (serviceId)      payload.service_id    = Number(serviceId);
    if (reason)         payload.notes         = reason;

    const result = await sadapFetch("POST", "/public-api/appointments", payload);

    const appointmentId = result?.id || result?.appointment_id;

    return NextResponse.json({
      success: true,
      appointment_id: appointmentId,
      appointment: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.body?.message || error.body?.error || "Ошибка создания записи" },
      { status: error.status || 500 }
    );
  }
}
