"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./Doctors.module.css";
import Image from "next/image";
import Link from "next/link";

const Doctors = () => {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeSpec, setActiveSpec] = useState("all");
  const [progress, setProgress]     = useState(0);
  const scrollRef                   = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res    = await fetch("/api/doctors");
        const result = await res.json();
        if (result.success) setDoctors(result.doctors || []);
      } catch (e) {
        console.error("Error loading doctors:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  /* derived */
  const specs = ["all", ...Array.from(
    new Set(doctors.map((d) => d.specialization_title).filter(Boolean))
  )];
  const filtered = activeSpec === "all"
    ? doctors
    : doctors.filter((d) => d.specialization_title === activeSpec);

  /* scroll progress bar */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [filtered]);

  /* reset scroll when filter changes */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setProgress(0);
    }
  }, [activeSpec]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.title}>Наши врачи</h2>
            <p className={styles.subtitle}>Опытные специалисты по 20+ направлениям</p>
          </div>
          <Link href="/doctors" className={styles.allLink}>
            Все врачи
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* ── Spec tabs ── */}
        {specs.length > 1 && (
          <div className={styles.tabs}>
            {specs.map((spec) => (
              <button
                key={spec}
                className={`${styles.tab} ${activeSpec === spec ? styles.tabActive : ""}`}
                onClick={() => setActiveSpec(spec)}
              >
                {spec === "all" ? "Все специалисты" : spec}
              </button>
            ))}
          </div>
        )}

        {/* ── Cards scroll ── */}
        <div className={styles.grid} ref={scrollRef}>
          {loading ? (
            <p className={styles.empty}>Загрузка...</p>
          ) : filtered.length > 0 ? (
            filtered.map((doctor) => (
              <div key={doctor.id} className={styles.card}>

                {/* Photo cover */}
                <div className={styles.photoWrap}>
                  <Image
                    src={doctor.avatar_url || "/services/doctor.png"}
                    alt={doctor.full_name}
                    fill
                    className={styles.photo}
                  />
                  {doctor.experience_years && (
                    <span className={styles.expBadge}>
                      Стаж {doctor.experience_years} лет
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className={styles.cardBody}>
                  {doctor.specialization_title && (
                    <span className={styles.specTag}>{doctor.specialization_title}</span>
                  )}
                  <h3 className={styles.name}>{doctor.full_name}</h3>
                  {(doctor.rating != null || doctor.reviews_count != null) && (
                    <p className={styles.rating}>
                      <svg width="14" height="14" viewBox="0 0 24 24"
                        fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      {doctor.rating ?? "—"}
                      {doctor.reviews_count != null && (
                        <span className={styles.reviews}> · {doctor.reviews_count} отзывов</span>
                      )}
                    </p>
                  )}
                  <Link href={`/doctors/${doctor.slug}`} className={styles.bookBtn}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    Записаться
                  </Link>
                </div>

              </div>
            ))
          ) : (
            <p className={styles.empty}>Врачи не найдены</p>
          )}
        </div>

        {/* ── Progress bar ── */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>

      </div>
    </section>
  );
};

export default Doctors;
