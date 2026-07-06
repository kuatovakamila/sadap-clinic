"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const SERVICES = [
  {
    id: 1, title: "Педиатрия", slug: "pediatriya",
    desc: "Здоровье и развитие детей от рождения до 18 лет",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4"/>
        <path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
        <path d="M10 12h4"/>
      </svg>
    ),
  },
  {
    id: 2, title: "Кардиология", slug: "",
    desc: "Диагностика и лечение заболеваний сердца и сосудов",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    ),
  },
  {
    id: 3, title: "Неврология", slug: "",
    desc: "Диагностика и лечение расстройств нервной системы",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h3l2-7 4 14 3-7h3l2-4h3"/>
      </svg>
    ),
  },
  {
    id: 4, title: "Гинекология", slug: "ginekologiya",
    desc: "Женское здоровье на всех этапах жизни",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5"/>
        <path d="M12 13v9M9 19h6"/>
      </svg>
    ),
  },
  {
    id: 5, title: "Эндокринология", slug: "endokrinologiya",
    desc: "Гормональные нарушения и лечение желёз",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
    ),
  },
  {
    id: 6, title: "Урология", slug: "urologiya",
    desc: "Заболевания почек и мочевыводящих путей",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
        <path d="M12 16v2"/>
      </svg>
    ),
  },
  {
    id: 7, title: "Терапия", slug: "terapiya",
    desc: "Общая диагностика и лечение внутренних болезней",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
        <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/>
        <circle cx="20" cy="10" r="2"/>
      </svg>
    ),
  },
  {
    id: 8, title: "Дерматология", slug: "dermatologiya",
    desc: "Кожные заболевания и их лечение",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    ),
  },
  {
    id: 9, title: "Ортопедия", slug: "ortopediya",
    desc: "Заболевания опорно-двигательного аппарата",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6a2 2 0 0 0-2-2 2 2 0 0 0-2 2c0 .74.4 1.38 1 1.72V14.28A2 2 0 0 0 14 16a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-1-1.72V7.72A2 2 0 0 0 18 6z"/>
        <path d="M9 18a2 2 0 0 0 1-1.72V7.72A2 2 0 0 0 8 6a2 2 0 0 0-2 2 2 2 0 0 0 1 1.72V16.28A2 2 0 0 0 6 18a2 2 0 0 0 2 2 2 2 0 0 0 2-2"/>
        <path d="M10 10h4M10 14h4"/>
      </svg>
    ),
  },
];

