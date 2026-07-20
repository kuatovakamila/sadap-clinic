"use client";
import Image from "next/image";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const GIS_URL = "https://2gis.kz/aktau/firm/70000001110769454/tab/reviews";

const getInitials = (name) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// Real reviews copied verbatim from 2GIS — no star rating shown since 2GIS
// doesn't expose a per-review numeric rating on the page, only an aggregate.
const GIS_REVIEWS = [
  {
    name: "Каракат Сейполда",
    text: "Очень грамотный и внимательный аллерголог. Светлана Адиловна всё подробно объясняет, назначает лечение по делу и с заботой относится к пациентам. Осталась довольна приёмом",
    tag: "Аллергология",
  },
  {
    name: "Асемгуль Тельманова",
    text: "Врач Перизат Мухитдинова отличный врач! Внимательный, профессиональный и действительно заинтересованный в здоровье пациента. Всё объясняет понятно, лечение помогает, чувствуется опыт и забота. Рекомендую.",
    tag: "Гинекология",
  },
  {
    name: "Асем Жекенова",
    text: "Была в этой клинике, остались только хорошие впечатления. Вежливый персонал, всё объясняют спокойно и понятно. Приняли вовремя, чисто и аккуратно. Спасибо за внимательное отношение, при необходимости обязательно обращусь снова",
    tag: "Приём",
  },
  {
    name: "Чехов Терменатор",
    text: "Сервис на высшем уровне",
    tag: "Сервис",
  },
];

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
          <div className={styles.heroText}>
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
          <div className={styles.heroImageWrap}>
            <Image src="/doctor-welcome.JPG" alt="Врач клиники SADAP" width={420} height={520}
              className={styles.heroImage} priority />
          </div>
        </div>
      </section>

      {/* Video + reviews */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* 2GIS reviews */}
          <div className={styles.gisSectionHead}>
            <h2 className={styles.sectionTitle}>Отзывы с 2ГИС</h2>
            <a href={GIS_URL} target="_blank" rel="noopener noreferrer" className={styles.gisAllLink}>
              <span className={styles.gisLogo}>2ГИС</span>
              Смотреть все отзывы →
            </a>
          </div>
          <div className={styles.grid}>
            {GIS_REVIEWS.map((r, i) => (
              <a key={i} href={GIS_URL} target="_blank" rel="noopener noreferrer" className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    <span className={styles.avatarInitials}>{getInitials(r.name)}</span>
                  </div>
                  <div>
                    <p className={styles.name}>{r.name}</p>
                    <span className={styles.gisBadge}>2ГИС</span>
                  </div>
                  <span className={styles.tag}>{r.tag}</span>
                </div>
                <p className={styles.text}>"{r.text}"</p>
              </a>
            ))}
          </div>

          {/* Review cards */}
          <h2 className={styles.sectionTitle}>Отзывы на сайте</h2>
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
              <a href="https://2gis.kz/aktau/firm/70000001110769454/tab/reviews" target="_blank" rel="noopener noreferrer"
                className={styles.ctaBtn}>
                2ГИС
              </a>
              <a href="https://instagram.com/sadap_clinic" target="_blank" rel="noopener noreferrer"
                className={`${styles.ctaBtn} ${styles.ctaBtnOutline}`}>
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
