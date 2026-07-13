"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import RussianDatePicker from "../../components/RussianDatePicker/RussianDatePicker";

const ALL_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00",
];

const REVIEWS = [
  {
    name: "Арнау Жупарбеков",
    text: "Отличная клиника! Пришел по рекомендациям друзей, не жалею — высокое качество обслуживания, методика лечения отличается от других!",
    avatar: "/arnau.png",
    rating: 5,
  },
  {
    name: "Кайсар Калибаев",
    text: "Самое лучшее место для медицинского обслуживания в Актау! Удобное расположение, персонал профессиональный, врачи опытные. Спасибо!",
    avatar: "/kaysar.png",
    rating: 5,
  },
];

/* generate 7 upcoming weekdays starting from tomorrow */
function getNextDays(count = 7) {
  const days = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const DAY_NAMES = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const MONTH_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

/* fake free slots — deterministic per doctor+date */
function getFakeSlots(doctorId, dateStr) {
  const seed = (doctorId || 0) + (dateStr ? parseInt(dateStr.replace(/-/g, "")) % 100 : 0);
  const taken = new Set();
  let i = seed % ALL_SLOTS.length;
  for (let k = 0; k < 5; k++) {
    taken.add(ALL_SLOTS[i % ALL_SLOTS.length]);
    i += 2 + (seed % 3);
  }
  return ALL_SLOTS.filter(s => !taken.has(s));
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [doctorData, setDoctorData]             = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [isAuthenticated, setIsAuthenticated]   = useState(false);
  const [currentUser, setCurrentUser]           = useState(null);
  const [showModal, setShowModal]               = useState(false);
  const [selectedCert, setSelectedCert]         = useState(null);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [appointmentDate, setAppointmentDate]   = useState("");
  const [prefilledTime, setPrefilledTime]       = useState("");

  /* day picker state */
  const days = useMemo(() => getNextDays(7), []);
  const [selectedDayIdx, setSelectedDayIdx]     = useState(0);
  const [freeSlots, setFreeSlots]               = useState([]);

  const selectedDay = days[selectedDayIdx];
  const selectedDateStr = selectedDay
    ? `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,"0")}-${String(selectedDay.getDate()).padStart(2,"0")}`
    : "";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try { const u = JSON.parse(user); setIsAuthenticated(true); setCurrentUser(u); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!params.slug) return;
    fetch(`/api/doctors/${params.slug}`)
      .then(r => r.json())
      .then(res => { if (res.success) setDoctorData(res.doctor); else router.push("/doctors"); })
      .catch(() => router.push("/doctors"))
      .finally(() => setLoading(false));
  }, [params.slug, router]);

  // Fetch real slots from SADAP when a date is selected and doctor has sadap_doctor_id
  useEffect(() => {
    if (!selectedDateStr) return;

    const sadapId = doctorData?.sadap_doctor_id;
    if (sadapId) {
      fetch(`/api/sadap/doctors/${sadapId}/slots?date=${selectedDateStr}`)
        .then(r => r.json())
        .then(res => {
          const raw = res.success && Array.isArray(res.slots) ? res.slots : null;
          const slots = raw
            ? raw.map(s => (typeof s === "string" ? s : s.start_time || "")).filter(Boolean)
            : null;
          setFreeSlots(slots ?? getFakeSlots(doctorData?.id, selectedDateStr));
        })
        .catch(() => setFreeSlots(getFakeSlots(doctorData?.id, selectedDateStr)));
    } else {
      setFreeSlots(getFakeSlots(doctorData?.id, selectedDateStr));
    }
  }, [selectedDateStr, doctorData?.sadap_doctor_id, doctorData?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setShowModal(false); setSelectedCert(null); }
    };
    if (showModal || selectedCert) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal, selectedCert]);

  const openModal = (time = "") => {
    if (!isAuthenticated) { alert("Сперва войдите в личный кабинет"); router.push("/auth"); return; }
    setPrefilledTime(time);
    if (selectedDateStr) setAppointmentDate(selectedDateStr);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) { alert("Сперва войдите в личный кабинет"); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData(e.target);
      const appointmentTime = fd.get("time");

      const body = {
        userId: currentUser.id,
        doctorSlug: params.slug,
        doctorName: doctorData.full_name,
        patientName: fd.get("name"),
        patientPhone: fd.get("phone"),
        appointmentDate: fd.get("date"),
        appointmentTime,
        reason: fd.get("reason") || "",
      };

      // Include SADAP IDs when available so the booking lands in the clinic MIS
      if (doctorData.sadap_doctor_id) {
        body.sadapDoctorId = doctorData.sadap_doctor_id;
      }
      if (currentUser.sadap_patient_id) {
        body.sadapPatientId = currentUser.sadap_patient_id;
      }

      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Заявка успешно отправлена!");
        setShowModal(false);
        e.target.reset();
      } else {
        alert(result.error || "Ошибка при создании записи");
      }
    } catch { alert("Произошла ошибка. Попробуйте снова."); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (!doctorData) return null;

  const rating = Math.max(1, Math.min(5, Math.round(doctorData.rating || 5)));
  const exp = doctorData.experience_years || doctorData.experience || "—";
  const certs = (doctorData.certificates || []).filter(c => c?.url);
  const directions = doctorData.directions || [];
  const treatmentTags = doctorData.treatmentTags || [];

  return (
    <div className={styles.page}>
      <Header fixed={true} showAccountButton={true} />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroPhoto}>
            {doctorData.avatar_url ? (
              <Image
                src={doctorData.avatar_url}
                alt={doctorData.full_name}
                fill
                className={styles.heroPhotoImg}
                sizes="(max-width: 768px) 100vw, 280px"
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#e8edf4",
              }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none"
                  stroke="#90a4b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
            )}
          </div>

          <div className={styles.heroInfo}>
            <p className={styles.heroEyebrow}>Специалист клиники</p>
            <h1 className={styles.heroName}>{doctorData.full_name}</h1>
            <p className={styles.heroSpec}>{doctorData.specialization_title}</p>

            <div className={styles.heroRating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rating ? styles.star : styles.starEmpty}>★</span>
                ))}
              </div>
              <span className={styles.ratingText}>{rating}.0 / 5.0</span>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{exp}+</span>
                <span className={styles.heroStatLabel}>лет опыта</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{directions.length || "—"}</span>
                <span className={styles.heroStatLabel}>направлений</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>100%</span>
                <span className={styles.heroStatLabel}>лицензировано</span>
              </div>
            </div>

            <button className={styles.heroBtn} onClick={() => openModal()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              Записаться на приём
            </button>
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Top info cards */}
          <div className={styles.infoGrid}>
            {/* Education */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <p className={styles.infoCardTitle}>Образование</p>
              <p className={styles.infoCardText}>{doctorData.education_text || "Высшее медицинское образование"}</p>
            </div>

            {/* Working hours */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <p className={styles.infoCardTitle}>Время приёма</p>
              <p className={styles.infoCardText}>{doctorData.workingHours || "Пн–Пт: 09:00–17:00"}</p>
            </div>

            {/* Quick slots */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l2 2 4-4"/>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <p className={styles.infoCardTitle}>Свободно завтра</p>
              <div className={styles.slotsList}>
                {freeSlots.slice(0, 5).map(s => (
                  <button key={s} className={styles.slotChip} onClick={() => openModal(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Embedded schedule from SADAP */}
          {doctorData.schedules?.length > 0 && (() => {
            const DAY_RU = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
            return (
              <div className={styles.sectionCard} style={{ marginBottom: 16 }}>
                <h2 className={styles.sectionTitle}>Расписание приёма</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {doctorData.schedules.map((item, i) => (
                    <div key={i} style={{
                      background: "#f0f4ff", borderRadius: 8,
                      padding: "10px 16px", minWidth: 110, textAlign: "center",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0c3465", marginBottom: 4 }}>
                        {DAY_RU[item.day_of_week] || `День ${item.day_of_week}`}
                      </div>
                      <div style={{ fontSize: 12, color: "#4b5563" }}>
                        {item.start_time} – {item.end_time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Content row: directions + sidebar booking */}
          <div className={styles.contentRow}>
            <div>
              {/* Directions */}
              {directions.length > 0 && (
                <div className={styles.sectionCard} style={{ marginBottom: 16 }}>
                  <h2 className={styles.sectionTitle}>Направления</h2>
                  <ul className={styles.directionsList}>
                    {directions.map((d, i) => (
                      <li key={i} className={styles.directionItem}>
                        <div className={styles.directionDot} />
                        {d}
                      </li>
                    ))}
                  </ul>

                  {treatmentTags.length > 0 && (
                    <div className={styles.tagsSection}>
                      <p className={styles.tagsSectionTitle}>Специализация по заболеваниям</p>
                      <div className={styles.tags}>
                        {treatmentTags.map((t, i) => (
                          <span key={i} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Certificates */}
              {certs.length > 0 && (
                <div className={styles.certsCard}>
                  <h2 className={styles.sectionTitle}>Сертификаты и лицензии</h2>
                  <div className={styles.certsScroll}>
                    {certs.map((cert, i) => (
                      <div key={i} className={styles.certThumb} onClick={() => setSelectedCert(cert.url)}>
                        <Image src={cert.url} alt={cert.title || `Сертификат ${i+1}`}
                          fill style={{ objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                  <p className={styles.certNote}>Нажмите на сертификат чтобы увидеть подробнее</p>
                </div>
              )}

              {/* Reviews */}
              <div className={styles.reviewsCard} style={{ marginTop: 16 }}>
                <h2 className={styles.sectionTitle}>Отзывы пациентов</h2>
                <div className={styles.reviewsGrid}>
                  {REVIEWS.map((r, i) => (
                    <div key={i} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewAvatar}>
                          <Image src={r.avatar} alt={r.name} fill style={{ objectFit: "cover", borderRadius: "50%" }} />
                        </div>
                        <div>
                          <p className={styles.reviewName}>{r.name}</p>
                          <div className={styles.reviewStars}>
                            {[...Array(r.rating)].map((_, j) => (
                              <span key={j} className={styles.reviewStar}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className={styles.reviewText}>"{r.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar booking card with day picker */}
            <div>
              <div className={styles.bookCard}>
                <h3 className={styles.bookCardTitle}>Записаться онлайн</h3>
                <p className={styles.bookCardSub}>Выберите удобный день и время</p>

                {/* Day picker */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {days.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDayIdx(i)}
                      style={{
                        flex: "0 0 calc(25% - 5px)",
                        background: selectedDayIdx === i ? "#fff" : "rgba(255,255,255,0.12)",
                        color: selectedDayIdx === i ? "#0c3465" : "rgba(255,255,255,0.8)",
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 4px",
                        cursor: "pointer",
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 700,
                        fontSize: 11,
                        textAlign: "center",
                        lineHeight: 1.4,
                        transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      <div>{DAY_NAMES[d.getDay()]}</div>
                      <div>{d.getDate()} {MONTH_SHORT[d.getMonth()]}</div>
                    </button>
                  ))}
                </div>

                <div className={styles.bookCardDivider} />

                {/* Slots for selected day */}
                <div className={styles.bookCardSlots}>
                  <span className={styles.bookCardSlotsLabel}>
                    Свободные окошки — {selectedDay.getDate()} {MONTH_SHORT[selectedDay.getMonth()]}
                  </span>
                  {freeSlots.length > 0 ? (
                    <div className={styles.bookCardSlotsRow}>
                      {freeSlots.map(s => (
                        <button key={s} className={styles.bookCardSlot} onClick={() => openModal(s)}>{s}</button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                      Нет свободных мест
                    </p>
                  )}
                </div>

                <div className={styles.bookCardDivider} />

                <button className={styles.bookBtn} onClick={() => openModal()}>
                  Записаться на приём
                </button>

                <div className={styles.bookCardContact}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16z"/>
                  </svg>
                  <div>
                    <p className={styles.bookCardContactText}>Или позвоните нам</p>
                    <a href="tel:+77023012796" className={styles.bookCardPhone}>+7 702 301-27-96</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Certificate popup */}
      {selectedCert && (
        <div className={styles.popupOverlay} onClick={() => setSelectedCert(null)}>
          <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
            <button className={styles.popupClose} onClick={() => setSelectedCert(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <Image src={selectedCert} alt="Сертификат" width={600} height={900}
              className={styles.popupImage} unoptimized />
          </div>
        </div>
      )}

      {/* Appointment modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            <h2 className={styles.modalTitle}>Записаться на приём</h2>
            <p className={styles.modalDoctor}>Врач: {doctorData.full_name}</p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input className={styles.formInput} type="text" name="name"
                placeholder="Ваше ФИО" required disabled={isSubmitting} />
              <input className={styles.formInput} type="tel" name="phone"
                placeholder="Телефон" required disabled={isSubmitting} />
              <RussianDatePicker name="date" value={appointmentDate}
                onChange={setAppointmentDate} disabled={isSubmitting} required />
              <select className={styles.formSelect} name="time" required disabled={isSubmitting}
                defaultValue={prefilledTime}>
                <option value="">Выберите время</option>
                {ALL_SLOTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <textarea className={styles.formTextarea} name="reason"
                placeholder="Причина обращения (необязательно)" disabled={isSubmitting} />
              <button type="submit" className={styles.formSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Отправка..." : "Записаться"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
