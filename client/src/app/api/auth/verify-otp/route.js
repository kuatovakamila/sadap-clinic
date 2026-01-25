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

    // First, try to find existing user
    user = await findUserByPhone(cleanPhone);

    if (user) {
      console.log("Found existing user:", user.id);
      // User exists - update profile if needed
      if (storedData.fullName) {
        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          phone: cleanPhone,
          full_name: storedData.fullName || user.user_metadata?.full_name,
          updated_at: new Date().toISOString(),
        });
      }
      
      // Fetch the profile data
      const { data: profileData } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        console.log("Profile data found:", profileData);
      }
    } else {
      console.log("Creating new user for phone:", cleanPhone);
      // Try to create new user
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: cleanPhone,
        phone_confirm: true,
        user_metadata: {
          full_name: storedData.fullName || "",
        },
      });

      if (createError) {
        console.error("Create user error:", createError);
        
        // If phone already exists, try to find the user again
        if (createError.code === "phone_exists") {
          console.log("Phone exists, searching for user again...");
          // Wait a moment and retry finding the user
          await new Promise(resolve => setTimeout(resolve, 500));
          user = await findUserByPhone(cleanPhone);
          
          if (user) {
            console.log("Found user after phone_exists error:", user.id);
            // Continue to return success below
          } else {
            // Last resort: list all users and log them for debugging
            const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
            console.log("All users phones:", allUsers?.users?.map(u => u.phone));
            console.log("Looking for:", cleanPhone);
            
            return NextResponse.json(
              { error: "Ошибка аутентификации. Обратитесь в поддержку." },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: "Ошибка создания пользователя" },
            { status: 500 }
          );
        }
      } else {
        user = newUserData.user;
        console.log("Created new user:", user.id);

        // Create profile for new user
        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          phone: cleanPhone,
          full_name: storedData.fullName || "",
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Always fetch the latest profile data from database
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("phone", cleanPhone)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching profile:", profileError);
      // Fallback to basic user data
      return NextResponse.json({
        success: true,
        message: "Вход выполнен успешно!",
        user: {
          id: user.id,
          phone: cleanPhone,
          full_name: user.user_metadata?.full_name || storedData.fullName || "",
        },
      });
    }

    console.log("Returning user with profile ID:", profileData.id);

    return NextResponse.json({
      success: true,
      message: "Вход выполнен успешно!",
      user: {
        id: profileData.id,
        phone: profileData.phone,
        full_name: profileData.full_name,
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
