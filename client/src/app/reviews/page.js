"use client";
import { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";
import Image from "next/image";

const ReviewsPage = () => {
  const [currentPartnerSlide, setCurrentPartnerSlide] = useState(0);

  // Массив партнеров - можно добавить больше
  const partnersSlides = [
    [
      { id: 1, placeholder: true },
      { id: 2, placeholder: true },
      { id: 3, placeholder: true },
    ],
    [
      { id: 4, placeholder: true },
      { id: 5, placeholder: true },
      { id: 6, placeholder: true },
    ],
    [
      { id: 7, placeholder: true },
      { id: 8, placeholder: true },
      { id: 9, placeholder: true },
    ],
  ];

  const totalPartnerSlides = partnersSlides.length;

  const nextPartnerSlide = () => {
    setCurrentPartnerSlide((prev) => (prev + 1) % totalPartnerSlides);
  };

  const prevPartnerSlide = () => {
    setCurrentPartnerSlide((prev) => (prev - 1 + totalPartnerSlides) % totalPartnerSlides);
  };

  const goToPartnerSlide = (index) => {
    setCurrentPartnerSlide(index);
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>О клинике</h1>
              <p className={styles.heroDescription}>
                <b>Наша Миссия</b> - Предоставлять широкий спектр медицинских услуг для жителей Актау и области,
                обеспечивая качественное лечение через точную диагностику, высококвалифицированных врачей
                и современное оборудование
              </p>
            </div>

            <button className={styles.heroButton}>
              <span className={styles.buttonCircle}></span>
              <span className={styles.buttonText}>Записаться на прием</span>
            </button>
          </div>

          <div className={styles.heroImageWrapper}>
            <Image
              src="/reviews-hero.png"
              alt="Medical illustration"
              width={626}
              height={417}
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className={styles.philosophySection}>
        <div className={styles.philosophyContainer}>
          <h2 className={styles.philosophyTitle}>Философия сервиса</h2>
          <p className={styles.philosophySubtitle}>Мы слушаем, объясняем и поддерживаем.</p>
        </div>
      </section>

      {/* Team and Interior Section */}
      <section className={styles.teamSection}>
        <div className={styles.teamContainer}>
          <h2 className={styles.teamTitle}>Наша команда и интерьер</h2>

          <div className={styles.teamGallery}>
            <div className={styles.teamCard}>
              <Image
                src="/druzhnaya-comanda.JPG"
                alt="Дружная команда"
                width={544}
                height={384}
                className={styles.teamImage}
              />
              <div className={styles.teamCardOverlay}>
                <h3 className={styles.teamCardTitle}>Дружная команда</h3>
              </div>
            </div>

            <div className={styles.teamCard}>
              <Image
                src="/privetstvuyshii_personal.JPG"
                alt="Приветствующий персонал"
                width={481}
                height={384}
                className={styles.teamImage}
              />
              <div className={styles.teamCardOverlay}>
                <h3 className={styles.teamCardTitle}>Приветствующий персонал</h3>
              </div>
            </div>
          </div>

          {/* <div className={styles.pagination}>
            <span className={styles.paginationDot}></span>
            <span className={styles.paginationDot}></span>
            <span className={styles.paginationDot}></span>
          </div> */}
        </div>
      </section>

      {/* Certificates Section */}
      <section className={styles.certificatesSection}>
        <div className={styles.certificatesContainer}>
          <div className={styles.certificatesImage}>
            <Image
              src="/blank.png"
              alt="Сертификаты"
              width={624}
              height={457}
              className={styles.certificatesImg}
            />
          </div>

          <div className={styles.certificatesContent}>
            <h2 className={styles.certificatesTitle}>Сертификаты и лицензии</h2>
            <div className={styles.certificatesText}>
              <p>
                Клиника работает в соответствии с законодательством Республики Казахстан и имеет действующую
                лицензию Министерства здравоохранения РК на оказание медицинских услуг.
              </p>
              <p>
                Все врачи обладают сертификатами специалиста, подтверждающими их квалификацию и право на
                медицинскую практику.
              </p>
              <p>
                Оборудование клиники сертифицировано и зарегистрировано в соответствии с техническими
                регламентами и стандартами безопасности Республики Казахстан.
              </p>
            </div>
          </div>

          {/* <div className={styles.pagination}>
            <span className={styles.paginationDot}></span>
            <span className={styles.paginationDot}></span>
            <span className={styles.paginationDot}></span>
          </div> */}
        </div>
      </section>

      {/* Partners Section */}
      <section className={styles.partnersSection}>
        <div className={styles.partnersContainer}>
          <h2 className={styles.partnersTitle}>Партнеры и страховые компании</h2>

          <div className={styles.sliderWrapper}>
            <button
              className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
              onClick={prevPartnerSlide}
              aria-label="Предыдущий слайд"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className={styles.partnersGrid}>
              {partnersSlides[currentPartnerSlide].map((partner) => (
                <div key={partner.id} className={styles.partnerCard}>
                  <Image
                    src="/blank.png"
                    alt={`Партнер ${partner.id}`}
                    width={379}
                    height={370}
                    className={styles.partnerImage}
                  />
                </div>
              ))}
            </div>

            <button
              className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
              onClick={nextPartnerSlide}
              aria-label="Следующий слайд"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className={styles.pagination}>
            {[...Array(totalPartnerSlides)].map((_, index) => (
              <button
                key={index}
                className={`${styles.paginationDot} ${index === currentPartnerSlide ? styles.paginationDotActive : ''}`}
                onClick={() => goToPartnerSlide(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReviewsPage;

