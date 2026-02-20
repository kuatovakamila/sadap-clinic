"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

const AuthPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" или "register"
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!phone.trim()) {
        throw new Error("Введите номер телефона");
      }

      // Для регистрации обязательно ФИО
      if (mode === "register" && !fullName.trim()) {
        throw new Error("Введите ваше ФИО");
      }

      // Call our custom API to send OTP via SMSC
      const fullPhone = "+7" + phone.replace(/\D/g, ""); // Add +7 prefix and clean non-digits
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
          fullName: fullName,
          mode: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка отправки кода");
      }

      setSuccess("Код отправлен! Проверьте SMS.");
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call our custom API to verify OTP
      const fullPhone = "+7" + phone.replace(/\D/g, "");
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
          code: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Неверный код");
      }

      // Store user info in localStorage for now
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(mode === "login" ? "Вход выполнен успешно!" : "Регистрация завершена!");
      router.push("/profile");
    } catch (err) {
      setError(err.message || "Неверный код. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <div className={styles.logoContent}>
            <Image 
              src="/image.png" 
              alt="SADAP Clinic" 
              width={300} 
              height={300}
              className={styles.logoImage}
              priority
            />
            {/* <p className={styles.logoTagline}>Ваше здоровье — наш приоритет</p> */}
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <button className={styles.backButton} onClick={() => router.push("/")} type="button">
          ← Вернуться назад
        </button>

        {step === "phone" ? (
          <div className={styles.formContainer}>
            <h1 className={styles.title}>
              {mode === "login" 
                ? "Введите ваш номер телефона, чтобы получить код"
                : "Введите ваш номер телефона, чтобы создать ваш аккаунт"}
            </h1>

            <form onSubmit={handleSendOTP} className={styles.form}>
              <div className={styles.inputGroup}>
                <span className={styles.phonePrefix}>+7</span>
                <input type="tel" placeholder="(XXX) XXX-XX-XX" value={phone} onChange={handlePhoneChange} className={styles.input} required />
              </div>

              {mode === "register" && (
                <div className={styles.inputGroup}>
                  <span className={styles.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input type="text" placeholder="ФИО" value={fullName} onChange={(e) => setFullName(e.target.value)} className={styles.input} required />
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Отправка..." : "Получить код"}
              </button>

              <p className={styles.hint}>
                {mode === "login" ? (
                  <>У вас нету аккаунта? <a href="#" onClick={(e) => { e.preventDefault(); setMode("register"); }} className={styles.link}>Зарегистрироваться.</a></>
                ) : (
                  <>У вас уже есть аккаунт? <a href="#" onClick={(e) => { e.preventDefault(); setMode("login"); }} className={styles.link}>Войти в аккаунт</a></>
                )}
              </p>
            </form>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <h1 className={styles.title}>
              Введите ваш полученный код,<br />чтобы {mode === "login" ? "войти в ваш аккаунт" : "создать ваш аккаунт"}
            </h1>

            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.inputGroup}>
                <span className={styles.icon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type="text" placeholder="Код пароль" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} className={styles.input} required />
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Проверка..." : (mode === "login" ? "Войти" : "Зарегистрироваться")}
              </button>

              <p className={styles.hint}>
                Не получили код? <a href="#" onClick={handleSendOTP} className={styles.link}>Отправить код повторно</a>
              </p>

              <button type="button" onClick={handleBack} className={styles.backLink}>
                ← Изменить номер
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
