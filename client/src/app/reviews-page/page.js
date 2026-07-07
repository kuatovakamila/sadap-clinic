"use client";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const getInitials = (name) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const REVIEWS = [
  {
    name: "Арнау Жупарбеков",
    text: "Отличная клиника! Пришел по рекомендациям друзей и знакомых, не жалею — высокое качество обслуживания! Методика лечения отличается от других!",
    rating: 5,
    date: "Март 2025",
    tag: "Педиатрия",
  },
  {
    name: "Кайсар Калибаев",
    text: "Я доволен! Самое лучшее место для медицинского обслуживания в Актау! Очень удобное расположение, персонал профессиональный, врачи опытные!",
    rating: 5,
    date: "Февраль 2025",
    tag: "Терапия",
  },
  {
    name: "Айгерим Сатова",
    text: "Была на приёме у гинеколога. Очень внимательный и профессиональный врач, всё объяснила понятно. Чистота и порядок в клинике на высшем уровне.",
    rating: 5,
    date: "Январь 2025",
    tag: "Гинекология",
  },
  {
    name: "Дамир Уразов",
    text: "Записался к неврологу онлайн — очень удобно! Принял точно по времени, никаких очередей. Буду рекомендовать клинику всем знакомым.",
    rating: 5,
    date: "Апрель 2025",
    tag: "Неврология",
  },
];

const STATS = [
  { num: "500+", label: "Довольных пациентов" },
  { num: "4.9",  label: "Средняя оценка" },
  { num: "5",    label: "Лет работы" },
];

export default function ReviewsPage() {
  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Отзывы пациентов</p>
          <h1 className={styles.heroTitle}>Что говорят о нас</h1>
          <p className={styles.heroSub}>
            Мнения наших пациентов — лучшая оценка нашей работы.
            Каждый отзыв помогает нам становиться лучше.
          </p>
          <div className={styles.heroStats}>
            {STATS.map((s, i) => (
              <div key={i} className={styles.heroStat}>
                <span className={styles.heroStatNum}>{s.num}</span>
                <span className={styles.heroStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video + reviews */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Review cards */}
          <h2 className={styles.sectionTitle}>Отзывы пациентов</h2>
          <div className={styles.grid}>
            {REVIEWS.map((r, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    <span className={styles.avatarInitials}>{getInitials(r.name)}</span>
                  </div>
                  <div>
                    <p className={styles.name}>{r.name}</p>
                    <div className={styles.stars}>
                      {[...Array(r.rating)].map((_, j) => (
                        <span key={j} className={styles.star}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className={styles.tag}>{r.tag}</span>
                </div>
                <p className={styles.text}>"{r.text}"</p>
                <p className={styles.date}>{r.date}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            <div>
              <h2 className={styles.ctaTitle}>Хотите оставить отзыв?</h2>
              <p className={styles.ctaSub}>Напишите нам в Instagram или на email — мы будем рады вашему мнению</p>
            </div>
            <div className={styles.ctaBtns}>
              <a href="https://instagram.com/sadapclinic_kz" target="_blank" rel="noopener noreferrer"
                className={styles.ctaBtn}>
                Instagram
              </a>
              <a href="mailto:support@sadapclinic.kz" className={`${styles.ctaBtn} ${styles.ctaBtnOutline}`}>
                Email
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
