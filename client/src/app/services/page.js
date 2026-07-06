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
  const [visible, setVisible] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Медицинские услуги</p>
          <h1 className={styles.heroTitle}>Запишитесь к нужному<br />специалисту онлайн</h1>
          <p className={styles.heroSub}>
            Широкий спектр услуг для всей семьи — от педиатрии до кардиологии
          </p>
          <a href="tel:+77023012796" className={styles.heroPhone}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16z"/>
            </svg>
            +7 702 301 2796
          </a>
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

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Не нашли нужного специалиста?</h2>
          <p className={styles.ctaSub}>Позвоните нам — мы подберём подходящего врача и удобное время</p>
          <div className={styles.ctaBtns}>
            <a href="tel:+77023012796" className={styles.ctaBtnPrimary}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16z"/>
              </svg>
              +7 702 301 2796
            </a>
            <Link href="/doctors" className={styles.ctaBtnOutlined}>
              Выбрать врача
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
