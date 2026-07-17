"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { supabase } from "@/lib/supabase";

// ── Sidebar SVG icons ──────────────────────────────────────────────────────
const IcoProfile   = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IcoCalendar  = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IcoClipboard = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const IcoCard      = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
const IcoStar      = ({ a }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#fff":"#0c3465"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

function doctorInitials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "Dr";
}

const AVATAR_COLORS = ["#1e4d8c","#0c3465","#2563a6","#3b6fa0","#154c79","#1a5276","#2e4057"];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatDate(ds) {
  if (!ds) return "—";
  const [y, m, d] = (ds.split("T")[0]).split("-");
  const months = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function formatTime(t) {
  if (!t) return "—";
  return /^\d{1,2}:\d{2}/.test(t) ? t.slice(0, 5) : "—";
}

const STATUS_LABEL = { pending:"Ожидается", confirmed:"Подтверждено", completed:"Завершено", cancelled:"Отменено" };

const ProfilePage = () => {
  const router   = useRouter();
  const pathname = usePathname();

  const [user, setUser]   = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sadapPatientId, setSadapPatientId] = useState(null);
  const [verifyForm, setVerifyForm]   = useState({ iin:"", phone:"", lastname:"" });
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [verifyError, setVerifyError]   = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [editFields, setEditFields]         = useState({ full_name: "", phone: "", email: "" });
  const [savingProfile, setSavingProfile]   = useState(false);
  const [saveSuccess, setSaveSuccess]       = useState(false);

  const [appointments, setAppointments]               = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [activeSection, setActiveSection] = useState("profile");
  const [diagnoses, setDiagnoses]         = useState([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);
  const [payments, setPayments]           = useState([]);
  const [loadingPayments, setLoadingPayments]   = useState(false);
  const [bonuses, setBonuses]             = useState(null);
  const [loadingBonuses, setLoadingBonuses]     = useState(false);

  // ── Auth ─────────────────────────────────────────────────────────────────
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
        setProfile(profileData);

        const pid = profileData?.sadap_patient_id || userData.sadap_patient_id || null;
        setSadapPatientId(pid);
        setVerifyForm(p => ({ ...p, phone: userData.phone || "" }));

        setLoading(false);
        loadAppointments(userData.id, pid);
        loadBonuses(pid);
      } catch {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // ── Load appointments ────────────────────────────────────────────────────
  const loadAppointments = async (userId, patientId) => {
    try {
      setLoadingAppointments(true);
      let url = `/api/appointments/get?userId=${userId}`;
      if (patientId) url += `&sadap_patient_id=${patientId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch {}
    finally { setLoadingAppointments(false); }
  };

  // ── Load diagnoses ───────────────────────────────────────────────────────
  const loadDiagnoses = async (pid) => {
    if (!pid) return;
    setLoadingDiagnoses(true);
    try {
      const res = await fetch(`/api/sadap/patient/${pid}/diagnoses`);
      const data = await res.json();
      const raw = Array.isArray(data.diagnoses) ? data.diagnoses
        : Array.isArray(data.diagnoses?.data) ? data.diagnoses.data : [];
      setDiagnoses(raw);
    } catch {}
    finally { setLoadingDiagnoses(false); }
  };

  // ── Load bonuses (fake data until API is ready) ───────────────────────────
  const loadBonuses = async (pid) => {
    setLoadingBonuses(true);
    await new Promise(r => setTimeout(r, 600));
    setBonuses({
      bonus_points: 1240,
      balance: 45000,
      cashback_points: 980,
      tier: "Серебряная карта",
      tier_spent: 180000,
      tier_next: 500000,
      history: [
        { id: 1, date: "2026-07-10", label: "Консультация терапевта",     points: +120, type: "earn" },
        { id: 2, date: "2026-07-05", label: "УЗИ органов брюшной полости", points: +200, type: "earn" },
        { id: 3, date: "2026-06-28", label: "Списание за приём",           points: -300, type: "spend" },
        { id: 4, date: "2026-06-20", label: "ЭКГ",                         points: +80,  type: "earn" },
        { id: 5, date: "2026-06-14", label: "Педиатрия",                   points: +150, type: "earn" },
        { id: 6, date: "2026-05-30", label: "Списание за анализы",         points: -90,  type: "spend" },
      ],
    });
    setLoadingBonuses(false);
  };

  // ── Load payments ────────────────────────────────────────────────────────
  const loadPayments = async (pid) => {
    if (!pid) return;
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/sadap/patient/${pid}/payments`);
      const data = await res.json();
      const raw = Array.isArray(data.payments) ? data.payments
        : Array.isArray(data.payments?.data) ? data.payments.data : [];
      setPayments(raw);
    } catch {}
    finally { setLoadingPayments(false); }
  };

  // ── Section switch ───────────────────────────────────────────────────────
  const switchSection = (sec) => {
    setActiveSection(sec);
    if (sec === "diagnoses" && diagnoses.length === 0) loadDiagnoses(sadapPatientId);
    if (sec === "payments"  && payments.length  === 0) loadPayments(sadapPatientId);
    if (sec === "bonuses"   && !bonuses) loadBonuses(sadapPatientId);
  };

  // ── Verify patient ───────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyStatus("loading");
    setVerifyError("");
    try {
      const res = await fetch("/api/sadap/verify-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyForm),
      });
      const result = await res.json();
      if (result.success) {
        const pid = result.patient_id;
        setSadapPatientId(pid);
        setVerifyStatus("success");
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          u.sadap_patient_id = pid;
          localStorage.setItem("user", JSON.stringify(u));
        }
        if (user?.id) {
          await fetch("/api/profile/update-sadap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, sadap_patient_id: pid }),
          });
        }
        loadAppointments(user.id, pid);
      } else {
        setVerifyStatus("error");
        setVerifyError(result.error || "Пациент не найден в базе клиники");
      }
    } catch {
      setVerifyStatus("error");
      setVerifyError("Произошла ошибка. Попробуйте позже.");
    }
  };

  const startEditProfile = (name) => {
    setEditFields({
      full_name: name,
      phone: user?.phone || profile?.phone || "",
      email: user?.email || profile?.email || "",
    });
    setEditingProfile(true);
    setSaveSuccess(false);
  };

  const cancelEditProfile = () => setEditingProfile(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, full_name: editFields.full_name.trim() }),
      });
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        u.full_name = editFields.full_name.trim();
        localStorage.setItem("user", JSON.stringify(u));
      }
      setProfile(p => ({ ...p, full_name: editFields.full_name.trim() }));
      setEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {}
    finally { setSavingProfile(false); }
  };

  const handleLogout = async () => {
    localStorage.removeItem("user");
    await supabase.auth.signOut();
    router.push("/");
  };

  // ── Active appointments (pending/confirmed, 3 nearest) ───────────────────
  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments
    .filter(a => a.status === "pending" || a.status === "confirmed")
    .slice(0, 3);

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Загрузка...</p>
      </div>
    </div>
  );

  const displayName = profile?.full_name || user?.full_name || user?.user_metadata?.full_name || "Пользователь";

  const sidebarItems = [
    { key: "profile",      label: "Профиль",  Icon: IcoProfile },
    { key: "appointments", label: "Записи",   Icon: IcoCalendar, href: "/appointments" },
    { key: "diagnoses",    label: "Диагнозы", Icon: IcoClipboard },
    { key: "payments",     label: "Оплаты",   Icon: IcoCard },
    { key: "bonuses",      label: "Бонусы",   Icon: IcoStar },
  ];

  // ── Bonus computed values ─────────────────────────────────────────────────
  const totalSpent     = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const bonusPoints    = bonuses?.bonus_points    ?? 0;
  const accountBalance = bonuses?.balance         ?? null;
  const cashbackPoints = bonuses?.cashback_points ?? 0;
  const otherPoints    = Math.max(0, bonusPoints - cashbackPoints);
  const tierLabel      = bonuses?.tier            ?? "Стандарт";
  const tierSpent      = bonuses?.tier_spent      ?? totalSpent;
  const tierNext       = bonuses?.tier_next       ?? 500000;
  const bonusHistory   = bonuses?.history         ?? [];

  return (
    <div className={styles.pageWrapper}>
      <Header showAccountButton={false} fixed={true} />

      <div className={styles.contentWrapper}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {sidebarItems.map(({ key, label, Icon, href }) => {
              const active = href ? pathname === href : activeSection === key;
              const El = href ? Link : "button";
              const props = href
                ? { href }
                : { type: "button", onClick: () => switchSection(key) };
              return (
                <El key={key}
                  {...props}
                  className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ""}`}
                >
                  <div className={styles.sidebarIcon}><Icon a={active} /></div>
                  <span className={styles.sidebarText}>{label}</span>
                </El>
              );
            })}
          </nav>
        </aside>

        {/* ── Main ── */}
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>

            {/* ══ PROFILE SECTION ══════════════════════════════════════════ */}
            {activeSection === "profile" && (
              <>
                {/* ── Bonus banner on top ── */}
                <div className={styles.bonusBanner} style={{ marginBottom: 20 }}>
                  <div className={styles.bonusBannerLeft}>
                    <span className={styles.bonusTierBadge}>{tierLabel}</span>
                    <div className={styles.bonusSpent}>
                      <span className={styles.bonusSpentLabel}>Потрачено всего</span>
                      <span className={styles.bonusSpentNum}>{tierSpent.toLocaleString("ru-RU")} ₸</span>
                    </div>
                    <div className={styles.bonusProgress}>
                      <div className={styles.bonusProgressTrack}>
                        <div className={styles.bonusProgressFill}
                          style={{ width: `${Math.min((tierSpent / tierNext) * 100, 100)}%` }} />
                      </div>
                      <span className={styles.bonusProgressHint}>
                        Ещё {(tierNext - tierSpent).toLocaleString("ru-RU")} ₸ до следующего уровня
                      </span>
                    </div>
                  </div>
                  <div className={styles.bonusBannerRight}>
                    <div className={styles.bonusRingWrap}>
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12"/>
                        <circle cx="55" cy="55" r="44" fill="none" stroke="#4ade80" strokeWidth="12"
                          strokeDasharray={`${bonusPoints > 0 ? Math.min((cashbackPoints / bonusPoints) * 276, 276) : 0} 276`}
                          strokeLinecap="round" strokeDashoffset="69" transform="rotate(-90 55 55)"/>
                      </svg>
                      <div className={styles.bonusRingInner}>
                        <span className={styles.bonusRingNum}>{bonusPoints.toLocaleString("ru-RU")}</span>
                        <span className={styles.bonusRingLabel}>баллов</span>
                      </div>
                    </div>
                    <div className={styles.bonusBreakdown}>
                      <div className={styles.bonusBreakdownRow}>
                        <span className={styles.bonusDot} style={{ background: "#4ade80" }} />
                        <span className={styles.bonusBreakdownLabel}>Кэшбэк</span>
                        <span className={styles.bonusBreakdownVal}>{cashbackPoints.toLocaleString("ru-RU")}</span>
                      </div>
                      <div className={styles.bonusBreakdownRow}>
                        <span className={styles.bonusDot} style={{ background: "rgba(255,255,255,0.4)" }} />
                        <span className={styles.bonusBreakdownLabel}>Остаток</span>
                        <span className={styles.bonusBreakdownVal}>{accountBalance != null ? Number(accountBalance).toLocaleString("ru-RU") + " ₸" : "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Top header row ── */}
                <div className={styles.profileHeaderRow}>
                  <div>
                    <h1 className={styles.pageGreeting}>Личные данные</h1>
                    <p className={styles.pageGreetingSub}>Управляйте своей персональной информацией</p>
                  </div>
                  <button onClick={handleLogout} className={styles.logoutButtonSmall}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Выйти
                  </button>
                </div>

                {/* ── Profile card ── */}
                <div className={styles.profileCardNew}>

                  {/* Avatar + name block */}
                  <div className={styles.profileAvatarBlock}>
                    <div className={styles.avatarCircleLarge}>
                      {initials(displayName)}
                    </div>
                    <div>
                      <p className={styles.avatarName}>{displayName}</p>
                      <p className={styles.avatarSub}>{user?.email || profile?.email || "Пациент"}</p>
                      {sadapPatientId && (
                        <span className={styles.clinicBadge}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          Привязан к клинике
                        </span>
                      )}
                    </div>
                    {!editingProfile && (
                      <button
                        className={styles.editProfileBtn}
                        onClick={() => startEditProfile(displayName)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Редактировать
                      </button>
                    )}
                  </div>

                  <div className={styles.profileDivider} />

                  {/* Fields */}
                  <div className={styles.profileFieldsList}>

                    <div className={styles.profileFieldRow}>
                      <div className={styles.profileFieldMeta}>
                        <span className={styles.profileFieldLabel}>Полное имя</span>
                        <span className={styles.profileFieldHint}>Как к вам обращаться</span>
                      </div>
                      {editingProfile ? (
                        <input
                          className={styles.profileFieldInput}
                          value={editFields.full_name}
                          onChange={e => setEditFields(f => ({ ...f, full_name: e.target.value }))}
                          placeholder="Введите полное имя"
                          autoFocus
                        />
                      ) : (
                        <span className={styles.profileFieldValue}>{displayName}</span>
                      )}
                    </div>

                    <div className={styles.profileFieldRow}>
                      <div className={styles.profileFieldMeta}>
                        <span className={styles.profileFieldLabel}>Телефон</span>
                        <span className={styles.profileFieldHint}>Для связи и записей</span>
                      </div>
                      {editingProfile ? (
                        <input
                          className={styles.profileFieldInput}
                          value={editFields.phone}
                          onChange={e => setEditFields(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+7 (___) ___-__-__"
                          type="tel"
                        />
                      ) : (
                        <span className={styles.profileFieldValue}>{user?.phone || profile?.phone || "—"}</span>
                      )}
                    </div>

                    <div className={styles.profileFieldRow}>
                      <div className={styles.profileFieldMeta}>
                        <span className={styles.profileFieldLabel}>Email</span>
                        <span className={styles.profileFieldHint}>Для уведомлений</span>
                      </div>
                      {editingProfile ? (
                        <input
                          className={styles.profileFieldInput}
                          value={editFields.email}
                          onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))}
                          placeholder="email@example.com"
                          type="email"
                          disabled
                        />
                      ) : (
                        <span className={styles.profileFieldValue}>{user?.email || profile?.email || "—"}</span>
                      )}
                    </div>

                    <div className={styles.profileFieldRow}>
                      <div className={styles.profileFieldMeta}>
                        <span className={styles.profileFieldLabel}>Статус клиники</span>
                        <span className={styles.profileFieldHint}>Привязка к базе Sadap</span>
                      </div>
                      {sadapPatientId ? (
                        <span className={styles.profileStatusGreen}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          Привязан · ID {sadapPatientId}
                        </span>
                      ) : (
                        <span className={styles.profileStatusGray}>Не привязан</span>
                      )}
                    </div>

                  </div>

                  {/* Save / Cancel */}
                  {editingProfile && (
                    <div className={styles.profileEditActions}>
                      <button className={styles.profileSaveBtn} onClick={saveProfile} disabled={savingProfile}>
                        {savingProfile ? "Сохранение..." : "Сохранить изменения"}
                      </button>
                      <button className={styles.profileCancelBtn} onClick={cancelEditProfile}>
                        Отмена
                      </button>
                    </div>
                  )}

                  {saveSuccess && (
                    <div className={styles.profileSaveSuccess}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Данные успешно сохранены
                    </div>
                  )}
                </div>

                {/* Clinic link form — only when not linked */}
                {!sadapPatientId && (
                  <div className={styles.clinicLinkCard}>
                    <div className={styles.clinicLinkIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </div>
                    <div className={styles.clinicLinkText}>
                      <h2 className={styles.clinicLinkTitle}>Привязать к базе клиники</h2>
                      <p className={styles.clinicLinkDesc}>
                        Введите данные, чтобы видеть записи, диагнозы и историю оплат из базы клиники.
                      </p>
                    </div>
                    <form onSubmit={handleVerify} className={styles.clinicLinkForm}>
                      <div className={styles.clinicInputRow}>
                        <div className={styles.clinicInputGroup}>
                          <label className={styles.clinicInputLabel}>ИИН</label>
                          <input type="text" placeholder="123456789012"
                            value={verifyForm.iin}
                            onChange={e => setVerifyForm(p => ({ ...p, iin: e.target.value }))}
                            className={styles.clinicInput} maxLength={12} pattern="\d{12}" required />
                        </div>
                        <div className={styles.clinicInputGroup}>
                          <label className={styles.clinicInputLabel}>Телефон</label>
                          <input type="tel" placeholder="+7 (___) ___-__-__"
                            value={verifyForm.phone}
                            onChange={e => setVerifyForm(p => ({ ...p, phone: e.target.value }))}
                            className={styles.clinicInput} required />
                        </div>
                        <div className={styles.clinicInputGroup}>
                          <label className={styles.clinicInputLabel}>Фамилия</label>
                          <input type="text" placeholder="Иванов"
                            value={verifyForm.lastname}
                            onChange={e => setVerifyForm(p => ({ ...p, lastname: e.target.value }))}
                            className={styles.clinicInput} required />
                        </div>
                      </div>
                      {verifyStatus === "error" && (
                        <p className={styles.clinicError}>{verifyError}</p>
                      )}
                      <button type="submit" className={styles.clinicVerifyBtn}
                        disabled={verifyStatus === "loading"}>
                        {verifyStatus === "loading" ? "Проверка..." : "Привязать профиль"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Upcoming appointments preview */}
                <h2 className={styles.sectionTitle} style={{ marginTop: 8 }}>Ближайшие записи</h2>
                {loadingAppointments ? (
                  <div className={styles.appointmentsLoading}>
                    <div className={styles.spinner} />
                    <p>Загрузка записей...</p>
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className={styles.noAppointments}>
                    <p>Нет предстоящих записей</p>
                    <Link href="/doctors" className={styles.bookButton}>Записаться к врачу</Link>
                  </div>
                ) : (
                  <>
                    <div className={styles.appointmentsGrid}>
                      {upcoming.map(a => (
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
                          <div className={styles.cardBody}>
                            <div className={styles.doctorRow}>
                              <div
                                className={styles.doctorAvatar}
                                style={!a.doctor_avatar_url ? { background: avatarColor(a.doctor_name), borderColor: "transparent" } : {}}
                              >
                                {a.doctor_avatar_url ? (
                                  <img src={a.doctor_avatar_url} alt={a.doctor_name} className={styles.doctorAvatarImg} />
                                ) : (
                                  <span className={styles.doctorAvatarInitials} style={{ color: "#fff" }}>{doctorInitials(a.doctor_name)}</span>
                                )}
                              </div>
                              <div className={styles.doctorInfo}>
                                <span className={styles.doctorLabel}>Лечащий врач</span>
                                <span className={styles.doctorName}>{a.doctor_name}</span>
                              </div>
                            </div>
                            {a.reason && (
                              <div className={styles.reasonBlock}>
                                <span className={styles.reasonLabel}>Причина обращения</span>
                                <span className={styles.reasonText}>{a.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link href="/appointments" className={styles.viewAllLink}>
                      Все записи →
                    </Link>
                  </>
                )}
              </>
            )}

            {/* ══ DIAGNOSES SECTION ════════════════════════════════════════ */}
            {activeSection === "diagnoses" && (
              <>
                <h1 className={styles.pageTitle}>Диагнозы</h1>
                {!sadapPatientId ? (
                  <div className={styles.noAppointments}>
                    <p>Привяжите профиль к базе клиники, чтобы видеть диагнозы</p>
                    <button className={styles.bookButton} onClick={() => setActiveSection("profile")}>
                      Привязать профиль
                    </button>
                  </div>
                ) : loadingDiagnoses ? (
                  <div className={styles.appointmentsLoading}>
                    <div className={styles.spinner} /><p>Загрузка...</p>
                  </div>
                ) : diagnoses.length === 0 ? (
                  <div className={styles.noAppointments}><p>Диагнозы не найдены</p></div>
                ) : (
                  <div className={styles.dataList}>
                    {diagnoses.map((d, i) => (
                      <div key={d.id || i} className={styles.dataCard}>
                        <div className={styles.dataCardHeader}>
                          <span className={styles.dataCardDate}>
                            {formatDate(d.date || d.created_at || d.diagnosis_date)}
                          </span>
                          {(d.code || d.icd_code) && (
                            <span className={styles.dataCardBadge}>{d.code || d.icd_code}</span>
                          )}
                        </div>
                        <p className={styles.dataCardTitle}>
                          {d.name || d.diagnosis || d.description || "Диагноз"}
                        </p>
                        {d.doctor_name && (
                          <p className={styles.dataCardSub}>Врач: {d.doctor_name}</p>
                        )}
                        {d.notes && (
                          <p className={styles.dataCardNotes}>{d.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══ PAYMENTS SECTION ═════════════════════════════════════════ */}
            {activeSection === "payments" && (
              <>
                <h1 className={styles.pageTitle}>История оплат</h1>
                {!sadapPatientId ? (
                  <div className={styles.noAppointments}>
                    <p>Привяжите профиль к базе клиники, чтобы видеть историю оплат</p>
                    <button className={styles.bookButton} onClick={() => setActiveSection("profile")}>
                      Привязать профиль
                    </button>
                  </div>
                ) : loadingPayments ? (
                  <div className={styles.appointmentsLoading}>
                    <div className={styles.spinner} /><p>Загрузка...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className={styles.noAppointments}><p>История оплат пуста</p></div>
                ) : (
                  <div className={styles.dataList}>
                    {payments.map((p, i) => (
                      <div key={p.id || i} className={styles.dataCard}>
                        <div className={styles.dataCardHeader}>
                          <span className={styles.dataCardDate}>
                            {formatDate(p.date || p.payment_date || p.created_at)}
                          </span>
                          {p.amount != null && (
                            <span className={styles.paymentAmount}>
                              {Number(p.amount).toLocaleString("ru-RU")} ₸
                            </span>
                          )}
                        </div>
                        <p className={styles.dataCardTitle}>
                          {p.service_name || p.description || p.name || "Оплата услуги"}
                        </p>
                        {(p.status || p.payment_status) && (
                          <span className={styles.paymentStatus}>
                            {p.status || p.payment_status}
                          </span>
                        )}
                        {p.doctor_name && (
                          <p className={styles.dataCardSub}>Врач: {p.doctor_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}


            {/* ══ BONUSES SECTION ══════════════════════════════════════════ */}
            {activeSection === "bonuses" && (
              <>
                <h1 className={styles.pageTitle}>Бонусы и баланс</h1>

                {/* Banner */}
                <div className={styles.bonusBanner} style={{ marginBottom: 20 }}>
                  <div className={styles.bonusBannerLeft}>
                    <span className={styles.bonusTierBadge}>{tierLabel}</span>
                    <div className={styles.bonusSpent}>
                      <span className={styles.bonusSpentLabel}>Потрачено всего</span>
                      <span className={styles.bonusSpentNum}>{tierSpent.toLocaleString("ru-RU")} ₸</span>
                    </div>
                    <div className={styles.bonusProgress}>
                      <div className={styles.bonusProgressTrack}>
                        <div className={styles.bonusProgressFill}
                          style={{ width: `${Math.min((tierSpent / tierNext) * 100, 100)}%` }} />
                      </div>
                      <span className={styles.bonusProgressHint}>
                        Ещё {(tierNext - tierSpent).toLocaleString("ru-RU")} ₸ до следующего уровня
                      </span>
                    </div>
                  </div>
                  <div className={styles.bonusBannerRight}>
                    <div className={styles.bonusRingWrap}>
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12"/>
                        <circle cx="55" cy="55" r="44" fill="none" stroke="#4ade80" strokeWidth="12"
                          strokeDasharray={`${bonusPoints > 0 ? Math.min((cashbackPoints / bonusPoints) * 276, 276) : 0} 276`}
                          strokeLinecap="round" strokeDashoffset="69" transform="rotate(-90 55 55)"/>
                      </svg>
                      <div className={styles.bonusRingInner}>
                        <span className={styles.bonusRingNum}>{bonusPoints.toLocaleString("ru-RU")}</span>
                        <span className={styles.bonusRingLabel}>баллов</span>
                      </div>
                    </div>
                    <div className={styles.bonusBreakdown}>
                      <div className={styles.bonusBreakdownRow}>
                        <span className={styles.bonusDot} style={{ background: "#4ade80" }} />
                        <span className={styles.bonusBreakdownLabel}>Кэшбэк</span>
                        <span className={styles.bonusBreakdownVal}>{cashbackPoints.toLocaleString("ru-RU")}</span>
                      </div>
                      <div className={styles.bonusBreakdownRow}>
                        <span className={styles.bonusDot} style={{ background: "rgba(255,255,255,0.4)" }} />
                        <span className={styles.bonusBreakdownLabel}>Остаток</span>
                        <span className={styles.bonusBreakdownVal}>{accountBalance != null ? Number(accountBalance).toLocaleString("ru-RU") + " ₸" : "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className={styles.bonusStatsRow}>
                  <div className={styles.bonusStatCard}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                    </svg>
                    <span className={styles.bonusStatLabel}>Остаток на счёте</span>
                    <span className={styles.bonusStatNum}>{accountBalance != null ? Number(accountBalance).toLocaleString("ru-RU") + " ₸" : "—"}</span>
                  </div>
                  <div className={styles.bonusStatCard}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span className={styles.bonusStatLabel}>Потрачено</span>
                    <span className={styles.bonusStatNum}>{tierSpent.toLocaleString("ru-RU")} ₸</span>
                  </div>
                  <div className={styles.bonusStatCard}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className={styles.bonusStatLabel}>Визитов</span>
                    <span className={styles.bonusStatNum}>{appointments.length || 0}</span>
                  </div>
                  <div className={styles.bonusStatCard}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span className={styles.bonusStatLabel}>Бонусных баллов</span>
                    <span className={styles.bonusStatNum}>{bonusPoints.toLocaleString("ru-RU")}</span>
                  </div>
                </div>

                {/* Full history */}
                <h2 className={styles.sectionTitle} style={{ marginTop: 24 }}>История бонусов</h2>
                <div className={styles.bonusHistoryList}>
                  {bonusHistory.map(item => (
                    <div key={item.id} className={styles.bonusHistoryRow}>
                      <div className={`${styles.bonusHistoryDot} ${item.type === "earn" ? styles.bonusHistoryEarn : styles.bonusHistorySpend}`} />
                      <div className={styles.bonusHistoryInfo}>
                        <span className={styles.bonusHistoryLabel}>{item.label}</span>
                        <span className={styles.bonusHistoryDate}>{formatDate(item.date)}</span>
                      </div>
                      <span className={`${styles.bonusHistoryPoints} ${item.type === "earn" ? styles.bonusHistoryEarnText : styles.bonusHistorySpendText}`}>
                        {item.points > 0 ? "+" : ""}{item.points} б
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
