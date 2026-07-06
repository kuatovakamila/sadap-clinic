"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import RussianDatePicker from "../components/RussianDatePicker/RussianDatePicker";

const SPECIALTY_LABELS = [
  "Педиатр", "Кардиолог", "Гинеколог", "Терапевт",
  "Невролог", "Эндокринолог", "Хирург", "Дерматолог",
  "Уролог", "Ортопед", "Офтальмолог", "ЛОР",
  "Психолог", "Аллерголог", "Гастроэнтеролог", "Ревматолог",
];

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
  const [doctors, setDoctors]                       = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [visible, setVisible]                       = useState(false);
  const gridRef = useRef(null);

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
      .then(result => { if (result.success) setDoctors(result.doctors || []); })
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


  const filteredDoctors = useMemo(() => doctors.filter(d => {
    const q = searchQuery.toLowerCase();
    const matchSearch = d.full_name.toLowerCase().includes(q) ||
                        (d.specialization_title || "").toLowerCase().includes(q);
    const matchSpec   = !selectedSpecialty ||
                        (d.specialization_title || "").toLowerCase().includes(selectedSpecialty.toLowerCase());
    const exp = parseInt(d.experience) || 0;
    const matchExp =
      filterExp === ""     ? true :
      filterExp === "0-5"  ? exp < 5 :
      filterExp === "5-10" ? exp >= 5 && exp <= 10 :
      filterExp === "10+"  ? exp > 10 : true;
    return matchSearch && matchSpec && matchExp;
  }), [doctors, searchQuery, selectedSpecialty, filterExp]);

  const handleAppointmentClick = (e, doctor) => {
    e.preventDefault();
    if (!isAuthenticated) { alert("Сперва войдите в личный кабинет"); router.push("/auth"); return; }
    setSelectedDoctor(doctor);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) { router.push("/auth"); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData(e.target);
      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          doctorSlug: selectedDoctor.slug,
          doctorName: selectedDoctor.full_name,
          patientName: fd.get("name"),
          patientPhone: fd.get("phone"),
          appointmentDate: fd.get("date"),
          appointmentTime: fd.get("time"),
          reason: fd.get("reason") || "",
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Заявка успешно отправлена!");
        setShowAppointmentModal(false);
        e.target.reset();
      } else {
        alert(result.error || "Ошибка при создании записи");
      }
    } catch { alert("Произошла ошибка. Попробуйте снова."); }
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
                {SPECIALTY_LABELS.map(spec => (
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
          <div className={styles.gridScrollWrap}>
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
                    <Image
                      src={doctor.avatar_url && doctor.avatar_url !== "" ? doctor.avatar_url : "/doctor-female.jpg"}
                      alt={doctor.full_name}
                      fill
                      className={styles.cardPhoto}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Link>
                  <div className={styles.cardBody}>
                    <Link href={`/doctors/${doctor.slug}`} className={styles.cardNameLink}>
                      <h3 className={styles.cardName}>{doctor.full_name}</h3>
                    </Link>
                    <p className={styles.cardSpec}>{doctor.specialization_title}</p>
                    {doctor.experience && (
                      <span className={styles.expBadge}>Стаж {doctor.experience} лет</span>
                    )}
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
          </div>
        </div>
      </main>

      <Footer />

      {/* Модальное окно записи */}
      {showAppointmentModal && (
        <div className={styles.modal} onClick={() => setShowAppointmentModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAppointmentModal(false)}>×</button>
            <h2 className={styles.modalTitle}>Записаться на приём</h2>
            <p className={styles.modalDoctor}>{selectedDoctor?.full_name}</p>
            <form onSubmit={handleAppointmentSubmit} className={styles.appointmentForm}>
              <input type="text" name="name" placeholder="Ваше ФИО" className={styles.formInput} required disabled={isSubmitting} />
              <input type="tel" name="phone" placeholder="Телефон" className={styles.formInput} required disabled={isSubmitting} />
              <RussianDatePicker name="date" value={appointmentDate} onChange={setAppointmentDate} disabled={isSubmitting} required />
              <select name="time" className={styles.formInput} required disabled={isSubmitting}>
                <option value="">Выберите время</option>
                {["09:00","10:00","11:00","14:00","15:00","16:00"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea name="reason" placeholder="Причина обращения (необязательно)" className={styles.formTextarea} disabled={isSubmitting} />
              <button type="submit" className={styles.formSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Отправка..." : "Записаться"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
