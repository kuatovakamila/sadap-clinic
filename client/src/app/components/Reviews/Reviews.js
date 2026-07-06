"use client";
import { useState, useEffect } from "react";
import styles from "./Reviews.module.css";
import Image from "next/image";
import Link from "next/link";

const REVIEWS = [
  {
    name: "Арнау Жупарбеков",
    text: "Отличная клиника! Пришёл по рекомендациям друзей — не жалею. Высокое качество обслуживания, их методика лечения отличается от других.",
    avatar: "/arnau.png",
    rating: 5,
    platform: "Google",
  },
  {
    name: "Кайсар Калибаев",
    text: "Самое лучшее место для медицинского обслуживания в Актау. Очень удобное расположение, посещаю после работы. Персонал профессиональный, врачи опытные.",
    avatar: "/kaysar.png",
    rating: 5,
    platform: "2ГИС",
  },
];

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TwoGisIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#00C160"/>
    <text x="12" y="16" textAnchor="middle" fill="#fff"
      fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">2ГИС</text>
  </svg>
);

const PLATFORM_ICONS = { Google: <GoogleIcon />, "2ГИС": <TwoGisIcon /> };

const Stars = ({ count, animKey }) => (
  <div className={styles.stars} key={animKey}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="15" height="15" viewBox="0 0 24 24"
        fill={i < count ? "#f59e0b" : "none"}
        stroke={i < count ? "#f59e0b" : "rgba(255,255,255,0.25)"}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={styles.star}
        style={{ animationDelay: `${i * 70}ms` }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

const VIDEO_ID = "4dtV3iF4MPg";

const Reviews = () => {
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (paused || REVIEWS.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % REVIEWS.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const r = REVIEWS[active];

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.title}>Отзывы пациентов</h2>
            <p className={styles.subtitle}>Реальные истории — без редактуры</p>
          </div>
          <Link href="/reviews" className={styles.allLink}>
            Все отзывы
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Content */}
        <div className={styles.content}>

          {/* Video */}
          <div className={styles.videoWrap}>
            {playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                title="Отзыв о клинике"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.iframe}
              />
            ) : (
              <button className={styles.preview} onClick={() => setPlaying(true)} aria-label="Смотреть видео">
                <Image
                  src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                  alt="Видео-отзыв о клинике Sadap"
                  fill
                  className={styles.thumbnail}
                />
                <div className={styles.overlay} />
                <span className={styles.badge}>Видео-отзыв</span>
                <div className={styles.playWrap}>
                  <span className={styles.pulseRing} />
                  <span className={styles.pulseRing} style={{ animationDelay: "0.6s" }} />
                  <span className={styles.playBtn}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </span>
                </div>
                <p className={styles.playLabel}>Смотреть отзыв</p>
              </button>
            )}
          </div>

          {/* Carousel */}
          <div className={styles.carousel}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}>

            {/* Card */}
            <div key={active} className={styles.card}>

              {/* Decorative quote */}
              <span className={styles.quoteDecor}>"</span>

              <p className={styles.text}>{r.text}</p>

              {/* Author */}
              <div className={styles.author}>
                <div className={styles.avatarWrap}>
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    width={48}
                    height={48}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.nameRow}>
                    <p className={styles.name}>{r.name}</p>
                    {PLATFORM_ICONS[r.platform] && (
                      <span className={styles.platformBadge} title={r.platform}>
                        {PLATFORM_ICONS[r.platform]}
                        <span>{r.platform}</span>
                      </span>
                    )}
                  </div>
                  <Stars count={r.rating} animKey={active} />
                </div>
              </div>
            </div>

            {/* Dots + arrows */}
            <div className={styles.controls}>
              <button
                className={styles.navBtn}
                onClick={() => setActive((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
                aria-label="Предыдущий отзыв"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18L9 12L15 6"/>
                </svg>
              </button>

              <div className={styles.dots}>
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                    onClick={() => setActive(i)}
                    aria-label={`Отзыв ${i + 1}`}
                  />
                ))}
              </div>

              <button
                className={styles.navBtn}
                onClick={() => setActive((i) => (i + 1) % REVIEWS.length)}
                aria-label="Следующий отзыв"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18L15 12L9 6"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
