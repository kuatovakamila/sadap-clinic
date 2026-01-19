import { supabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      doctorSlug, 
      doctorName, 
      patientName, 
      patientPhone, 
      appointmentDate, 
      appointmentTime, 
      reason 
    } = body;

    // Validate required fields
    if (!userId || !doctorSlug || !doctorName || !patientName || !patientPhone || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Create appointment in database
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        user_id: userId,
        doctor_slug: doctorSlug,
        doctor_name: doctorName,
        patient_name: patientName,
        patient_phone: patientPhone,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: reason || "",
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      return NextResponse.json(
        { error: "Ошибка при создании записи" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      appointment: data 
    });

  } catch (error) {
    console.error("Error in create appointment:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
