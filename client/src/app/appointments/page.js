"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { supabase } from "@/lib/supabase";

const AppointmentsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage for custom auth
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Get profile from database using user id
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.id)
            .single();

          setProfile(profileData || userData);
          setLoading(false);
          
          // Fetch appointments for this user
          await fetchAppointments(userData.id);
          return;
        }

        // Fallback to Supabase auth
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        
        if (!supaUser) {
          router.push("/auth");
          return;
        }

        setUser(supaUser);

        // Get profile from database
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supaUser.id)
          .single();

        setProfile(profileData);
        
        // Fetch appointments for this user
        await fetchAppointments(supaUser.id);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchAppointments = async (userId) => {
    try {
      setLoadingAppointments(true);
      const response = await fetch(`/api/appointments/get?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setAppointments(result.appointments || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const formatDate = (dateString) => {
    // Extract date part and format directly without Date object
    console.log('Raw date from API:', dateString);
    const datePart = dateString.split('T')[0];
    console.log('Date part:', datePart);
    const [year, month, day] = datePart.split('-');
    console.log('Parsed:', { year, month, day });
    
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const formatted = `${parseInt(day)} ${months[parseInt(month) - 1]} ${year} г.`;
    console.log('Formatted date:', formatted);
    return formatted;
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Ожидается",
      confirmed: "Подтверждено", 
      completed: "Завершено",
      cancelled: "Отменено"
    };
    return statusMap[status] || status;
  };

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("user");
    // Also sign out from Supabase if there's a session
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className={styles.pageWrapper}>
      <Header 
        // navItems={["Главная", "Услуги", "Врачи", "O нас"]}
        showAccountButton={false}
        fixed={true}
      />

      <div className={styles.contentWrapper}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <Link href="/profile" className={`${styles.sidebarItem} ${pathname === "/profile" ? styles.sidebarItemActive : ""}`}>
              <div className={styles.sidebarIcon}>
                <img src={pathname === "/profile" ? "/profile-active.png" : "/profile.png"} alt="" />
              </div>
              <span className={styles.sidebarText}>Профиль</span>
            </Link>

            <Link href="/appointments" className={`${styles.sidebarItem} ${pathname === "/appointments" ? styles.sidebarItemActive : ""}`}>
              <div className={styles.sidebarIcon}>
                <img src={pathname === "/appointments" ? "/appointments-active.png" : "/appointments.png"} alt="" />
              </div>
              <span className={styles.sidebarText}>Записи</span>
            </Link>

            <Link href="#" className={styles.sidebarItem}>
              <div className={styles.sidebarIcon}>
                <img src="/analyzes.png" alt="" />
              </div>
              <span className={styles.sidebarText}>Анализы</span>
            </Link>

            <Link href="#" className={styles.sidebarItem}>
              <div className={styles.sidebarIcon}>
                <img src="/notes.png" alt="" />
              </div>
              <span className={styles.sidebarText}>Выписки</span>
            </Link>

            <Link href="#" className={styles.sidebarItem}>
              <div className={styles.sidebarIcon}>
                <img src="/insurance.png" alt="" />
              </div>
              <span className={styles.sidebarText}>Страхования</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <h1 className={styles.pageTitle}>Записи</h1>

            {loading ? (
              <div className={styles.appointmentsLoading}>
                <div className={styles.loadingSpinner}></div>
                <p>Загрузка...</p>
              </div>
            ) : !user ? (
              <div className={styles.noAppointments}>
                <p>Войдите в систему, чтобы увидеть свои записи</p>
                <Link href="/auth" className={styles.bookButton}>
                  Войти
                </Link>
              </div>
            ) : loadingAppointments ? (
              <div className={styles.appointmentsLoading}>
                <div className={styles.loadingSpinner}></div>
                <p>Загрузка записей...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className={styles.noAppointments}>
                <p>У вас пока нет записей</p>
                <Link href="/doctors" className={styles.bookButton}>
                  Записаться на прием
                </Link>
              </div>
            ) : (
              <div className={styles.appointmentsGrid}>
                {appointments.map((appointment) => (
                  <div key={appointment.id} className={styles.appointmentCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.dateTime}>
                        <div className={styles.date}>{formatDate(appointment.appointment_date)}</div>
                        <div className={styles.divider}></div>
                        <div className={styles.time}>{appointment.appointment_time}</div>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.doctorInfo}>
                        <span className={styles.doctorLabel}>Врач:</span>
                        <span className={styles.doctorName}>{appointment.doctor_name}</span>
                      </div>
                      {appointment.reason && (
                        <div className={styles.reasonInfo}>
                          <span className={styles.reasonLabel}>Причина:</span>
                          <span className={styles.reasonText}>{appointment.reason}</span>
                        </div>
                      )}
                      <div className={styles.statusInfo}>
                        <span className={styles.statusLabel}>Статус:</span>
                        <span className={`${styles.statusText} ${styles[appointment.status]}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <button className={styles.detailsButton}>
                        <span className={styles.buttonText}>Подробнее</span>
                        <span className={styles.buttonIcon}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* <div className={styles.scrollbar}>
              <div className={styles.scrollbarThumb}></div>
            </div> */}
          </div>
        </main>
      </div>

      {/* Custom Footer */}
      <Footer></Footer>
      {/* <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLeft}>
            <Image
              src="/logo.png"
              alt="Sadap Clinic"
              width={149}
              height={74}
              className={styles.footerLogo}
            />
            <p className={styles.footerTagline}>Радость. Здоровье. Успех!</p>
            <p className={styles.footerCopyright}>Все права защищены, 2024.</p>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>Услуги</a>
              <a href="#" className={styles.footerLink}>Врачи</a>
              <a href="#" className={styles.footerLink}>Отзывы</a>
              <a href="#" className={styles.footerLink}>О нас</a>
            </div>

            <div className={styles.footerContacts}>
              <a href="tel:+77023012796" className={styles.contactItem}>
                <Image
                  src="/phone.png"
                  alt="Phone"
                  width={24}
                  height={24}
                  className={styles.contactIcon}
                />
                <span className={styles.contactText}>+7 702 301 2796</span>
              </a>

              <a href="https://instagram.com/sadapclinic_kz" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className={styles.contactIcon}
                />
                <span className={styles.contactText}>@sadapclinic_kz</span>
              </a>

              <a href="mailto:support@sadapclinic.kz" className={styles.contactItem}>
                <Image
                  src="/mail.png"
                  alt="Email"
                  width={24}
                  height={24}
                  className={styles.contactIcon}
                />
                <span className={styles.contactText}>support@sadapclinic.kz</span>
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default AppointmentsPage;

