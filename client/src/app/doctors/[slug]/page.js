"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import RussianDatePicker from "../../components/RussianDatePicker/RussianDatePicker";

// Данные врачей
const doctorsDatabase = {
  "zhunisova-perizat": {
    name: "Жунисова Перизат Мухитдиновна",
    position: "Врач акушер-гинеколог",
    specialties: ["Гинеколог", "Акушер"],
    experience: "15+ лет опыта",
    education: "Западно-Казахстанский медицинский университет имени Марата Оспанова, 2008 год",
    avatar: "/doctor-female.jpg",
    rating: 5,
    workingHours: "Пн-Пт: 9:00 - 18:00, Сб: 9:00 - 14:00",
    directions: [
      "Ведение беременности",
      "Диагностика и лечение гинекологических заболеваний",
      "УЗИ органов малого таза",
      "Консультации по планированию семьи"
    ],
    treatmentTags: [
      "Воспаление половых органов",
      "Нарушение менструального цикла",
      "Эндометриоз",
      "Миома матки",
      "Инфекции",
      "Бесплодие"
    ],
    certificates: [
      "/certificate1.png",
      "/certificate2.png",
      "/certificate3.png"
    ]
  },
  "yulamanova-zarina": {
    name: "Юламанова Зарина Евгеньевна",
    position: "Врач педиатр",
    specialties: ["Педиатр"],
    experience: "10+ лет опыта",
    education: "Актюбинский государственный медицинский университет, 2013 год",
    avatar: "/doctor-female.jpg",
    rating: 5,
    workingHours: "Пн-Пт: 8:00 - 17:00, Сб: 9:00 - 13:00",
    directions: [
      "Диагностика и лечение детских заболеваний",
      "Вакцинация детей",
      "Профилактические осмотры",
      "Консультации по развитию ребенка"
    ],
    treatmentTags: [
      "ОРВИ и грипп",
      "Аллергия у детей",
      "Бронхит",
      "Гастрит",
      "Дерматит",
      "Отставание в развитии"
    ],
    certificates: [
      "/certificate1.png",
      "/certificate2.png"
    ]
  }
};

const reviewsData = [
  {
    name: "Арнау Жупарбеков",
    text: "Отличная клиника!!! Пришел по рекомендациям друзей и знакомых, не жалею, высокое качество обслуживания! Их методика лечения отличается от других!",
    avatar: "/arnau.png",
    rating: 5
  },
  {
    name: "Кайсар Калибаев",
    text: "Я доволен! Самое лучшее место для медицинского обслуживания в Актау!!! Очень удобное расположение, посещаю после работы, персонал профессиональный, врачи опытные!!! СПАСИБО!",
    avatar: "/kaysar.png",
    rating: 5
  }
];

const DoctorDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  
  const doctorData = doctorsDatabase[params.slug];

  // Проверка авторизации
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Если врач не найден, перенаправляем на список врачей
  useEffect(() => {
    if (!doctorData) {
      router.push("/doctors");
    }
  }, [doctorData, router]);

  // Закрытие попапа по ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedCertificate(null);
        setShowAppointmentModal(false);
      }
    };

    if (selectedCertificate || showAppointmentModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [selectedCertificate, showAppointmentModal]);

  const openCertificate = (certSrc) => {
    setSelectedCertificate(certSrc);
  };

  const handleAppointmentClick = () => {
    // Проверка авторизации
    if (!isAuthenticated) {
      alert("Сперва войдите в личный кабинет");
      router.push("/auth");
      return;
    }
    
    setShowAppointmentModal(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !currentUser) {
      alert("Сперва войдите в личный кабинет");
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const appointmentData = {
        userId: currentUser.id,
        doctorSlug: params.slug,
        doctorName: doctorData.name,
        patientName: formData.get("name"),
        patientPhone: formData.get("phone"),
        appointmentDate: formData.get("date"),
        appointmentTime: formData.get("time"),
        reason: formData.get("reason") || ""
      };

      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Заявка на запись успешно отправлена!");
        setShowAppointmentModal(false);
        e.target.reset();
      } else {
        alert(result.error || "Ошибка при создании записи");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Произошла ошибка. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCertificate = () => {
    setSelectedCertificate(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeCertificate();
    }
  };

  if (!doctorData) {
    return null;
  }

  return (
    <div className={styles.pageWrapper} style={{minHeight: '100vh', background: '#f8f9fa'}}>
      <Header 
        navItems={["Записаться на прием", "Выбрать врача", "О клинике", "Личный кабинет"]}
        showAccountButton={false}
        fixed={true}
      />

      {/* Main Content */}
      <main className={styles.main} style={{padding: '200px 0 80px', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <div className={styles.container} style={{maxWidth: '1200px', margin: '0 auto', padding: '0 40px'}}>
          {/* Page Title */}
          <h1 className={styles.pageTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '36px', lineHeight: '1.2em', letterSpacing: '0.05em', color: '#0b3364', textAlign: 'center', margin: '0 0 30px 0'}}>Подробнее о враче</h1>

          {/* Doctor Info Card */}
          <div className={styles.doctorCard} style={{background: '#ffffff', borderRadius: '16px', padding: '50px 60px', marginBottom: '60px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'}}>
            <div className={styles.doctorMainInfo} style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', alignItems: 'start'}}>
              <div className={styles.doctorLeftSection} style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start'}}>
                <div className={styles.doctorAvatar} style={{width: '120px', height: '135px', borderRadius: '12px', overflow: 'hidden', background: '#e6e4e5', flexShrink: '0'}}>
                  <Image
                    src={doctorData.avatar}
                    alt={doctorData.name}
                    width={129}
                    height={145}
                    className={styles.avatarImage}
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                </div>

                <div className={styles.doctorDetails} style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'flex-start'}}>
                  <h2 className={styles.doctorName} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '24px', lineHeight: '1.3em', color: '#0c3465', margin: '0'}}>{doctorData.name}</h2>
                  <p className={styles.doctorPosition} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '18px', lineHeight: '1.3em', letterSpacing: '0.05em', color: '#000000', margin: '0'}}>{doctorData.position}</p>

                  <div className={styles.doctorRating} style={{display: 'flex', gap: '2px', marginTop: '4px'}}>
                    {[...Array(doctorData.rating)].map((_, i) => (
                      <span key={i} className={styles.star} style={{color: '#ffa800', fontSize: '16px'}}>★</span>
                    ))}
                  </div>

                  <button className={styles.appointmentButton} onClick={handleAppointmentClick}>
                    <span className={styles.appointmentText}>Записаться на прием</span>
                  </button>
                </div>
              </div>

              <div className={styles.doctorAdditionalInfo} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div className={styles.infoBlock} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <h3 className={styles.infoTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '16px', lineHeight: '1.3em', letterSpacing: '0.05em', color: '#0c3465', margin: '0'}}>Образование</h3>
                  <p className={styles.infoText} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '14px', lineHeight: '1.4em', letterSpacing: '0.05em', color: '#000000', margin: '0'}}>{doctorData.education}</p>
                </div>

                <div className={styles.infoBlock} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <h3 className={styles.infoTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '16px', lineHeight: '1.3em', letterSpacing: '0.05em', color: '#0c3465', margin: '0'}}>Стаж</h3>
                  <p className={styles.infoText} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '14px', lineHeight: '1.4em', letterSpacing: '0.05em', color: '#000000', margin: '0'}}>{doctorData.experience}</p>
                </div>

                <div className={styles.infoBlock} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <h3 className={styles.infoTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '16px', lineHeight: '1.3em', letterSpacing: '0.05em', color: '#0c3465', margin: '0'}}>Время приема</h3>
                  <p className={styles.infoText} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '14px', lineHeight: '1.4em', letterSpacing: '0.05em', color: '#000000', margin: '0'}}>{doctorData.workingHours}</p>
                </div>

                <div className={styles.infoBlock} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <h3 className={styles.infoTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '16px', lineHeight: '1.3em', letterSpacing: '0.05em', color: '#0c3465', margin: '0'}}>Направления</h3>
                  <ul className={styles.directionsList} style={{listStyle: 'none', padding: '0', margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px'}}>
                    {doctorData.directions.map((direction, index) => (
                      <li key={index} className={styles.directionItem} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '14px', lineHeight: '1.4em', color: '#000000', paddingLeft: '15px', position: 'relative'}}>{direction}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.infoBlock}>
                  <h3 className={styles.infoTitle}>Специализация по заболеваниям</h3>
                  <div className={styles.tagsWrapper}>
                    {doctorData.treatmentTags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.infoBlock} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <h3 className={styles.infoTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '16px', lineHeight: '1.3em', letterSpacing: '0.05em', color: '#0c3465', margin: '0'}}>Сертификаты и лицензии</h3>
                  <div className={styles.certificatesGrid} style={{display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap'}}>
                    {doctorData.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className={styles.certificateItem}
                        onClick={() => openCertificate(cert)}
                        style={{width: '100px', height: '140px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}
                      >
                        <Image
                          src={cert}
                          alt={`Сертификат ${index + 1}`}
                          width={100}
                          height={140}
                          className={styles.certificateImage}
                          style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                      </div>
                    ))}
                  </div>
                  <p className={styles.certificateNote} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '12px', lineHeight: '1.219em', letterSpacing: '0.05em', color: '#989898', margin: '8px 0 0 0'}}>
                    Нажмите на сертификат чтобы увидеть подробнее
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className={styles.reviewsCard} style={{background: '#ffffff', borderRadius: '16px', padding: '50px 60px', marginTop: '50px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'}}>
            <h2 className={styles.reviewsTitle} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '700', fontSize: '28px', lineHeight: '1.2em', letterSpacing: '0.05em', color: '#0b3364', textAlign: 'center', margin: '0 0 40px 0'}}>Отзывы</h2>

            <div className={styles.reviewsContent} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'start'}}>
              <div className={styles.videoContainer} style={{width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden'}}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/4dtV3iF4MPg"
                  title="Отзыв о клинике"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.videoIframe}
                  style={{width: '100%', height: '100%', border: 'none'}}
                ></iframe>
              </div>

              <div className={styles.reviewsGrid} style={{display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '300px', overflowY: 'auto'}}>
                {reviewsData.map((review, index) => (
                  <div key={index} className={styles.reviewItem} style={{background: '#f8f9fa', borderRadius: '12px', padding: '20px 24px'}}>
                    <div className={styles.reviewHeader} style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px'}}>
                      <div className={styles.reviewAvatar} style={{width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', flexShrink: '0'}}>
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={50}
                          height={50}
                          className={styles.reviewAvatarImage}
                          style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                      </div>
                      <div className={styles.reviewInfo} style={{flex: '1'}}>
                        <h3 className={styles.reviewName} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '600', fontSize: '16px', lineHeight: '1.2em', color: '#0c3465', margin: '0 0 4px 0'}}>{review.name}</h3>
                        <div className={styles.reviewRating} style={{display: 'flex', gap: '2px'}}>
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className={styles.reviewStar} style={{color: '#ffa800', fontSize: '14px'}}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className={styles.reviewText} style={{fontFamily: 'var(--font-montserrat), sans-serif', fontWeight: '400', fontSize: '14px', lineHeight: '1.4em', color: '#666666', margin: '0'}}>"{review.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className={styles.scrollbarContainer}>
              <div className={styles.scrollbar}></div>
            </div> */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Certificate Popup */}
      {selectedCertificate && (
        <div
          className={styles.popupOverlay}
          onClick={handleBackdropClick}
        >
          <div className={styles.popupContent}>
            <button
              className={styles.popupClose}
              onClick={closeCertificate}
              aria-label="Закрыть"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={styles.popupImageContainer}>
              <Image
                src={selectedCertificate}
                alt="Сертификат"
                width={800}
                height={1200}
                className={styles.popupImage}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно записи на прием */}
      {showAppointmentModal && (
        <div className={styles.modal} onClick={() => setShowAppointmentModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAppointmentModal(false)}>×</button>
            <h2 className={styles.modalTitle}>Записаться на прием</h2>
            <p className={styles.modalDoctor}>Врач: {doctorData.name}</p>
            <form onSubmit={handleAppointmentSubmit} className={styles.appointmentForm}>
              <input 
                type="text" 
                name="name"
                placeholder="Ваше ФИО" 
                className={styles.formInput} 
                required 
                disabled={isSubmitting}
              />
              <input 
                type="tel" 
                name="phone"
                placeholder="Телефон" 
                className={styles.formInput} 
                required 
                disabled={isSubmitting}
              />
              <RussianDatePicker 
                name="date"
                value={appointmentDate}
                onChange={setAppointmentDate}
                disabled={isSubmitting}
                required
              />
              <select 
                name="time"
                className={styles.formInput} 
                required
                disabled={isSubmitting}
              >
                <option value="">Выберите время</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
              <textarea 
                name="reason"
                placeholder="Причина обращения (необязательно)" 
                className={styles.formTextarea}
                disabled={isSubmitting}
              ></textarea>
              <button 
                type="submit" 
                className={styles.formSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Записаться"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetailPage;
