"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./Services.module.css";
import Link from "next/link";

const SERVICES = [
  {
    title: "Диагностика и УЗИ",
    cat: "Диагностика",
    featured: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
      </svg>
    ),
  },
  {
    title: "Лабораторные анализы",
    cat: "Диагностика",
    featured: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6v4l3 9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l3-9V3z"/>
        <path d="M6 14h12"/>
      </svg>
    ),
  },
  {
    title: "ЭКГ",
    cat: "Диагностика",
    featured: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 12 6 12 8 4 10 20 12 10 14 15 16 12 22 12"/>
      </svg>
    ),
  },
  {
    title: "Консультации врачей",
    cat: "Лечение",
    featured: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    title: "Хирургическое лечение",
    cat: "Лечение",
    featured: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6M9 5h6"/>
        <path d="M8 12H2l4 4-4 4h6"/>
        <path d="M16 12h6l-4 4 4 4h-6"/>
        <rect x="8" y="8" width="8" height="8" rx="2"/>
      </svg>
    ),
  },
  {
    title: "Вакцинация",
    cat: "Лечение",
    featured: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 5-7 7M5 19l7-7M15 3l6 6"/>
        <path d="M8.5 8.5l-6 6a3 3 0 0 0 4.24 4.24l6-6"/>
        <path d="M3 21l3-3"/>
      </svg>
    ),
  },
  {
    title: "Услуги на дому",
    cat: "На дому",
    featured: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    title: "Скорая помощь",
    cat: "На дому",
    featured: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
  },
];

const TABS = ["Все", "Диагностика", "Лечение", "На дому"];

const Services = () => {
  const [activeTab, setActiveTab] = useState("Все");
  const [visible, setVisible]     = useState(false);
  const [animKey, setAnimKey]     = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setVisible(false);
    setAnimKey((k) => k + 1);
    requestAnimationFrame(() => setVisible(true));
  };

  const filtered = activeTab === "Все"
    ? SERVICES
    : SERVICES.filter((s) => s.cat === activeTab);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.title}>Наши услуги</h2>
            <p className={styles.subtitle}>Диагностика, лечение и консультации — всё в одном месте</p>
          </div>
          <Link href="/services" className={styles.allLink}>
            Все услуги
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => handleTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          className={`${styles.grid} ${visible ? styles.visible : ""}`}
          ref={ref}
        >
          {filtered.map((s, i) => (
            <div
              key={`${s.title}-${animKey}`}
              className={`${styles.card} ${s.featured ? styles.featured : ""}`}
              style={{ "--i": i }}
            >
              <div className={styles.iconBox}>{s.icon}</div>
              <span className={styles.cardTitle}>{s.title}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
