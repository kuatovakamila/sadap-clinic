"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./book.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function calcEndTime(start, durationMin = 30) {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + durationMin;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const BookingFormContent = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [loaded, setLoaded]   = useState(false);
  const [user, setUser]       = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);

  const [paying, setPaying]     = useState(false);
  const [payError, setPayError] = useState("");

  const [doctorName, setDoctorName]         = useState("");
  const [doctorPosition, setDoctorPosition] = useState("");
  const [sadapDoctorId, setSadapDoctorId]   = useState(null);

  const [services, setServices]             = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId]       = useState(null);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState(30);
  const [serviceSearch, setServiceSearch]   = useState("");

  const [date, setDate]             = useState("");
  const [slots, setSlots]           = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason]         = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }

    const slug    = searchParams.get("doctor");
    const name    = searchParams.get("doctorName");
    const pos     = searchParams.get("doctorPosition");
    const sadapId = searchParams.get("sadapDoctorId");

    if (!slug || !name) { router.push("/doctors"); return; }
    setDoctorName(decodeURIComponent(name));
    setDoctorPosition(decodeURIComponent(pos || ""));
    if (sadapId) setSadapDoctorId(Number(sadapId));

    const prefDate = searchParams.get("date");
    const prefTime = searchParams.get("time");
    if (prefDate) setDate(prefDate);
    if (prefTime) setPreferredTime(prefTime);

    fetch("/api/services")
      .then(r => r.json())
      .then(res => { if (res.success) setServices(res.services || []); })
      .catch(() => {})
      .finally(() => setLoadingServices(false));

    setLoaded(true);
  }, [router, searchParams]);

  // ── Fetch slots when date or service changes ───────────────────────────────
  useEffect(() => {
    if (!date || !sadapDoctorId) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    fetch(`/api/sadap/doctors/${sadapDoctorId}/slots?date=${date}`)
      .then(r => r.json())
      .then(res => {
        const raw = res.slots;
        const normalized = Array.isArray(raw)
          ? raw.map(s => typeof s === "string"
              ? { start_time: s, end_time: calcEndTime(s, selectedServiceDuration) }
              : { start_time: s.start_time || s.time, end_time: s.end_time || calcEndTime(s.start_time || s.time, selectedServiceDuration) }
            ).filter(s => s.start_time)
          : [];
        setSlots(normalized);
        if (preferredTime) {
          const match = normalized.find(s => s.start_time === preferredTime);
          if (match) setSelectedSlot(match);
          setPreferredTime("");
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, sadapDoctorId, selectedServiceDuration]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!sadapDoctorId) { setError("Врач не найден в системе клиники"); return; }
    if (!selectedSlot)  { setError("Выберите время приёма"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sadapDoctorId,
          sadapPatientId:  user?.sadap_patient_id || null,
          patientName:     user?.full_name || user?.name || "",
          patientPhone:    user?.phone || "",
          appointmentDate: date,
          appointmentTime: selectedSlot.start_time,
          endTime:         selectedSlot.end_time,
          serviceId:       selectedServiceId || null,
          serviceDuration: selectedServiceDuration,
          reason:          reason || "",
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCreatedAppointmentId(result.appointment_id || null);
        setSuccess(true);
      } else {
        setError(result.error || "Ошибка при создании записи");
      }
    } catch {
      setError("Произошла ошибка. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Pay online ────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!selectedService?.price) return;
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: createdAppointmentId,
          amount:        selectedService.price,
          description:   selectedService.name,
          phone:         user?.phone,
          email:         user?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPayError(data.error || "Оплата временно недоступна");
        return;
      }
      // Gateway is configured and we have a fresh access token + invoiceId — this is
      // as far as this can go without a verified widget script/call signature from
      // the merchant dashboard (epayment.kz's docs site didn't yield reliable content
      // for that page). Wire up the actual `halyk.pay({...})` widget call here once
      // that's confirmed against the real account.
      setPayError("Платёжный шлюз настроен, но вызов формы оплаты ещё не подключён.");
    } catch {
      setPayError("Произошла ошибка. Попробуйте позже.");
    } finally {
      setPaying(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  const selectedService = services.find(s => s.id === selectedServiceId) || null;

  if (!loaded) return null;

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <button className={styles.backButton} onClick={() => router.back()}>← Назад</button>

        <div className={styles.doctorInfo}>
          <h2 className={styles.doctorName}>{doctorName}</h2>
          {doctorPosition && <p className={styles.doctorPosition}>{doctorPosition}</p>}
        </div>

        <div className={styles.loginPrompt}>
          <div className={styles.loginPromptIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="#0c3465" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 className={styles.loginPromptTitle}>Войдите в личный кабинет</h2>
          <p className={styles.loginPromptText}>
            Для записи на приём необходимо войти в личный кабинет.
            Это займёт меньше минуты.
          </p>
          <div className={styles.loginPromptActions}>
            <Link
              href={`/auth?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/doctors")}`}
              className={styles.loginBtn}
            >
              Войти в кабинет
            </Link>
            <button className={styles.backLinkBtn} onClick={() => router.back()}>
              Вернуться к врачу
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
        </div>
        <h2 className={styles.successTitle}>Запись оформлена!</h2>
        <p className={styles.successText}>
          Вы записались к <strong>{doctorName}</strong>
          {selectedSlot && ` на ${date ? new Date(date).toLocaleDateString("ru-RU", { day:"numeric", month:"long" }) : ""} в ${selectedSlot.start_time}`}.
        </p>

        {selectedService?.price && (
          <div className={styles.paymentBlock}>
            <p className={styles.paymentAmount}>
              К оплате: {Number(selectedService.price).toLocaleString("ru-RU")} ₸
            </p>
            {payError && <p className={styles.formError}>{payError}</p>}
            <button type="button" className={styles.loginBtn} onClick={handlePay} disabled={paying}>
              {paying ? "Подготовка оплаты..." : "Оплатить онлайн"}
            </button>
          </div>
        )}

        <div className={styles.successActions}>
          <Link href="/appointments" className={styles.loginBtn}>Мои записи</Link>
          <button className={styles.backLinkBtn} onClick={() => router.push("/doctors")}>
            К врачам
          </button>
        </div>
      </div>
    );
  }

  // ── Logged in: booking form ───────────────────────────────────────────────
  return (
    <>
      <button className={styles.backButton} onClick={() => router.back()}>← Назад</button>
      <h1 className={styles.title}>Запись на приём</h1>

      <div className={styles.doctorInfo}>
        <h2 className={styles.doctorName}>{doctorName}</h2>
        {doctorPosition && <p className={styles.doctorPosition}>{doctorPosition}</p>}
      </div>

      {/* Patient info strip */}
      <div className={styles.patientStrip}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#0c3465" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <span className={styles.patientStripName}>{user.full_name || user.name || "Пациент"}</span>
        {user.phone && <span className={styles.patientStripPhone}>{user.phone}</span>}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* ── Services ────────────────────────────────────────── */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Услуга (необязательно)</label>
          {loadingServices ? (
            <div className={styles.servicesLoading}>Загрузка услуг...</div>
          ) : (
            <>
              <div className={styles.serviceSearchWrap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Поиск услуги..."
                  value={serviceSearch} onChange={e => setServiceSearch(e.target.value)}
                  className={styles.serviceSearch} />
                {serviceSearch && (
                  <button type="button" className={styles.serviceSearchClear}
                    onClick={() => setServiceSearch("")}>×</button>
                )}
              </div>
              <div className={styles.servicesList}>
                <label className={`${styles.serviceItem} ${selectedServiceId === null ? styles.serviceItemActive : ""}`}>
                  <input type="radio" name="service" value="" checked={selectedServiceId === null}
                    onChange={() => { setSelectedServiceId(null); setSelectedServiceDuration(30); setSelectedSlot(null); }}
                    className={styles.radioHidden} />
                  <span className={styles.radioCustom} />
                  <span className={styles.serviceName}>Не выбрано</span>
                </label>
                {filteredServices.map(s => (
                  <label key={s.id}
                    className={`${styles.serviceItem} ${selectedServiceId === s.id ? styles.serviceItemActive : ""}`}>
                    <input type="radio" name="service" value={s.id} checked={selectedServiceId === s.id}
                      onChange={() => {
                        setSelectedServiceId(s.id);
                        setSelectedServiceDuration(s.duration_minutes || 30);
                        setSelectedSlot(null);
                      }}
                      className={styles.radioHidden} />
                    <span className={styles.radioCustom} />
                    <span className={styles.serviceName}>{s.name}</span>
                    {s.price && (
                      <span className={styles.servicePrice}>{Number(s.price).toLocaleString("ru-RU")} ₸</span>
                    )}
                  </label>
                ))}
                {filteredServices.length === 0 && serviceSearch && (
                  <p className={styles.serviceEmpty}>Услуга не найдена</p>
                )}
              </div>
              {selectedService && (
                <div className={styles.selectedServiceBadge}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {selectedService.name}
                  {selectedService.price && ` — ${Number(selectedService.price).toLocaleString("ru-RU")} ₸`}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Date ──────────────────────────────────────────────── */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="date">Дата приёма *</label>
          <input type="date" id="date" value={date}
            onChange={e => { setDate(e.target.value); setSelectedSlot(null); }}
            className={styles.input} min={minDate} required />
        </div>

        {/* ── Time slots ────────────────────────────────────────── */}
        {date && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Время приёма *</label>
            {!sadapDoctorId ? (
              <p className={styles.slotsNote}>Врач не привязан к системе клиники</p>
            ) : loadingSlots ? (
              <div className={styles.slotsLoading}>
                <div className={styles.slotsSpinner} />
                Загрузка расписания...
              </div>
            ) : slots.length === 0 ? (
              <p className={styles.slotsNote}>На выбранную дату нет доступных слотов</p>
            ) : (
              <div className={styles.slotsGrid}>
                {slots.map(s => (
                  <button key={s.start_time} type="button"
                    className={`${styles.slotBtn} ${selectedSlot?.start_time === s.start_time ? styles.slotBtnActive : ""}`}
                    onClick={() => setSelectedSlot(s)}>
                    {s.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Reason ────────────────────────────────────────────── */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="reason">Причина обращения (необязательно)</label>
          <textarea id="reason" value={reason}
            onChange={e => setReason(e.target.value)}
            className={styles.textarea} rows="3"
            placeholder="Опишите причину вашего обращения..." />
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        <button type="submit" className={styles.submitButton}
          disabled={isSubmitting || !selectedSlot}>
          {isSubmitting ? "Отправка..." : "Записаться на приём"}
        </button>
      </form>
    </>
  );
};

const BookAppointmentPage = () => (
  <div className={styles.pageWrapper}>
    <Header showAccountButton={false} fixed={true} />
    <main className={styles.main}>
      <div className={styles.container}>
        <Suspense fallback={<div>Загрузка...</div>}>
          <BookingFormContent />
        </Suspense>
      </div>
    </main>
    <Footer />
  </div>
);

export default BookAppointmentPage;
