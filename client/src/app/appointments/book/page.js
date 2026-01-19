"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./book.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const BookAppointmentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorSlug, setDoctorSlug] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPosition, setDoctorPosition] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    reason: ""
  });

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setFormData(prev => ({
          ...prev,
          name: userData.full_name || userData.name || "",
          phone: userData.phone || ""
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/auth");
        return;
      }
    } else {
      router.push("/auth");
      return;
    }

    // Get doctor info from URL parameters
    const doctor = searchParams.get('doctor');
    const doctorNameParam = searchParams.get('doctorName');
    const doctorPositionParam = searchParams.get('doctorPosition');
    
    if (doctor && doctorNameParam) {
      setDoctorSlug(doctor);
      setDoctorName(decodeURIComponent(doctorNameParam));
      setDoctorPosition(decodeURIComponent(doctorPositionParam || ""));
    } else {
      // If no doctor info, redirect to doctors page
      router.push("/doctors");
    }
  }, [router, searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      alert("Сперва войдите в личный кабинет");
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        userId: user.id,
        doctorSlug: doctorSlug,
        doctorName: doctorName,
        patientName: formData.name,
        patientPhone: formData.phone,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        reason: formData.reason || ""
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
        router.push("/appointments");
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

  // Generate time slots
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 17) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className={styles.pageWrapper}>
      <Header 
        navItems={["Записаться на прием", "Выбрать врача", "О клинике", "Личный кабинет"]}
        showAccountButton={false}
        fixed={true}
      />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.backButton} onClick={() => router.back()}>
            ← Назад
          </div>

          <h1 className={styles.title}>Запись на прием</h1>
          
          <div className={styles.doctorInfo}>
            <h2 className={styles.doctorName}>{doctorName}</h2>
            <p className={styles.doctorPosition}>{doctorPosition}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="name">
                Ваше имя *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="phone">
                Телефон *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="date">
                  Дата приема *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={styles.input}
                  min={minDate}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="time">
                  Время приема *
                </label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Выберите время</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="reason">
                Причина обращения (необязательно)
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={styles.textarea}
                rows="4"
                placeholder="Опишите причину вашего обращения..."
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Записаться на прием"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointmentPage;