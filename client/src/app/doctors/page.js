"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const doctorsData = [
  {
    id: 1,
    name: "Жунисова Перизат Мухитдиновна",
    fullName: "Жунисова Перизат Мухитдиновна",
    position: "Врач акушер-гинеколог",
    specialties: ["Гинеколог", "Акушер"],
    avatar: "/doctor-female.jpg",
    slug: "zhunisova-perizat",
    experience: "15+ лет",
    tags: ["Воспаление", "Беременность", "Женское здоровье", "УЗИ"],
    workingHours: "Пн-Пт: 9:00 - 18:00, Сб: 9:00 - 14:00"
  },
  {
    id: 2,
    name: "Юламанова Зарина Евгеньевна",
    fullName: "Юламанова Зарина Евгеньевна",
    position: "Врач педиатр",
    specialties: ["Педиатр"],
    avatar: "/doctor-female.jpg",
    slug: "yulamanova-zarina",
    experience: "10+ лет",
    tags: ["Детское здоровье", "Вакцинация", "ОРВИ", "Аллергия"],
    workingHours: "Пн-Пт: 8:00 - 17:00, Сб: 9:00 - 13:00"
  }
];

// 🔹 Категории-специальности под поиском
const specialties = [
  "Педиатр",
  "Кардиолог",
  "Гинеколог",
  "Терапевт",
  "Невролог",
  "Эндокринолог",
  "Хирург",
  "Дерматолог"
];

const DoctorsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterExperience, setFilterExperience] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Фильтрация врачей
  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch = doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || 
                            doctor.specialties.some(s => s.toLowerCase() === selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const handleSpecialtyClick = (specialty) => {
    setSelectedSpecialty(selectedSpecialty === specialty ? "" : specialty);
  };

  const handleAppointmentClick = (e, doctor) => {
    e.preventDefault();
    
    // Проверка авторизации
    if (!isAuthenticated) {
      alert("Сперва войдите в личный кабинет");
      router.push("/auth");
      return;
    }
    
    setSelectedDoctor(doctor);
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
        doctorSlug: selectedDoctor.slug,
        doctorName: selectedDoctor.name,
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

  return (
    <div className={styles.pageWrapper}>
      <Header 
        // navItems={["Записаться на прием", "Выбрать врача", "Личный кабинет"]}
        showAccountButton={false}
        fixed={true}
      />

      <div className={styles.contentWrapper}>
        <div className={styles.container}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Наши врачи</h1>
            <p className={styles.pageSubtitle}>Наши врачи - наша гордость!</p>
          </div>

          {/* Search and Filter */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchInput}>
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" className={styles.searchIcon}>
                <path d="M9.5 17C13.6421 17 17 13.6421 17 9.5C17 5.35786 13.6421 2 9.5 2C5.35786 2 2 5.35786 2 9.5C2 13.6421 5.35786 17 9.5 17Z" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 19L14.65 14.65" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Введите специализацию, имя или фамилию врача"
                className={styles.searchField}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className={styles.searchButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Поиск</span>
            </button>

            <button className={styles.filterButton} onClick={() => setShowFilterModal(true)}>
              <Image
                src="/filter.png"
                alt=""
                width={24}
                height={24}
                className={styles.filterIcon}
              />
              <span>Фильтровать</span>
            </button>
          </div>

          {/* 🔹 КАТЕГОРИИ СПЕЦИАЛЬНОСТЕЙ ПОД ПОИСКОМ */}
          <div className={styles.specialtiesWrapper}>
            {specialties.map((spec) => (
              <button
                key={spec}
                type="button"
                className={`${styles.specialtyButton} ${selectedSpecialty === spec ? styles.specialtyButtonActive : ''}`}
                onClick={() => handleSpecialtyClick(spec)}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Doctors List */}
          <div className={styles.doctorsList}>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
              <div key={doctor.id} className={styles.doctorCardLink}>
                <Link
                  href={`/doctors/${doctor.slug}`}
                  className={styles.doctorCardLinkInner}
                >
                  <div className={styles.doctorCard}>
                    <div className={styles.doctorAvatar}>
                      <Image
                        src={doctor.avatar}
                        alt={doctor.name}
                        width={73}
                        height={82}
                        className={styles.avatarImage}
                      />
                    </div>

                    <div className={styles.doctorInfo}>
                      <h3 className={styles.doctorName}>{doctor.name}</h3>
                      <p className={styles.doctorPosition}>{doctor.position}</p>
                    </div>

                    <button 
                      className={styles.appointmentButton}
                      onClick={(e) => handleAppointmentClick(e, doctor)}
                    >
                      <span className={styles.buttonText}>Записаться</span>
                    </button>
                  </div>
                </Link>
              </div>
            ))
            ) : (
              <p className={styles.noResults}>Врачи не найдены</p>
            )}
          </div>

          <div className={styles.scrollbar}></div>
        </div>
      </div>

      {/* Модальное окно записи на прием */}
      {showAppointmentModal && (
        <div className={styles.modal} onClick={() => setShowAppointmentModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAppointmentModal(false)}>×</button>
            <h2 className={styles.modalTitle}>Записаться на прием</h2>
            <p className={styles.modalDoctor}>Врач: {selectedDoctor?.name}</p>
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
              <input 
                type="date" 
                name="date"
                className={styles.formInput} 
                required 
                disabled={isSubmitting}
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

      {/* Модальное окно фильтра */}
      {showFilterModal && (
        <div className={styles.modal} onClick={() => setShowFilterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowFilterModal(false)}>×</button>
            <h2 className={styles.modalTitle}>Фильтры</h2>
            <div className={styles.filterForm}>
              <label className={styles.filterLabel}>
                Опыт работы
                <select className={styles.formInput} value={filterExperience} onChange={(e) => setFilterExperience(e.target.value)}>
                  <option value="">Все</option>
                  <option value="5">От 5 лет</option>
                  <option value="10">От 10 лет</option>
                  <option value="15">От 15 лет</option>
                </select>
              </label>
              <button className={styles.formSubmit} onClick={() => setShowFilterModal(false)}>Применить</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DoctorsPage;
