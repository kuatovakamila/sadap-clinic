"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const PHILOSOPHY = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Доверие",
    desc: "Мы строим долгосрочные отношения с каждым пациентом на основе честности и открытости",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    title: "Внимание",
    desc: "Каждый пациент получает полное внимание врача — без спешки и формальностей",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l2 2 4-4"/><rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
    title: "Результат",
    desc: "Цель — не просто назначить лечение, а довести пациента до полного выздоровления",
  },
];

const CERTS = [
  "Лицензия Министерства здравоохранения РК на оказание медицинских услуг",
  "Все врачи имеют действующие сертификаты специалиста",
  "Оборудование сертифицировано по стандартам безопасности РК",
];

export default function ReviewsPage() {
  const philRef  = useRef(null);
  const teamRef  = useRef(null);
  const [philVis,  setPhilVis]  = useState(false);
  const [teamVis,  setTeamVis]  = useState(false);

  useEffect(() => {
    const watch = (ref, setter) => {
      if (!ref.current) return null;
      const obs = new IntersectionObserver(
        ([e]) => setter(e.isIntersecting), { threshold: 0.1 }
      );
      obs.observe(ref.current);
      return obs;
    };
    const o1 = watch(philRef, setPhilVis);
    const o2 = watch(teamRef, setTeamVis);
    return () => { o1?.disconnect(); o2?.disconnect(); };
  }, []);

  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>О нас</p>
            <h1 className={styles.heroTitle}>Наша миссия</h1>
            <p className={styles.heroSub}>
              Предоставлять широкий спектр медицинских услуг для жителей Актау и области,
              обеспечивая качественное лечение через точную диагностику, высококвалифицированных
              врачей и современное оборудование.
            </p>
            <Link href="/appointments" className={styles.heroBtn}>Записаться на приём</Link>
          </div>

          <div className={styles.heroRight}>
            {/* big glow circle */}
            <div className={styles.glowCircle} />

            {/* large medical cross */}
            <svg className={styles.bigCross} viewBox="0 0 160 160" fill="none">
              <rect x="60" y="10" width="40" height="140" rx="14" fill="white" fillOpacity="0.1"/>
              <rect x="10" y="60" width="140" height="40" rx="14" fill="white" fillOpacity="0.1"/>
              <rect x="64" y="14" width="32" height="132" rx="10" fill="white" fillOpacity="0.15"/>
              <rect x="14" y="64" width="132" height="32" rx="10" fill="white" fillOpacity="0.15"/>
            </svg>

            {/* floating stat badges */}
            <div className={`${styles.badge} ${styles.badge1}`}>
              <span className={styles.badgeNum}>9</span>
              <span className={styles.badgeText}>направлений</span>
            </div>
            <div className={`${styles.badge} ${styles.badge2}`}>
              <span className={styles.badgeNum}>5+</span>
              <span className={styles.badgeText}>лет работы</span>
            </div>
            <div className={`${styles.badge} ${styles.badge3}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className={styles.badgeText}>Лицензировано МЗ РК</span>
            </div>

            {/* decorative dots */}
            <div className={styles.dot1} /><div className={styles.dot2} /><div className={styles.dot3} />
            <div className={styles.dot4} /><div className={styles.dot5} />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Принципы</p>
          <h2 className={styles.sectionTitle}>Философия сервиса</h2>
          <p className={styles.sectionSub}>Мы слушаем, объясняем и поддерживаем.</p>
          <div
            ref={philRef}
            className={`${styles.philGrid} ${philVis ? styles.visible : ""}`}
          >
            {PHILOSOPHY.map((p, i) => (
              <div key={i} className={styles.philCard} style={{ "--i": i }}>
                <div className={styles.philIcon}>{p.icon}</div>
                <h3 className={styles.philTitle}>{p.title}</h3>
                <p className={styles.philDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team gallery */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Команда</p>
          <h2 className={styles.sectionTitle}>Наша команда и интерьер</h2>
          <div
            ref={teamRef}
            className={`${styles.teamGrid} ${teamVis ? styles.visible : ""}`}
          >
            <div className={styles.teamCard} style={{ "--i": 0 }}>
              <Image
                src="/druzhnaya-comanda.JPG"
                alt="Дружная команда"
                fill
                className={styles.teamPhoto}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className={styles.teamOverlay}>
                <span className={styles.teamLabel}>Дружная команда</span>
              </div>
            </div>
            <div className={styles.teamCard} style={{ "--i": 1 }}>
              <Image
                src="/privetstvuyshii_personal.JPG"
                alt="Приветствующий персонал"
                fill
                className={styles.teamPhoto}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className={styles.teamOverlay}>
                <span className={styles.teamLabel}>Приветствующий персонал</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className={styles.certsSection}>
        <div className={styles.container}>
          <div className={styles.certsGrid}>
            <div className={styles.certsLeft}>
              <p className={styles.eyebrowDark}>Документы</p>
              <h2 className={styles.certTitle}>Сертификаты и лицензии</h2>
              <div className={styles.certList}>
                {CERTS.map((c, i) => (
                  <div key={i} className={styles.certItem}>
                    <div className={styles.certDot} />
                    <p className={styles.certText}>{c}</p>
                  </div>
                ))}
              </div>
              <Link href="/doctors" className={styles.certsBtn}>Наши специалисты</Link>
            </div>
            <div className={styles.certsRight}>
              <div className={styles.certsStats}>
                {[
                  { num: "9",   label: "направлений" },
                  { num: "5+",  label: "лет на рынке" },
                  { num: "100%", label: "лицензировано" },
                ].map((s, i) => (
                  <div key={i} className={styles.statCard}>
                    <span className={styles.statNum}>{s.num}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
