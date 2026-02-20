"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const ServicePage = () => {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        
        // Временные тестовые данные (пока таблица не создана)
        const mockServices = {
          'pediatriya': {
            title: 'Педиатрия',
            description: 'Комплексная медицинская помощь детям от рождения до 18 лет.',
            image_url: '/pediatry-new.JPG',
            specialization: 'Педиатр',
            equipment: [
              {
                title: 'УЗИ аппарат последнего поколения',
                description: 'Современное ультразвуковое оборудование для точной диагностики',
                image_url: '/uzi-apparat.JPG'
              },
              {
                title: 'Цифровой рентген-аппарат',
                description: 'Современный цифровой рентген для быстрой и точной диагностики',
                image_url: '/apparat.JPG'
              }
            ]
          },
          'ginekologiya': {
            title: 'Гинекология',
            description: 'Полный спектр гинекологических услуг и диагностики.',
            image_url: '/ginekology.jpg',
            specialization: 'Гинеколог',
            equipment: [
              {
                title: 'Кольпоскоп',
                description: 'Современный кольпоскоп для точной диагностики',
                image_url: '/kolkoscop.png'
              }
            ]
          },
          'terapiya': {
            title: 'Терапевт',
            description: 'Диагностика и лечение заболеваний внутренних органов.',
            image_url: '/therapist.jpg',
            specialization: 'Терапевт',
            equipment: [
              {
                title: 'Стетоскоп и медицинское оборудование',
                description: 'Профессиональное диагностическое оборудование для комплексного обследования',
                image_url: '/stetoscope.png'
              }
            ]
          },
          'ortopediya': {
            title: 'Ортопедия',
            description: 'Лечение заболеваний опорно-двигательного аппарата.',
            image_url: '/young-woman-sportswear-practicing-exercise-physiotherapy-session.jpg',
            specialization: 'Ортопед',
            equipment: []
          },
          'dermatologiya': {
            title: 'Дерматология',
            description: 'Диагностика и лечение заболеваний кожи.',
            image_url: '/female-doctor-diagnosing-melanoma-body-female-patient.jpg',
            specialization: 'Дерматолог',
            equipment: []
          },
          'urologiya': {
            title: 'Урология',
            description: 'Лечение заболеваний мочеполовой системы.',
            image_url: '/listening-doctor.jpg',
            specialization: 'Уролог',
            equipment: []
          },
          'endokrinologiya': {
            title: 'Эндокринология',
            description: 'Лечение гормональных нарушений.',
            image_url: '/doctor-performing-routine-medical-checkup.jpg',
            specialization: 'Эндокринолог',
            equipment: []
          }
        };

        const mockService = mockServices[params.slug];
        
        if (mockService) {
          setService(mockService);
          setEquipment(mockService.equipment || []);
          
          // Fetch doctors for this service
          if (mockService.specialization) {
            const doctorsResponse = await fetch(`/api/doctors?specialization=${mockService.specialization}`);
            const doctorsResult = await doctorsResponse.json();
            if (doctorsResult.success) {
              setDoctors(doctorsResult.doctors || []);
            }
          }
        }
      } catch (error) {
        console.error("Error loading service:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchServiceData();
    }
  }, [params.slug]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % equipment.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + equipment.length) % equipment.length);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.errorContainer}>
        <p>Услуга не найдена</p>
        <Link href="/services">Вернуться к услугам</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header showAccountButton={true} fixed={true} />

      <main className={styles.main}>
        {/* Intro Block */}
        <section className={styles.introSection}>
          <div className={styles.container}>
            <div className={styles.introContent}>
              <h1 className={styles.pageTitle}>{service.title}</h1>
              <p className={styles.introDescription}>{service.description}</p>
              <Link href="/appointments/book" className={styles.ctaButton}>
                <span className={styles.ctaButtonText}>Записаться на прием</span>
              </Link>
            </div>
            <div className={styles.introImage}>
              <Image
                src={service.image_url && service.image_url !== "" ? service.image_url : "/blank.png"}
                alt={service.title}
                width={500}
                height={400}
                className={styles.serviceImage}
              />
            </div>
          </div>
        </section>

        {/* Equipment Block */}
        {equipment.length > 0 && (
          <section className={styles.equipmentSection}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}>Оборудование</h2>
              <div className={styles.sliderWrapper}>
                <button 
                  className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
                  onClick={prevSlide}
                  aria-label="Previous"
                >
                  ‹
                </button>
                
                <div className={styles.slider}>
                  <div className={styles.slide}>
                    <div className={styles.equipmentImage}>
                      <Image
                        src={equipment[currentSlide]?.image_url && equipment[currentSlide]?.image_url !== "" ? equipment[currentSlide].image_url : "/blank.png"}
                        alt={equipment[currentSlide]?.title || "Оборудование"}
                        width={800}
                        height={500}
                        className={styles.equipmentImg}
                      />
                    </div>
                    <div className={styles.equipmentInfo}>
                      <h3 className={styles.equipmentTitle}>{equipment[currentSlide].title}</h3>
                      <p className={styles.equipmentDescription}>{equipment[currentSlide].description}</p>
                    </div>
                  </div>
                </div>

                <button 
                  className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
                  onClick={nextSlide}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>

              <div className={styles.sliderDots}>
                {equipment.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Doctors Block */}
        {doctors.length > 0 && (
          <section className={styles.doctorsSection}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}>Наши специалисты</h2>
              <div className={styles.doctorsGrid}>
                {doctors.map((doctor) => (
                  <div key={doctor.id} className={styles.doctorCard}>
                    <div className={styles.doctorAvatar}>
                      <Image
                        src={doctor.avatar_url && doctor.avatar_url !== "" ? doctor.avatar_url : "/doctor-female.jpg"}
                        alt={doctor.full_name}
                        width={150}
                        height={180}
                        className={styles.doctorImage}
                      />
                    </div>
                    <h3 className={styles.doctorName}>{doctor.full_name}</h3>
                    <p className={styles.doctorSpecialization}>{doctor.specialization_title}</p>
                    <p className={styles.doctorExperience}>Опыт: {doctor.experience_years || "—"} лет</p>
                    <Link 
                      href={`/doctors/${doctor.slug}`}
                      className={styles.doctorButton}
                    >
                      Записаться к врачу
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Location Block */}
        <section className={styles.locationSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Расположение клиники</h2>
            <div className={styles.mapWrapper}>
              <iframe
                src="https://yandex.kz/map-widget/v1/?ll=51.160904%2C43.655871&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1MzAxMzI4ORJu0prQsNC30LDSm9GB0YLQsNC9LCDQkNC60YLQsNGDLCAxMSDQsNGD0LTQsNC9LCDRk9GW0LnQutC1INGa0Y7QudC10YDQuCDQvtGA0YLQsNC70YvSk9GLINC60LXSo9C10YIg0L7RgNGC0LDQu9GL0pPRiyIKDb6-6EEVRwJvQg%2C%2C&z=17"
                width="100%"
                height="400"
                frameBorder="0"
                className={styles.map}
                title="Яндекс карта"
              />
            </div>
            <div className={styles.locationInfo}>
              <div className={styles.locationItem}>
                <strong>Адрес:</strong> г. Актау, микрорайон 11А, 3
              </div>
              <div className={styles.locationItem}>
                <strong>Телефон:</strong> +7 702 301 2796
              </div>
              <div className={styles.locationItem}>
                <strong>Часы работы:</strong> Пн-Пт: 8:00 - 20:00, Сб: 9:00 - 18:00
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicePage;
