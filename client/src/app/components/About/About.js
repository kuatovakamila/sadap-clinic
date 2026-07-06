"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./About.module.css";
import Image from "next/image";
import Link from "next/link";

const FACTS = [
  { text: "Более 10 лет на рынке медицинских услуг Актау", featured: false },
  { text: "Современное диагностическое оборудование", featured: false },
  { text: "20+ направлений: от терапии до хирургии", featured: true },
  { text: "Запись онлайн — без очередей", featured: false },
];

const About = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setVisible(entry.isIntersecting); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`${styles.section} ${visible ? styles.visible : ""}`} ref={ref}>
      <div className={styles.container}>
        <div className={styles.inner}>

          {/* Left — text */}
          <div className={styles.textCol}>
            <span className={styles.eyebrow}>О клинике</span>
            <h2 className={styles.title}>Медицинская помощь,<br/>которой можно доверять</h2>
            <p className={styles.description}>
              Предоставляем широкий спектр медицинских услуг для жителей
              Актау и области: точная диагностика, квалифицированные врачи
              и современное оборудование под одной крышей.
            </p>

            <ul className={styles.facts}>
              {FACTS.map((fact, i) => (
                <li
                  key={i}
                  className={`${styles.fact} ${fact.featured ? styles.factFeatured : ""}`}
                  style={{ animationDelay: `${0.1 + i * 0.22}s` }}
                >
                  <span
                    className={styles.check}
                    style={{ animationDelay: `${0.2 + i * 0.22}s` }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </span>
                  {fact.text}
                </li>
              ))}
            </ul>

            <Link href="/aboutUs" className={styles.btn}>
              Подробнее о клинике
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Right — photo */}
          <div className={styles.imageCol}>
            <Image
              src="/o-clinike.JPG"
              alt="О клинике Sadap"
              width={560}
              height={420}
              className={styles.image}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
