"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const VALUES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Профессионализм",
    desc: "Специалисты с многолетним опытом и подтверждёнными квалификациями",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    ),
    title: "Забота о пациентах",
    desc: "Индивидуальный подход к каждому — от первого визита до полного выздоровления",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M9 16l2 2 4-4"/>
      </svg>
    ),
    title: "Удобная запись",
    desc: "Онлайн-запись 24/7 без очередей и лишних звонков — быстро и удобно",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "9 направлений",
    desc: "Широкий спектр медицинских услуг для всей семьи под одной крышей",
  },
];

const CONTACTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Адрес",
    value: "19 мкр, ЖК «Ханшайым», офис 4",
    href: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: "Записаться на приём",
    value: "+7 700 020-18-20",
    href: "tel:+77000201820",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    label: "Email",
    value: "support@sadapclinic.kz",
    href: "mailto:support@sadapclinic.kz",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    label: "Instagram",
    value: "@sadap_clinic",
    href: "https://instagram.com/sadap_clinic",
  },
];

export default function AboutUsPage() {
  const valuesRef = useRef(null);
  const [valVisible, setValVisible] = useState(false);

  useEffect(() => {
    if (!valuesRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setValVisible(e.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(valuesRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>О клинике</p>
          <h1 className={styles.heroTitle}>Садап Клиник</h1>
          <p className={styles.heroSub}>
            Современная многопрофильная клиника в Актау. Мы объединяем опытных специалистов,
            передовое оборудование и заботу о каждом пациенте.
          </p>
          <Link href="/doctors" className={styles.heroBtn}>
            Записаться на приём
          </Link>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div
            ref={valuesRef}
            className={`${styles.valuesGrid} ${valVisible ? styles.visible : ""}`}
          >
            {VALUES.map((v, i) => (
              <div key={i} className={styles.valueCard} style={{ "--i": i }}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map + Contacts */}
      <section className={styles.mapSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Как нас найти</h2>
          <div className={styles.mapGrid}>
            {/* Map */}
            <div className={styles.mapWrap}>
              <iframe
                src="https://yandex.ru/map-widget/v1/?um=constructor%3A6df61d1066108ba7de888fb905c55d7845d03493b3184fccc061177dea5927b2&amp;source=constructor"
                className={styles.map}
                title="Карта расположения клиники"
                frameBorder="0"
              />
            </div>

            {/* Contacts */}
            <div className={styles.contactsPanel}>
              {CONTACTS.map((c, i) => (
                <div key={i} className={styles.contactRow}>
                  <div className={styles.contactIcon}>{c.icon}</div>
                  <div className={styles.contactBody}>
                    <span className={styles.contactLabel}>{c.label}</span>
                    {c.href ? (
                      <a href={c.href} className={styles.contactValue}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                        {c.value}
                      </a>
                    ) : (
                      <span className={styles.contactValue}>{c.value}</span>
                    )}
                  </div>
                </div>
              ))}

              <Link href="/appointments" className={styles.ctaBtn}>
                Записаться онлайн
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
