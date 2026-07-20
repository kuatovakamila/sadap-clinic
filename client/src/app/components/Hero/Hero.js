"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

const SLIDES = [
  {
    src: "/privetstvuyshii_personal.JPG",
    caption: "Приветливый персонал",
    sub: "Заботимся о каждом пациенте",
  },
  {
    src: "/druzhnaya-comanda.JPG",
    caption: "Дружная команда",
    sub: "Профессионалы своего дела",
  },
  {
    src: "/doctor-welcome.JPG",
    caption: "Врачи высшей категории",
    sub: "Опыт более 10 лет",
  },
];

const INTERVAL = 4000;

const Hero = () => {
  const [current, setCurrent]   = useState(0);
  const [prev, setPrev]         = useState(null);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  const goTo = (idx, fromAuto = false) => {
    if (animating || idx === current) return;
    setPrev(current);
    setAnimating(true);
    setCurrent(idx);
    setProgress(0);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 600);
  };

  const startProgress = () => {
    clearInterval(progressRef.current);
    setProgress(0);
    const step = 100 / (INTERVAL / 50);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + step;
      });
    }, 50);
  };

  useEffect(() => {
    startProgress();
    intervalRef.current = setInterval(() => {
      setPrev(c => c);
      setCurrent(c => {
        const next = (c + 1) % SLIDES.length;
        setPrev(c);
        setAnimating(true);
        setTimeout(() => {
          setPrev(null);
          setAnimating(false);
        }, 600);
        return next;
      });
      setProgress(0);
      startProgress();
    }, INTERVAL);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressRef.current);
    };
  }, []);

  const handleDot = (i) => {
    clearInterval(intervalRef.current);
    clearInterval(progressRef.current);
    goTo(i);
    startProgress();
    intervalRef.current = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % SLIDES.length;
        setPrev(c);
        setAnimating(true);
        setTimeout(() => { setPrev(null); setAnimating(false); }, 600);
        return next;
      });
      setProgress(0);
      startProgress();
    }, INTERVAL);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>

        {/* Left — text */}
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>Клиника №1 в Актау</span>

          <h1 className={styles.heroTitle}>
            Медицинская помощь,<br />которой можно доверять
          </h1>

          <p className={styles.heroSubtitle}>
            Более 20 направлений под одной крышей — от терапии до узкой специализации
          </p>

          <Link href="/doctors" className={styles.heroButton}>
            Записаться на приём
          </Link>
        </div>

        {/* Right — carousel */}
        <div className={styles.carouselWrapper}>
          <div className={styles.carouselTrack}>

            {/* Previous slide (slides out left) */}
            {prev !== null && (
              <div className={`${styles.carouselSlide} ${styles.slideOut}`}>
                <Image
                  src={SLIDES[prev].src}
                  alt={SLIDES[prev].caption}
                  fill
                  className={styles.carouselImage}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            )}

            {/* Current slide (slides in from right) */}
            <div className={`${styles.carouselSlide} ${animating ? styles.slideIn : styles.slideVisible}`}>
              <Image
                src={SLIDES[current].src}
                alt={SLIDES[current].caption}
                fill
                className={styles.carouselImage}
                priority={current === 0}
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {/* Gradient overlay + caption */}
              <div className={styles.slideOverlay}>
                <div className={styles.slideCaption}>
                  <span className={styles.slideCaptionMain}>{SLIDES[current].caption}</span>
                  <span className={styles.slideCaptionSub}>{SLIDES[current].sub}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Progress bars */}
          <div className={styles.carouselBars}>
            {SLIDES.map((_, i) => (
              <button key={i} className={styles.barBtn} onClick={() => handleDot(i)} aria-label={`Слайд ${i + 1}`}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: i === current ? `${progress}%` : i < current ? "100%" : "0%" }}
                  />
                </div>
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
