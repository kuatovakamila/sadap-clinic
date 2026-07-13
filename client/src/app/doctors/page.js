"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import RussianDatePicker from "../components/RussianDatePicker/RussianDatePicker";


const EXP_FILTERS = [
  { label: "Любой стаж", value: "" },
  { label: "До 5 лет",   value: "0-5" },
  { label: "5–10 лет",   value: "5-10" },
  { label: "10+ лет",    value: "10+" },
];

const DoctorsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery]               = useState("");
  const [selectedSpecialty, setSelectedSpecialty]   = useState("");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor]         = useState(null);
  const [filterExp, setFilterExp]                   = useState("");
  const [isAuthenticated, setIsAuthenticated]       = useState(false);
  const [currentUser, setCurrentUser]               = useState(null);
  const [isSubmitting, setIsSubmitting]             = useState(false);
  const [appointmentDate, setAppointmentDate]       = useState("");
  const [modalSlots, setModalSlots]                 = useState([]);
  const [loadingModalSlots, setLoadingModalSlots]   = useState(false);
  const [selectedModalSlot, setSelectedModalSlot]   = useState(null);
  const [modalReason, setModalReason]               = useState("");
  const [modalError, setModalError]                 = useState("");
  const [modalSuccess, setModalSuccess]             = useState(false);
  const [doctors, setDoctors]                       = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [visible, setVisible]                       = useState(false);
  const [slotsMap, setSlotsMap]                     = useState({}); // doctor.id → string[]
  const gridRef   = useRef(null);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const ALL_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

  const getFakeSlots = (seed) => {
    const picked = [];
    let idx = seed % ALL_SLOTS.length;
    while (picked.length < 3) {
      picked.push(ALL_SLOTS[idx % ALL_SLOTS.length]);
      idx += 3;
    }
    return picked;
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try { const u = JSON.parse(user); setIsAuthenticated(true); setCurrentUser(u); }
      catch {}
    }
  }, []);

  useEffect(() => {
    fetch("/api/doctors")
      .then(r => r.json())
      .then(result => {
        if (!result.success) return;
        const list = result.doctors || [];
        setDoctors(list);

        // Fetch real tomorrow slots for every doctor that has a sadap_doctor_id
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split("T")[0];

        list.forEach(doc => {
          if (!doc.sadap_doctor_id) return;
          fetch(`/api/sadap/doctors/${doc.sadap_doctor_id}/slots?date=${dateStr}`)
            .then(r => r.json())
            .then(res => {
              const raw = (res.success && Array.isArray(res.slots)) ? res.slots : [];
              const slots = raw.map(s => (typeof s === "string" ? s : s.start_time || "")).filter(Boolean);
              setSlotsMap(prev => ({ ...prev, [doc.id]: slots }));
            })
            .catch(() => {
              setSlotsMap(prev => ({ ...prev, [doc.id]: [] }));
            });
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, [loading]);


  // Unique specialties from real data
  const specialtyLabels = useMemo(() => {
    const set = new Set(
      doctors.map(d => d.specialization_title).filter(Boolean)
    );
    return [...set].sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => doctors.filter(d => {
    const q = searchQuery.toLowerCase();
    const spec = (d.specialization_title || "").toLowerCase();
    const matchSearch = d.full_name.toLowerCase().includes(q) || spec.includes(q);
    const matchSpec   = !selectedSpecialty || spec === selectedSpecialty.toLowerCase();
    const exp = parseInt(d.experience) || 0;
    const matchExp =
      filterExp === ""     ? true :
      filterExp === "0-5"  ? exp < 5 :
      filterExp === "5-10" ? exp >= 5 && exp <= 10 :
      filterExp === "10+"  ? exp > 10 : true;
    return matchSearch && matchSpec && matchExp;
  }), [doctors, searchQuery, selectedSpecialty, filterExp]);

  const closeModal = () => {
    setShowAppointmentModal(false);
    setAppointmentDate("");
    setModalSlots([]);
    setSelectedModalSlot(null);
    setModalReason("");
    setModalError("");
    setModalSuccess(false);
  };

  const handleAppointmentClick = (e, doctor) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/auth"); return; }
    setSelectedDoctor(doctor);
    setModalSuccess(false);
    setShowAppointmentModal(true);
  };

  const handleDateChange = async (date) => {
    setAppointmentDate(date);
    setSelectedModalSlot(null);
    setModalSlots([]);
    if (!date || !selectedDoctor?.sadap_doctor_id) return;
    setLoadingModalSlots(true);
    try {
      const res = await fetch(`/api/sadap/doctors/${selectedDoctor.sadap_doctor_id}/slots?date=${date}`);
      const data = await res.json();
      const raw = data.slots;
      const normalized = Array.isArray(raw)
        ? raw.map(s => typeof s === "string" ? s : s.start_time || s.time).filter(Boolean)
        : [];
      setModalSlots(normalized);
    } catch { setModalSlots([]); }
    finally { setLoadingModalSlots(false); }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    if (!selectedDoctor?.sadap_doctor_id) { setModalError("Врач не найден в системе клиники"); return; }
    if (!appointmentDate)   { setModalError("Выберите дату"); return; }
    if (!selectedModalSlot) { setModalError("Выберите время приёма"); return; }
    setIsSubmitting(true);
    try {
      const [h, m] = selectedModalSlot.split(":").map(Number);
      const total  = h * 60 + m + 30;
      const endTime = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sadapDoctorId:   selectedDoctor.sadap_doctor_id,
          sadapPatientId:  currentUser?.sadap_patient_id || null,
          patientName:     currentUser?.full_name || currentUser?.name || "",
          patientPhone:    currentUser?.phone || "",
          appointmentDate,
          appointmentTime: selectedModalSlot,
          endTime,
          reason:          modalReason || "",
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setModalSuccess(true);
      } else {
        setModalError(result.error || "Ошибка при создании записи");
      }
    } catch { setModalError("Произошла ошибка. Попробуйте снова."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Команда специалистов</p>
          <h1 className={styles.heroTitle}>Наши врачи</h1>
          <p className={styles.heroSub}>
            Опытные специалисты, которым доверяют тысячи пациентов. Выберите врача и запишитесь онлайн.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          {/* Search */}
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Имя или специализация врача"
              className={styles.searchField}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.searchClear} onClick={() => setSearchQuery("")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Dropdowns */}
          <div className={styles.dropdowns}>
            <div className={styles.selectWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <select
                className={styles.dropdown}
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
              >
                <option value="">Все специализации</option>
                {specialtyLabels.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>

            <div className={styles.selectWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <select
                className={styles.dropdown}
                value={filterExp}
                onChange={e => setFilterExp(e.target.value)}
              >
                {EXP_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.sliderOuter}>
            <button className={styles.arrowBtn} onClick={() => scroll(-1)} aria-label="Назад">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          <div ref={scrollRef} className={styles.gridScrollWrap}>
          {loading ? (
            <div className={styles.grid}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
              </svg>
              <p className={styles.emptyTitle}>
                {selectedSpecialty
                  ? `Специалист по направлению «${selectedSpecialty}» пока не добавлен`
                  : "Врачи не найдены"}
              </p>
              <p className={styles.emptySub}>
                {selectedSpecialty
                  ? "Скоро добавим специалиста по этому направлению"
                  : "Попробуйте изменить запрос"}
              </p>
              {selectedSpecialty && (
                <button className={styles.emptyReset} onClick={() => setSelectedSpecialty("")}>
                  Показать всех врачей
                </button>
              )}
            </div>
          ) : (
            <div ref={gridRef} className={`${styles.grid} ${visible ? styles.visible : ""}`}>
              {filteredDoctors.map((doctor, i) => (
                <div key={doctor.id} className={styles.card} style={{ "--i": i }}>
                  <Link href={`/doctors/${doctor.slug}`} className={styles.cardPhotoWrap}>
                    {doctor.avatar_url ? (
                      <Image
                        src={doctor.avatar_url}
                        alt={doctor.full_name}
                        fill
                        className={styles.cardPhoto}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={styles.cardPhotoPlaceholder}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                          stroke="#b0bec5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className={styles.cardBody}>
                    <Link href={`/doctors/${doctor.slug}`} className={styles.cardNameLink}>
                      <h3 className={styles.cardName}>{doctor.full_name}</h3>
                    </Link>
                    <p className={styles.cardSpec}>{doctor.specialization_title}</p>
                    {doctor.experience && (
                      <span className={styles.expBadge}>Стаж {doctor.experience} лет</span>
                    )}
                    <div className={styles.slotsWrap}>
                      <span className={styles.slotsLabel}>Свободно завтра</span>
                      <div className={styles.slots}>
                        {doctor.sadap_doctor_id ? (
                          !(doctor.id in slotsMap) ? (
                            <span style={{ fontSize: 11, color: "#b0bec5" }}>Загрузка...</span>
                          ) : slotsMap[doctor.id].length === 0 ? (
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>Нет свободных мест</span>
                          ) : (
                            slotsMap[doctor.id].slice(0, 3).map((slot, idx) => {
                              const t = typeof slot === "string" ? slot : slot?.start_time || "";
                              return <span key={t || idx} className={styles.slot}>{t}</span>;
                            })
                          )
                        ) : (
                          getFakeSlots(i).slice(0, 3).map(slot => (
                            <span key={slot} className={styles.slot}>{slot}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.bookBtn}
                      onClick={e => handleAppointmentClick(e, doctor)}
                    >
                      Записаться на приём
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>{/* gridScrollWrap */}
            <button className={styles.arrowBtn} onClick={() => scroll(1)} aria-label="Вперёд">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>{/* sliderOuter */}
        </div>
      </main>

      <Footer />

      {/* Модальное окно записи */}
      {showAppointmentModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>×</button>

            {modalSuccess ? (
              /* ── Успех ── */
              <div className={styles.modalSuccess}>
                <div className={styles.modalSuccessIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                </div>
                <h2 className={styles.modalSuccessTitle}>Запись оформлена!</h2>
                <p className={styles.modalSuccessText}>
                  Вы записались к <strong>{selectedDoctor?.full_name}</strong>
                  {appointmentDate && ` на ${new Date(appointmentDate).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}`}
                  {selectedModalSlot && ` в ${selectedModalSlot}`}.
                </p>
                <button className={styles.formSubmit} onClick={() => router.push("/appointments")}>
                  Мои записи
                </button>
              </div>
            ) : (
              /* ── Форма ── */
              <>
                <h2 className={styles.modalTitle}>Запись на приём</h2>
                <p className={styles.modalDoctor}>{selectedDoctor?.full_name}</p>

                {/* Пациент */}
                <div className={styles.modalPatientStrip}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="#0c3465" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <span>{currentUser?.full_name || currentUser?.name || "Пациент"}</span>
                  {currentUser?.phone && <span className={styles.modalPatientPhone}>{currentUser.phone}</span>}
                </div>

                <form onSubmit={handleAppointmentSubmit} className={styles.appointmentForm}>
                  {/* Дата */}
                  <RussianDatePicker name="date" value={appointmentDate}
                    onChange={handleDateChange} disabled={isSubmitting} required />

                  {/* Слоты */}
                  {appointmentDate && (
                    <div className={styles.modalSlotsWrap}>
                      {loadingModalSlots ? (
                        <div className={styles.modalSlotsLoading}>Загрузка расписания...</div>
                      ) : modalSlots.length === 0 ? (
                        <p className={styles.modalSlotsEmpty}>На эту дату нет доступных слотов</p>
                      ) : (
                        <div className={styles.modalSlotsGrid}>
                          {modalSlots.map((t, idx) => {
                            const time = typeof t === "string" ? t : t?.start_time || "";
                            return (
                              <button key={time || idx} type="button"
                                className={`${styles.modalSlotBtn} ${selectedModalSlot === time ? styles.modalSlotBtnActive : ""}`}
                                onClick={() => setSelectedModalSlot(time)}>
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Причина */}
                  <textarea placeholder="Причина обращения (необязательно)"
                    className={styles.formTextarea} disabled={isSubmitting}
                    value={modalReason} onChange={e => setModalReason(e.target.value)} />

                  {modalError && <p className={styles.modalError}>{modalError}</p>}

                  <button type="submit" className={styles.formSubmit}
                    disabled={isSubmitting || !selectedModalSlot}>
                    {isSubmitting ? "Отправка..." : "Записаться"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
