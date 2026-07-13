"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { supabase } from "@/lib/supabase";

const IcoProfile   = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IcoCalendar  = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IcoClipboard = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const IcoCard      = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;

function formatDate(ds) {
  if (!ds) return "—";
  const [y, m, d] = (ds.split("T")[0]).split("-");
  const months = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function doctorInitials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "Dr";
}

function formatTime(t) {
  if (!t) return "—";
  return /^\d{1,2}:\d{2}/.test(t) ? t.slice(0, 5) : "—";
}

// Deterministic color from doctor name for initials avatar
const AVATAR_COLORS = ["#1e4d8c","#0c3465","#2563a6","#3b6fa0","#154c79","#1a5276","#2e4057"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const STATUS_LABEL = { pending:"Ожидается", confirmed:"Подтверждено", completed:"Завершено", cancelled:"Отменено" };
const STATUS_TABS  = [
  { key: "all",       label: "Все" },
  { key: "active",    label: "Активные" },
  { key: "completed", label: "Завершённые" },
  { key: "cancelled", label: "Отменённые" },
];

function filterAppt(a, key) {
  if (key === "active")    return a.status === "pending" || a.status === "confirmed";
  if (key === "completed") return a.status === "completed";
  if (key === "cancelled") return a.status === "cancelled";
  return true;
}

const AppointmentsPage = () => {
  const router   = useRouter();
  const pathname = usePathname();

  const [user, setUser]     = useState(null);
  const [sadapPatientId, setSadapPatientId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [appointments, setAppointments]               = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem("user");
        let userData = null;
        let profileData = null;

        if (stored) {
          userData = JSON.parse(stored);
        } else {
          const { data: { user: u } } = await supabase.auth.getUser();
          if (!u) { router.push("/auth"); return; }
          userData = u;
        }
        setUser(userData);

        const { data: pd } = await supabase
          .from("profiles").select("*").eq("id", userData.id).single();
        profileData = pd || userData;

        const pid = profileData?.sadap_patient_id || userData.sadap_patient_id || null;
        setSadapPatientId(pid);
        await fetchAppointments(pid);
      } catch {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const fetchAppointments = async (pid) => {
    try {
      setLoadingAppointments(true);
      if (!pid) { setAppointments([]); return; }
      const res  = await fetch(`/api/appointments/get?sadap_patient_id=${pid}`);
      const data = await res.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch {}
    finally { setLoadingAppointments(false); }
  };

  const handleCancel = async (appointment) => {
    if (!confirm("Вы уверены, что хотите отменить запись?")) return;
    setCancelling(appointment.id);
    try {
      await fetch(`/api/sadap/appointments/${appointment.sadap_appointment_id}/cancel`, { method: "POST" });
      // Refresh from MIS
      await fetchAppointments(sadapPatientId);
    } catch {
      alert("Не удалось отменить запись. Попробуйте ещё раз.");
    } finally {
      setCancelling(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("user");
    await supabase.auth.signOut();
    router.push("/");
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = appointments.filter(a => filterAppt(a, activeTab));

  const sidebarItems = [
    { label: "Профиль",  Icon: IcoProfile,   href: "/profile" },
    { label: "Записи",   Icon: IcoCalendar,  href: "/appointments" },
    { label: "Диагнозы", Icon: IcoClipboard, href: "/profile" },
    { label: "Оплаты",   Icon: IcoCard,      href: "/profile" },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header showAccountButton={false} fixed={true} />

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {sidebarItems.map(({ label, Icon, href }) => {
              const active = pathname === href && !(href === "/profile" && label !== "Профиль");
              const isAppts = label === "Записи" && pathname === "/appointments";
              return (
                <Link key={label} href={href}
                  className={`${styles.sidebarItem} ${(active || isAppts) ? styles.sidebarItemActive : ""}`}>
                  <div className={styles.sidebarIcon}><Icon a={active || isAppts} /></div>
                  <span className={styles.sidebarText}>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <h1 className={styles.pageTitle}>Мои записи</h1>

            {/* Status filter tabs */}
            <div className={styles.filterTabs}>
              {STATUS_TABS.map(t => (
                <button key={t.key}
                  className={`${styles.filterTab} ${activeTab === t.key ? styles.filterTabActive : ""}`}
                  onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  {t.key !== "all" && (
                    <span className={styles.filterCount}>
                      {appointments.filter(a => filterAppt(a, t.key)).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading || loadingAppointments ? (
              <div className={styles.appointmentsLoading}>
                <div className={styles.loadingSpinner} />
                <p>Загрузка записей...</p>
              </div>
            ) : !sadapPatientId ? (
              <div className={styles.noAppointments}>
                <p>Привяжите профиль к базе клиники, чтобы видеть свои записи</p>
                <Link href="/profile" className={styles.bookButton}>Перейти в профиль</Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.noAppointments}>
                <p>Нет записей</p>
                <Link href="/doctors" className={styles.bookButton}>Записаться на приём</Link>
              </div>
            ) : (
              <div className={styles.gridScroll}>
                <div className={styles.appointmentsGrid}>
                {filtered.map(a => {
                  const canCancel = a.status === "pending" || a.status === "confirmed";
                  return (
                    <div key={a.id} className={`${styles.appointmentCard} ${styles[`card_${a.status}`]}`}>
                      <div className={styles.cardAccent} />

                      <div className={styles.cardHeader}>
                        <div className={styles.dateBlock}>
                          <div className={styles.dateRow}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2"/>
                              <path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            <span className={styles.date}>{formatDate(a.appointment_date)}</span>
                          </div>
                          <div className={styles.timeRow}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                            <span className={styles.time}>{formatTime(a.appointment_time)}</span>
                          </div>
                        </div>
                        <div className={`${styles.statusBadge} ${styles[a.status]}`}>
                          {STATUS_LABEL[a.status] || a.status}
                        </div>
                      </div>

                      <div className={styles.cardDivider} />

                      <div className={styles.doctorRow}>
                        <div
                          className={styles.doctorAvatar}
                          style={!a.doctor_avatar_url ? { background: avatarColor(a.doctor_name), borderColor: "transparent" } : {}}
                        >
                          {a.doctor_avatar_url ? (
                            <img
                              src={a.doctor_avatar_url}
                              alt={a.doctor_name}
                              className={styles.doctorAvatarImg}
                            />
                          ) : (
                            <span className={styles.doctorAvatarInitials} style={{ color: "#fff" }}>
                              {doctorInitials(a.doctor_name)}
                            </span>
                          )}
                        </div>
                        <div className={styles.doctorInfo}>
                          <span className={styles.doctorLabel}>Лечащий врач</span>
                          <span className={styles.doctorName}>{a.doctor_name}</span>
                        </div>
                      </div>

                      <div className={styles.cardBody}>
                        {a.reason && (
                          <div className={styles.reasonBlock}>
                            <span className={styles.reasonLabel}>Причина обращения</span>
                            <span className={styles.reasonText}>{a.reason}</span>
                          </div>
                        )}
                        {a.source === "sadap" && (
                          <span className={styles.clinicBadge}>Из базы клиники</span>
                        )}
                      </div>

                      <div className={styles.cardFooter}>
                        <Link href="/doctors" className={styles.bookAgainBtn}>
                          Записаться снова
                        </Link>
                        {canCancel && (
                          <button className={styles.cancelButton}
                            onClick={() => handleCancel(a)}
                            disabled={cancelling === a.id}>
                            {cancelling === a.id ? "Отмена..." : "Отменить"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentsPage;
