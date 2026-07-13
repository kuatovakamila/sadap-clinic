import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Access the OTP store
if (!global.otpStore) {
  global.otpStore = new Map();
}

// Create Supabase admin client (uses service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to find user by phone
async function findUserByPhone(phone) {
  // Try different phone formats
  const phoneVariants = [
    phone,
    phone.replace("+", ""),
    `+${phone.replace("+", "")}`,
  ];

  const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error || !usersData?.users) {
    console.error("Error listing users:", error);
    return null;
  }

  for (const variant of phoneVariants) {
    const user = usersData.users.find((u) => {
      const userPhone = u.phone || "";
      return userPhone === variant || 
             userPhone.replace("+", "") === variant.replace("+", "");
    });
    if (user) return user;
  }

  return null;
}

export async function POST(request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Номер телефона и код обязательны" },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;

    // Get stored OTP
    const storedData = global.otpStore.get(cleanPhone);

    if (!storedData) {
      return NextResponse.json(
        { error: "Код не найден. Запросите новый код." },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      global.otpStore.delete(cleanPhone);
      return NextResponse.json(
        { error: "Код истёк. Запросите новый код." },
        { status: 400 }
      );
    }

    // Check attempts (max 3)
    if (storedData.attempts >= 3) {
      global.otpStore.delete(cleanPhone);
      return NextResponse.json(
        { error: "Слишком много попыток. Запросите новый код." },
        { status: 400 }
      );
    }

    // Verify code
    if (storedData.code !== code) {
      storedData.attempts += 1;
      global.otpStore.set(cleanPhone, storedData);
      return NextResponse.json(
        { error: "Неверный код. Попробуйте снова." },
        { status: 400 }
      );
    }

    // Code is correct - delete it
    global.otpStore.delete(cleanPhone);

    let user;
    let is_new = false;

    // First, try to find existing user
    user = await findUserByPhone(cleanPhone);

    if (user) {
      // User exists — update profile name if this was a registration attempt
      if (storedData.fullName) {
        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          phone: cleanPhone,
          full_name: storedData.fullName || user.user_metadata?.full_name,
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      is_new = true;
      // Create new user
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: cleanPhone,
        phone_confirm: true,
        user_metadata: { full_name: storedData.fullName || "" },
      });

      if (createError) {
        if (createError.code === "phone_exists") {
          await new Promise(resolve => setTimeout(resolve, 500));
          user = await findUserByPhone(cleanPhone);
          if (!user) {
            return NextResponse.json(
              { error: "Ошибка аутентификации. Обратитесь в поддержку." },
              { status: 500 }
            );
          }
          is_new = false;
        } else {
          return NextResponse.json(
            { error: "Ошибка создания пользователя" },
            { status: 500 }
          );
        }
      } else {
        user = newUserData.user;
        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          phone: cleanPhone,
          full_name: storedData.fullName || "",
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Fetch latest profile (includes sadap_patient_id)
    let { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Profile row missing — create it so future updates (sadap link) land correctly
    if (!profileData) {
      await supabaseAdmin.from("profiles").upsert({
        id:         user.id,
        phone:      cleanPhone,
        full_name:  user.user_metadata?.full_name || storedData.fullName || "",
        updated_at: new Date().toISOString(),
      });
      const { data: fresh } = await supabaseAdmin
        .from("profiles").select("*").eq("id", user.id).single();
      profileData = fresh;
    }

    if (!profileData) {
      return NextResponse.json({
        success: true,
        is_new,
        user: {
          id: user.id,
          phone: cleanPhone,
          full_name: user.user_metadata?.full_name || storedData.fullName || "",
          sadap_patient_id: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      is_new,
      user: {
        id: profileData.id,
        phone: profileData.phone || cleanPhone,
        full_name: profileData.full_name || user.user_metadata?.full_name || "",
        sadap_patient_id: profileData.sadap_patient_id || null,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка. Попробуйте позже." },
      { status: 500 }
    );
  }
}
