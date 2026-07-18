"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

// step: "phone" → "verify" → "link" (если нет sadap_patient_id) → /profile
const AuthPage = () => {
  const router = useRouter();
  const [mode, setMode]       = useState("login");
  const [step, setStep]       = useState("phone");

  const [phone, setPhone]     = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp]         = useState("");

  const [linkIin, setLinkIin]           = useState("");
  const [linkLastname, setLinkLastname] = useState("");
  const [linkError, setLinkError]       = useState("");
  const [linkLoading, setLinkLoading]   = useState(false);

  const [storedUser, setStoredUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const fullPhone = () => "+7" + phone.replace(/\D/g, "");

  // ── 1. Send OTP ──────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (!phone.trim()) throw new Error("Введите номер телефона");
      if (mode === "register" && !fullName.trim()) throw new Error("Введите ваше ФИО");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone(), fullName, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки кода");
      setSuccess("Код отправлен!");
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── 2. Verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone(), code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Неверный код");

      const userData = { ...data.user };

      // Уже привязан к базе клиники — сразу в профиль
      if (userData.sadap_patient_id) {
        localStorage.setItem("user", JSON.stringify(userData));
        router.push("/profile");
        return;
      }

      // Не привязан (новый или старый пользователь) — шаг привязки
      setStoredUser(userData);
      const guess = (userData.full_name || fullName || "").trim().split(/\s+/)[0];
      setLinkLastname(guess);
      setStep("link");
    } catch (err) {
      setError(err.message || "Неверный код. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  // ── 3a. Link to SADAP ────────────────────────────────────────────────────
  const handleLink = async (e) => {
    e.preventDefault();
    setLinkError(""); setLinkLoading(true);
    try {
      const res = await fetch("/api/sadap/verify-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iin:       linkIin.trim(),
          phone:     fullPhone(),
          lastname:  linkLastname.trim(),
          full_name: storedUser?.full_name || linkLastname.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Пациент не найден");

      const userData = { ...storedUser, sadap_patient_id: data.patient_id };
      localStorage.setItem("user", JSON.stringify(userData));

      // Сохранить в Supabase
      await fetch("/api/profile/update-sadap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, sadap_patient_id: data.patient_id }),
      });

      router.push("/profile");
    } catch (err) {
      setLinkError(err.message);
    } finally {
      setLinkLoading(false);
    }
  };

  // ── 3b. Skip linking ─────────────────────────────────────────────────────
  const handleSkip = () => {
    if (storedUser) localStorage.setItem("user", JSON.stringify(storedUser));
    router.push("/profile");
  };

  const handleBack = () => {
    setStep("phone"); setOtp(""); setError(""); setSuccess("");
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <div className={styles.logoContent}>
            <Image src="/image.png" alt="SADAP Clinic" width={300} height={300}
              className={styles.logoImage} priority />
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        {step !== "link" && (
          <button className={styles.backButton} onClick={() => router.push("/")} type="button">
            ← Вернуться назад
          </button>
        )}

        {/* ── Шаг 1: Телефон ── */}
        {step === "phone" && (
          <div className={styles.formContainer}>
            <h1 className={styles.title}>
              {mode === "login"
                ? "Введите номер телефона — вам придёт код подтверждения"
                : "Введите номер телефона — вам придёт код подтверждения"}
            </h1>
            <form onSubmit={handleSendOTP} className={styles.form}>
              <div className={styles.inputGroup}>
                <span className={styles.phonePrefix}>+7</span>
                <input type="tel" placeholder="(XXX) XXX-XX-XX"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className={styles.input} required />
              </div>

              {mode === "register" && (
                <div className={styles.inputGroup}>
                  <span className={styles.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input type="text" placeholder="ФИО"
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    className={styles.input} required />
                </div>
              )}

              {error   && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Отправка..." : "Получить код"}
              </button>

            </form>
          </div>
        )}

        {/* ── Шаг 2: OTP ── */}
        {step === "verify" && (
          <div className={styles.formContainer}>
            <h1 className={styles.title}>
              Введите код подтверждения,<br />
              чтобы {mode === "login" ? "войти в аккаунт" : "создать аккаунт"}
            </h1>
            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.inputGroup}>
                <span className={styles.icon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type="text" placeholder="Код пароль"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6} className={styles.input} required />
              </div>

              {error   && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Проверка..." : (mode === "login" ? "Войти" : "Зарегистрироваться")}
              </button>

              <p className={styles.hint}>
                Не получили код?{" "}
                <a href="#" onClick={handleSendOTP} className={styles.link}>Отправить повторно</a>
              </p>
              <button type="button" onClick={handleBack} className={styles.backLink}>
                ← Изменить номер
              </button>
            </form>
          </div>
        )}

        {/* ── Шаг 3: Привязка к базе клиники ── */}
        {step === "link" && (
          <div className={styles.formContainer}>
            <div className={styles.linkIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="#0c3465" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className={styles.title}>Привяжите профиль к базе клиники</h1>
            <p className={styles.linkDesc}>
              Это нужно сделать один раз. После этого вы сможете видеть свои записи, диагнозы и историю оплат.
            </p>

            <form onSubmit={handleLink} className={styles.form}>
              <div className={styles.inputGroup}>
                <span className={styles.icon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <path d="M8 2v4M16 2v4M3 10h18"/>
                  </svg>
                </span>
                <input type="text" placeholder="ИИН (12 цифр)"
                  value={linkIin} onChange={e => setLinkIin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} pattern="\d{12}" className={styles.input} required />
              </div>

              <div className={styles.inputGroup}>
                <span className={styles.icon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input type="text" placeholder="Фамилия"
                  value={linkLastname} onChange={e => setLinkLastname(e.target.value)}
                  className={styles.input} required />
              </div>

              {linkError && <div className={styles.error}>{linkError}</div>}

              <button type="submit" className={styles.submitButton} disabled={linkLoading}>
                {linkLoading ? "Проверка..." : "Привязать профиль"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