export default function ServicesPage() {
  const [visible, setVisible]           = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [gynDoctors, setGynDoctors]     = useState([]);
  const [heroDoctors, setHeroDoctors]   = useState([]);
  const gridRef   = useRef(null);
  const detailRef = useRef(null);

  useEffect(() => {
    const make = (el, setter) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => setter(e.isIntersecting),
        { threshold: 0.1 }
      );
      obs.observe(el);
      return obs;
    };
    const o1 = make(gridRef.current, setVisible);
    const o2 = make(detailRef.current, setDetailVisible);

    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.doctors || []);
        const gyn = list
          .filter((d) =>
            (d.specialization || d.position || "")
              .toLowerCase()
              .includes("гинеколог")
          )
          .slice(0, 2);
        setGynDoctors(gyn);
        setHeroDoctors(list.slice(0, 3));
      })
      .catch(() => {});

    return () => { o1?.disconnect(); o2?.disconnect(); };
  }, []);

  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>Медицинские услуги</p>
            <h1 className={styles.heroTitle}>Запишитесь к нужному<br />специалисту онлайн</h1>
            <p className={styles.heroSub}>
              Широкий спектр услуг для всей семьи — от педиатрии до кардиологии
            </p>
            <a href="mailto:support@sadapclinic.kz" className={styles.heroBtn}>
              Оставить заявку
            </a>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroVisual}>
              <div className={styles.heroCircle} />

              {/* floating doctor cards — always 3, fill with placeholders if needed */}
              {(() => {
                const PLACEHOLDERS = [
                  { id: "p1", full_name: "Айгерим Сейтова", specialization: "Гинеколог",  avatar_url: null },
                  { id: "p2", full_name: "Динара Ахметова",  specialization: "Педиатр",    avatar_url: null },
                  { id: "p3", full_name: "Сергей Николаев",  specialization: "Кардиолог",  avatar_url: null },
                ];
                const AVATAR_BG = ["#0c3465", "#1a6b5a", "#7a3a0c"];
                const docs = [
                  ...heroDoctors,
                  ...PLACEHOLDERS.slice(heroDoctors.length),
                ].slice(0, 3);
                return docs.map((doc, i) => {
                  const initials = (doc.full_name || "")
                    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                  const firstName = (doc.full_name || "").split(" ").slice(0, 2).join(" ");
                  const spec = (doc.specialization || doc.position || "").split(",")[0];
                  return (
                    <div key={doc.id} className={`${styles.heroDocCard} ${styles[`hdc${i + 1}`]}`}>
                      <div className={styles.heroDocPhoto} style={!doc.avatar_url ? { background: AVATAR_BG[i] } : {}}>
                        {doc.avatar_url
                          ? <img src={doc.avatar_url} alt={doc.full_name} className={styles.heroDocImg} />
                          : <span className={styles.heroDocInitials}>{initials}</span>
                        }
                      </div>
                      <span className={styles.heroDocName}>{firstName}</span>
                    </div>
                  );
                });
              })()}

              <div className={styles.dot1} />
              <div className={styles.dot2} />
              <div className={styles.dot3} />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className={styles.main}>
        <div className={styles.container}>
          <div
            ref={gridRef}
            className={`${styles.grid} ${visible ? styles.visible : ""}`}
          >
            {SERVICES.map((s, i) => {
              const inner = (
                <>
                  <div className={styles.iconBox}>{s.icon}</div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <p className={styles.cardDesc}>{s.desc}</p>
                  </div>
                  <span className={styles.cardAction}>
                    Записаться
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </>
              );

              return s.slug ? (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className={styles.card}
                  style={{ "--i": i }}
                >
                  {inner}
                </Link>
              ) : (
                <Link
                  key={s.id}
                  href="/doctors"
                  className={styles.card}
                  style={{ "--i": i }}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Detail section */}
      <section className={styles.detailSection}>
        <div className={styles.detailInner}>

          {/* Header with price badge */}
          <div className={styles.detailHeader}>
            <h2 className={styles.detailTitle}>Гинекология</h2>
            <span className={styles.detailPriceBadge}>от 12 000 тнг</span>
          </div>

          {/* Cards grid */}
          <div
            ref={detailRef}
            className={`${styles.detailCards} ${detailVisible ? styles.detailVisible : ""}`}
          >
            {/* Card 1 — Problem */}
            <div className={styles.detailCard} style={{ "--i": 0 }}>
              <div className={styles.detailIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M12 13v9M9 19h6"/>
                </svg>
              </div>
              <h3 className={styles.detailCardTitle}>С чем обращаются</h3>
              <div className={styles.tagList}>
                {[
                  "Нарушения цикла",
                  "Боли внизу живота",
                  "Воспаления",
                  "Профосмотр",
                  "Контрацепция",
                  "Подготовка к беременности",
                  "УЗИ малого таза",
                ].map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Card 2 — Timeline */}
            <div className={styles.detailCard} style={{ "--i": 1 }}>
              <div className={styles.detailIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l2 2 4-4"/>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <h3 className={styles.detailCardTitle}>Как проходит приём</h3>
              <div className={`${styles.timeline} ${detailVisible ? styles.detailVisible : ""}`}>
                {[
                  "Беседа и сбор жалоб",
                  "Осмотр и УЗИ-диагностика",
                  "Анализы и назначение лечения",
                ].map((step, i, arr) => (
                  <div key={i} className={styles.timelineStep}>
                    <div className={styles.timelineLeft}>
                      <span className={styles.timelineNum}>{i + 1}</span>
                      {i < arr.length - 1 && (
                        <div className={styles.timelineLine}>
                          <div className={styles.timelineLineFill} style={{ "--delay": `${0.35 + i * 0.35}s` }} />
                        </div>
                      )}
                    </div>
                    <span className={styles.timelineText}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full-width doctor card */}
          <div
            className={`${styles.detailCard} ${styles.detailCardFull} ${detailVisible ? styles.detailVisible : ""}`}
            style={{ "--i": 2 }}
          >
            <h3 className={styles.detailCardTitle}>Кто ведёт приём</h3>
            <div className={styles.docRow}>
              {(gynDoctors.length > 0 ? gynDoctors : [
                { id: "a", full_name: "Анна Иванова",   specialization: "Гинеколог, к.м.н.",       experience: 12, avatar_url: null },
                { id: "b", full_name: "Мария Соколова", specialization: "Акушер-гинеколог, УЗИ",   experience: 8,  avatar_url: null },
              ]).map((doc) => {
                const initials = (doc.full_name || "")
                  .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                return (
                  <Link key={doc.id} href="/doctors" className={styles.docCard}>
                    <div className={styles.docPhoto}>
                      {doc.avatar_url
                        ? <img src={doc.avatar_url} alt={doc.full_name} className={styles.docImg} />
                        : <span className={styles.docInitials}>{initials}</span>
                      }
                    </div>
                    <div className={styles.docInfo}>
                      <p className={styles.docName}>{doc.full_name}</p>
                      <p className={styles.docSpec}>{doc.specialization || doc.position}</p>
                      {doc.experience && (
                        <p className={styles.docExp}>Опыт {doc.experience} лет</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={styles.detailBtnWrap}>
            <Link href="/doctors" className={styles.detailBtn}>
              Записаться на приём
            </Link>
            <Link href="/doctors" className={styles.detailBtnOutlined}>
              Смотреть всех врачей
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
