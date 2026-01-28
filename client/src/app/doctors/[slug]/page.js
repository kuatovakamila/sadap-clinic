"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import RussianDatePicker from "../../components/RussianDatePicker/RussianDatePicker";

// Хук для определения мобильного устройства
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
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
  const isMobile = useIsMobile();
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load doctor data from database
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/doctors/${params.slug}`);
        const result = await response.json();
        
        if (result.success && result.doctor) {
          setDoctorData(result.doctor);
        } else {
          router.push("/doctors");
        }
      } catch (error) {
        console.error("Error loading doctor:", error);
        router.push("/doctors");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchDoctor();
    }
  }, [params.slug, router]);

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
        doctorName: doctorData.full_name,
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!doctorData) {
    return null;
  }

  // Responsive styles
  const responsiveStyles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#f8f9fa'
    },
    main: {
      padding: isMobile ? '100px 0 40px' : '200px 0 80px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 15px' : '0 40px',
      width: '100%',
      boxSizing: 'border-box'
    },
    pageTitle: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '700',
      fontSize: isMobile ? '24px' : '36px',
      lineHeight: '1.2em',
      letterSpacing: '0.05em',
      color: '#0b3364',
      textAlign: 'center',
      margin: isMobile ? '0 0 20px 0' : '0 0 30px 0'
    },
    doctorCard: {
      background: '#ffffff',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '20px' : '50px 60px',
      marginBottom: isMobile ? '30px' : '60px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    doctorMainInfo: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
      gap: isMobile ? '20px' : '40px',
      alignItems: 'start',
      textAlign: isMobile ? 'center' : 'left'
    },
    doctorLeftSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '15px' : '20px',
      alignItems: isMobile ? 'center' : 'flex-start'
    },
    doctorAvatar: {
      width: isMobile ? '100px' : '120px',
      height: isMobile ? '100px' : '135px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#e6e4e5',
      flexShrink: '0'
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    doctorDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      alignItems: isMobile ? 'center' : 'flex-start'
    },
    doctorName: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '700',
      fontSize: isMobile ? '20px' : '24px',
      lineHeight: '1.3em',
      color: '#0c3465',
      margin: '0'
    },
    doctorPosition: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '400',
      fontSize: isMobile ? '14px' : '18px',
      lineHeight: '1.3em',
      letterSpacing: '0.05em',
      color: '#000000',
      margin: '0'
    },
    doctorRating: {
      display: 'flex',
      gap: '2px',
      marginTop: '4px'
    },
    star: {
      color: '#ffa800',
      fontSize: isMobile ? '14px' : '16px'
    },
    appointmentButton: {
      width: isMobile ? '160px' : '200px',
      height: isMobile ? '40px' : '45px',
      background: '#00326f',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '8px'
    },
    appointmentText: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '700',
      fontSize: isMobile ? '12px' : '14px',
      lineHeight: '1.2em',
      letterSpacing: '0.05em',
      color: '#ffffff',
      textAlign: 'center'
    },
    doctorAdditionalInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '15px' : '20px'
    },
    infoBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    infoTitle: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '700',
      fontSize: isMobile ? '14px' : '16px',
      lineHeight: '1.3em',
      letterSpacing: '0.05em',
      color: '#0c3465',
      margin: '0'
    },
    infoText: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '400',
      fontSize: isMobile ? '12px' : '14px',
      lineHeight: '1.4em',
      letterSpacing: '0.05em',
      color: '#000000',
      margin: '0'
    },
    directionsList: {
      listStyle: 'none',
      padding: '0',
      margin: '8px 0 0 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    directionItem: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '400',
      fontSize: isMobile ? '12px' : '14px',
      lineHeight: '1.4em',
      color: '#000000',
      paddingLeft: '15px',
      position: 'relative'
    },
    tagsWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '6px' : '8px',
      marginTop: '8px'
    },
    tag: {
      background: '#e8f2ff',
      border: '1px solid #0c3465',
      borderRadius: '15px',
      padding: isMobile ? '4px 8px' : '6px 14px',
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '500',
      fontSize: isMobile ? '11px' : '13px',
      color: '#0c3465',
      whiteSpace: 'nowrap'
    },
    certificatesGrid: {
      display: 'flex',
      gap: isMobile ? '8px' : '12px',
      marginTop: '10px',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    certificateItem: {
      width: isMobile ? '70px' : '100px',
      height: isMobile ? '90px' : '140px',
      borderRadius: '6px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.3s'
    },
    certificateNote: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '1.219em',
      letterSpacing: '0.05em',
      color: '#989898',
      margin: '8px 0 0 0',
      textAlign: isMobile ? 'center' : 'left'
    },
    reviewsCard: {
      background: '#00326f',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '20px 15px' : '39px 85px',
      position: 'relative'
    },
    reviewsTitle: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '700',
      fontSize: isMobile ? '20px' : '25px',
      lineHeight: '1.219em',
      letterSpacing: '0.05em',
      color: '#ffffff',
      margin: isMobile ? '0 0 15px 0' : '0 0 24px 0',
      textAlign: isMobile ? 'center' : 'left'
    },
    reviewsContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '20px' : '45px',
      alignItems: 'flex-start'
    },
    videoContainer: {
      width: isMobile ? '100%' : '504px',
      height: isMobile ? '200px' : '308px',
      flexShrink: '0',
      borderRadius: '5px',
      overflow: 'hidden',
      background: '#000'
    },
    reviewsGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: '1'
    },
    reviewItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: isMobile ? '12px' : '0'
    },
    reviewHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '10px' : '8px'
    },
    reviewAvatar: {
      width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
      borderRadius: '30px',
      overflow: 'hidden',
      flexShrink: '0'
    },
    reviewName: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '600',
      fontSize: isMobile ? '14px' : '20px',
      lineHeight: '1.219',
      letterSpacing: '0.05em',
      color: '#ffffff',
      margin: '0'
    },
    reviewStar: {
      color: '#ffa800',
      fontSize: isMobile ? '12px' : '19px'
    },
    reviewText: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: '400',
      fontSize: isMobile ? '12px' : '15px',
      lineHeight: '1.4em',
      letterSpacing: '0.05em',
      color: '#ffffff',
      fontStyle: 'italic',
      margin: '0'
    }
  };

  return (
    <div className={styles.pageWrapper} style={responsiveStyles.pageWrapper}>
      <Header 
        navItems={["Записаться на прием", "Выбрать врача", "О клинике", "Личный кабинет"]}
        showAccountButton={false}
        fixed={true}
        onAppointmentClick={handleAppointmentClick}
      />

      {/* Main Content */}
      <main className={styles.main} style={responsiveStyles.main}>
        <div className={styles.container} style={responsiveStyles.container}>
          {/* Page Title */}
          <h1 className={styles.pageTitle} style={responsiveStyles.pageTitle}>Подробнее о враче</h1>

          {/* Doctor Info Card */}
          <div className={styles.doctorCard} style={responsiveStyles.doctorCard}>
            <div className={styles.doctorMainInfo} style={responsiveStyles.doctorMainInfo}>
              <div className={styles.doctorLeftSection} style={responsiveStyles.doctorLeftSection}>
                <div className={styles.doctorAvatar} style={responsiveStyles.doctorAvatar}>
                  <Image
                    src={doctorData.avatar_url && doctorData.avatar_url !== "" ? doctorData.avatar_url : "/doctor-female.jpg"}
                    alt={doctorData.full_name}
                    width={129}
                    height={145}
                    className={styles.avatarImage}
                    style={responsiveStyles.avatarImage}
                  />
                </div>

                <div className={styles.doctorDetails} style={responsiveStyles.doctorDetails}>
                  <h2 className={styles.doctorName} style={responsiveStyles.doctorName}>{doctorData.full_name}</h2>
                  <p className={styles.doctorPosition} style={responsiveStyles.doctorPosition}>{doctorData.specialization_title}</p>

                  <div className={styles.doctorRating} style={responsiveStyles.doctorRating}>
                    {[...Array(Math.max(1, Math.min(5, Math.floor(doctorData.rating || 5))))].map((_, i) => (
                      <span key={i} className={styles.star} style={responsiveStyles.star}>★</span>
                    ))}
                  </div>

                  <button className={styles.appointmentButton} style={responsiveStyles.appointmentButton} onClick={handleAppointmentClick}>
                    <span className={styles.appointmentText} style={responsiveStyles.appointmentText}>Записаться на прием</span>
                  </button>
                </div>
              </div>

              <div className={styles.doctorAdditionalInfo} style={responsiveStyles.doctorAdditionalInfo}>
                <div className={styles.infoBlock} style={responsiveStyles.infoBlock}>
                  <h3 className={styles.infoTitle} style={responsiveStyles.infoTitle}>Образование</h3>
                  <p className={styles.infoText} style={responsiveStyles.infoText}>{doctorData.education_text || "Информация отсутствует"}</p>
                </div>

                <div className={styles.infoBlock} style={responsiveStyles.infoBlock}>
                  <h3 className={styles.infoTitle} style={responsiveStyles.infoTitle}>Стаж</h3>
                  <p className={styles.infoText} style={responsiveStyles.infoText}>{doctorData.experience_years ? `${doctorData.experience_years}+ лет опыта` : "Информация отсутствует"}</p>
                </div>

                <div className={styles.infoBlock} style={responsiveStyles.infoBlock}>
                  <h3 className={styles.infoTitle} style={responsiveStyles.infoTitle}>Время приема</h3>
                  <p className={styles.infoText} style={responsiveStyles.infoText}>{doctorData.workingHours}</p>
                </div>

                <div className={styles.infoBlock} style={responsiveStyles.infoBlock}>
                  <h3 className={styles.infoTitle} style={responsiveStyles.infoTitle}>Направления</h3>
                  <ul className={styles.directionsList} style={responsiveStyles.directionsList}>
                    {doctorData.directions.map((direction, index) => (
                      <li key={index} className={styles.directionItem} style={responsiveStyles.directionItem}>{direction}</li>
                    ))}
                  </ul>
                </div>

                {doctorData.treatmentTags && doctorData.treatmentTags.length > 0 && (
                  <div className={styles.infoBlock} style={responsiveStyles.infoBlock}>
                    <h3 className={styles.infoTitle} style={responsiveStyles.infoTitle}>Специализация по заболеваниям</h3>
                    <div className={styles.tagsWrapper} style={responsiveStyles.tagsWrapper}>
                      {doctorData.treatmentTags.map((tag, index) => (
                        <span key={index} className={styles.tag} style={responsiveStyles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {doctorData.certificates && doctorData.certificates.filter(cert => cert && cert.url && cert.url !== "").length > 0 && (
                  <div className={styles.infoBlock} style={responsiveStyles.infoBlock}>
                    <h3 className={styles.infoTitle} style={responsiveStyles.infoTitle}>Сертификаты и лицензии</h3>
                    <div className={styles.certificatesGrid} style={responsiveStyles.certificatesGrid}>
                      {doctorData.certificates.filter(cert => cert && cert.url && cert.url !== "").map((cert, index) => (
                        <div
                          key={index}
                          className={styles.certificateItem}
                          style={responsiveStyles.certificateItem}
                          onClick={() => openCertificate(cert.url)}
                        >
                          <Image
                            src={cert.url}
                            alt={cert.title || `Сертификат ${index + 1}`}
                            width={100}
                            height={140}
                            className={styles.certificateImage}
                          />
                        </div>
                      ))}
                    </div>
                    <p className={styles.certificateNote} style={responsiveStyles.certificateNote}>
                      Нажмите на сертификат чтобы увидеть подробнее
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className={styles.reviewsCard} style={responsiveStyles.reviewsCard}>
            <h2 className={styles.reviewsTitle} style={responsiveStyles.reviewsTitle}>Отзывы</h2>

            <div className={styles.reviewsContent} style={responsiveStyles.reviewsContent}>
              <div className={styles.videoContainer} style={responsiveStyles.videoContainer}>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/4dtV3iF4MPg"
                  title="Отзыв о клинике"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.videoIframe}
                ></iframe>
              </div>

              <div className={styles.reviewsGrid} style={responsiveStyles.reviewsGrid}>
                {reviewsData.map((review, index) => (
                  <div key={index} className={styles.reviewItem} style={responsiveStyles.reviewItem}>
                    <div className={styles.reviewHeader} style={responsiveStyles.reviewHeader}>
                      <div className={styles.reviewAvatar} style={responsiveStyles.reviewAvatar}>
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={50}
                          height={50}
                          className={styles.reviewAvatarImage}
                        />
                      </div>
                      <div className={styles.reviewInfo}>
                        <h3 className={styles.reviewName} style={responsiveStyles.reviewName}>{review.name}</h3>
                        <div className={styles.reviewRating}>
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className={styles.reviewStar} style={responsiveStyles.reviewStar}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className={styles.reviewText} style={responsiveStyles.reviewText}>"{review.text}"</p>
                  </div>
                ))}
              </div>
            </div>
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
        <div 
          className={styles.modal} 
          onClick={() => setShowAppointmentModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: isMobile ? '25px 20px' : '50px',
              maxWidth: isMobile ? '95%' : '650px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <button 
              className={styles.modalClose} 
              onClick={() => setShowAppointmentModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '25px',
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#666',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >×</button>
            <h2 
              className={styles.modalTitle}
              style={{
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontWeight: '700',
                fontSize: isMobile ? '22px' : '28px',
                color: '#0c3465',
                margin: '0 0 15px 0',
                textAlign: 'center'
              }}
            >Записаться на прием</h2>
            <p 
              className={styles.modalDoctor}
              style={{
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontWeight: '600',
                fontSize: isMobile ? '14px' : '18px',
                color: '#666',
                margin: '0 0 35px 0',
                textAlign: 'center'
              }}
            >Врач: {doctorData.name}</p>
            <form onSubmit={handleAppointmentSubmit} className={styles.appointmentForm} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <input 
                type="text" 
                name="name"
                placeholder="Ваше ФИО" 
                className={styles.formInput}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  boxSizing: 'border-box'
                }}
                required 
                disabled={isSubmitting}
              />
              <input 
                type="tel" 
                name="phone"
                placeholder="Телефон" 
                className={styles.formInput}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  boxSizing: 'border-box'
                }}
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
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
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
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                disabled={isSubmitting}
              ></textarea>
              <button 
                type="submit" 
                className={styles.formSubmit}
                style={{
                  background: '#0c3465',
                  color: 'white',
                  border: 'none',
                  borderRadius: '70px',
                  padding: '16px 35px',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
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
