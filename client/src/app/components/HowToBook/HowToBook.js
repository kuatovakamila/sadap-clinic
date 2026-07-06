"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./HowToBook.module.css";
import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Оставьте заявку",
    description: "Нажмите «Записаться» и заполните короткую форму — имя и номер телефона.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "Выберите время",
    description: "Администратор перезвонит и подберёт удобный слот или выберите сами онлайн.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "Приходите к врачу",
    description: "Мы пришлём напоминание за день до визита. Врач уже будет ждать вас.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="M22 4L12 14.01l-3-3"/>
      </svg>
    ),
  },
];

const HowToBook = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h2 className={styles.title}>Как записаться на приём</h2>
          <p className={styles.subtitle}>Три простых шага — и вы у врача</p>
        </div>

        <div className={`${styles.steps} ${visible ? styles.visible : ""}`} ref={ref}>
          {STEPS.map((step, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.bgNum}>{step.num}</span>

              <div className={styles.stepTop}>
                <div className={styles.iconWrap}>{step.icon}</div>
                {i < STEPS.length - 1 && <div className={styles.connector} />}
              </div>

              <span className={styles.num}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/appointments/book" className={styles.btnPrimary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Записаться онлайн
          </Link>
          <a href="tel:+77023012796" className={styles.btnOutline}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +7 702 301 2796
          </a>
        </div>

      </div>
    </section>
  );
};

export default HowToBook;
