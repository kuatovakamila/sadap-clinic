"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const BRAND = "#0c3465";

const CATEGORIES = [
  { id: "all",       label: "Все программы",    color: BRAND },
  { id: "children",  label: "Для детей",        color: BRAND },
  { id: "mothers",   label: "Для мам",          color: BRAND },
  { id: "pregnancy", label: "Беременность",     color: BRAND },
  { id: "women",     label: "Женское здоровье", color: BRAND },
  { id: "gift",      label: "Подарочные",       color: BRAND },
];

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const PRICE_OPTIONS = [
  { value: "low",  label: "до 20 000 тнг" },
  { value: "mid",  label: "20 000 — 40 000 тнг" },
  { value: "high", label: "от 40 000 тнг" },
];

const SPECIALIST_OPTIONS = [
  { value: "Гинеколог",        label: "Гинеколог" },
  { value: "Педиатр",          label: "Педиатр" },
  { value: "Терапевт",         label: "Терапевт" },
  { value: "Иммунолог",        label: "Иммунолог" },
  { value: "Невролог",         label: "Невролог" },
  { value: "Эндокринолог",     label: "Эндокринолог" },
  { value: "Маммолог",         label: "Маммолог" },
  { value: "Кардиолог",        label: "Кардиолог" },
  { value: "Диетолог",         label: "Диетолог" },
  { value: "Генетик",          label: "Генетик" },
];

const plans = [
  { id: 69, title: "Частые простуды",           category: "children",  price: 18000,
    tagline: "Укрепление иммунитета",
    includes: ["Педиатр", "Иммунолог", "Общий анализ крови", "Иммунограмма"] },
  { id: 70, title: "Идем в лагерь",             category: "children",  price: 12000,
    tagline: "Подготовка к отдыху",
    includes: ["Педиатр", "Общий анализ крови", "Анализ мочи", "Справка 079/у"] },
  { id: 71, title: "Часто болеющий ребенок",    category: "children",  price: 25000,
    tagline: "Комплексная диагностика",
    includes: ["Педиатр", "Иммунолог", "ЛОР", "Иммунограмма", "ОАК", "Анализ мочи"] },
  { id: 72, title: "Первый прикорм",            category: "children",  price: 10000,
    tagline: "Правильное начало питания",
    includes: ["Педиатр", "Диетолог", "Индивидуальный план питания"] },
  { id: 73, title: "Растем правильно",          category: "children",  price: 22000,
    tagline: "Полноценное развитие",
    includes: ["Педиатр", "Невролог", "Хирург-ортопед", "ОАК", "Анализ мочи"],
    recommended: true, badge: "Популярный" },
  { id: 74, title: "Молодая мама",              category: "mothers",   price: 30000,
    tagline: "Восстановление после родов",
    includes: ["Гинеколог", "Терапевт", "УЗИ малого таза", "ОАК", "Биохимия"],
    recommended: true, badge: "Популярный" },
  { id: 75, title: "Добро пожаловать малыш",    category: "mothers",   price: 15000,
    tagline: "Первый осмотр новорождённого",
    includes: ["Педиатр", "Неонатолог", "Осмотр новорождённого", "Консультация"] },
  { id: 81, title: "После родов",               category: "mothers",   price: 32000,
    tagline: "Комплексное восстановление",
    includes: ["Гинеколог", "Терапевт", "УЗИ малого таза", "УЗИ щитовидной железы", "ОАК", "Гормоны"] },
  { id: 79, title: "Буду мамой",                category: "pregnancy", price: 45000,
    tagline: "С первого триместра",
    includes: ["Гинеколог", "Генетик", "УЗИ", "TORCH-инфекции", "Гормоны ЩЖ", "ОАК"],
    recommended: true, badge: "Популярный" },
  { id: 83, title: "Сложности с беременностью", category: "pregnancy", price: 65000,
    tagline: "Расширенная программа",
    includes: ["Гинеколог", "Репродуктолог", "Генетик", "Иммунолог", "УЗИ", "Расширенные анализы"] },
  { id: 77, title: "Женское здоровье",          category: "women",     price: 20000,
    tagline: "Базовый чек-ап",
    includes: ["Гинеколог", "УЗИ малого таза", "Онкоцитология", "ОАК"],
    recommended: true, badge: "Популярный" },
  { id: 78, title: "Женское здоровье на 360°",  category: "women",     price: 55000,
    tagline: "Расширенное обследование",
    includes: ["Гинеколог", "Эндокринолог", "Маммолог", "УЗИ", "Гормоны", "Онкомаркеры", "Биохимия"] },
  { id: 80, title: "Женское здоровье 40+",      category: "women",     price: 60000,
    tagline: "Программа зрелого возраста",
    includes: ["Гинеколог", "Эндокринолог", "Кардиолог", "Маммолог", "УЗИ", "Гормоны", "Онкомаркеры", "Денситометрия"] },
  { id: 82, title: "Забота о дочери",           category: "women",     price: 16000,
    tagline: "Для девочек до 18 лет",
    includes: ["Детский гинеколог", "Педиатр", "ОАК", "Анализ мочи"] },
  { id: 76, title: "Подарок молодой маме",      category: "gift",      price: 35000,
    tagline: "Всё самое важное в одном",
    includes: ["Гинеколог", "Косметолог", "Диетолог", "Анализы крови", "Подарочный сертификат"],
    recommended: true, badge: "Популярный" },
];

function fmtPrice(n) { return n.toLocaleString("ru-RU"); }

/* ── Category icon ── */
const PlanIcon = ({ category, color }) => (
  <div className={styles.iconWrap} style={{ background: color + "18" }}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {category === "children" && <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
      </>}
      {category === "mothers" && <>
        <path d="M12 21C7 17 3 13.5 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4.5-4 8-9 12z" />
      </>}
      {category === "pregnancy" && <>
        <ellipse cx="12" cy="15" rx="5" ry="6" />
        <path d="M12 9V6" />
        <path d="M9.5 11.5c-1 1-1.5 2.5-1.5 3.5" />
      </>}
      {category === "women" && <>
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v6M9 17h6" />
      </>}
      {category === "gift" && <>
        <rect x="3" y="9" width="18" height="12" rx="1.5" />
        <rect x="2" y="5" width="20" height="5" rx="1.5" />
        <path d="M12 21V5" />
        <path d="M12 5C10 2 6 3 6 5h6M12 5c2-3 6-2 6 0h-6" />
      </>}
    </svg>
  </div>
);

/* ── Check / dash ── */
const Check = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.12" />
    <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Dash = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M5 8h6" stroke="#d1d5db" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* ── Filter dropdown ── */
const FilterDropdown = ({ label, options, selected, onToggle, onClear }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = selected.length;

  return (
    <div className={styles.filterWrap} ref={ref}>
      <button
        className={`${styles.filterBtn} ${count > 0 ? styles.filterBtnActive : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        {count > 0 && <span className={styles.filterCount}>{count}</span>}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`${styles.filterChevron} ${open ? styles.filterChevronOpen : ""}`}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.filterDropdown}>
          <div className={styles.filterDropdownScroll}>
            {options.map((opt) => (
              <label key={opt.value} className={styles.filterOption}>
                <span className={`${styles.filterCheckbox} ${selected.includes(opt.value) ? styles.filterCheckboxChecked : ""}`}>
                  {selected.includes(opt.value) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 2.5" stroke="#fff" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  hidden
                  checked={selected.includes(opt.value)}
                  onChange={() => onToggle(opt.value)}
                />
                <span className={styles.filterOptionLabel}>{opt.label}</span>
              </label>
            ))}
          </div>
          {count > 0 && (
            <button className={styles.filterClearBtn} onClick={onClear}>
              Сбросить
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Plan card ── */
const PlanCard = ({ plan, allFeatures, isActive, onClick, onBuy }) => {
  const cat = CAT[plan.category];
  return (
    <div
      className={`${styles.card} ${plan.recommended ? styles.cardFeatured : ""} ${isActive ? styles.cardActive : ""}`}
      style={{ "--accent": cat.color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {plan.recommended && (
        <div className={styles.cardBadge} style={{ background: cat.color }}>
          {plan.badge}
        </div>
      )}

      <PlanIcon category={plan.category} color={cat.color} />

      <h3 className={styles.cardTitle}>{plan.title}</h3>
      <p className={styles.cardTagline}>{plan.tagline}</p>

      <div className={styles.cardPrice}>
        <span className={styles.cardPriceNum}>{fmtPrice(plan.price)}</span>
        <span className={styles.cardPriceCur}> тнг</span>
      </div>

      <button
        className={`${styles.cardBtn} ${plan.recommended ? styles.cardBtnFilled : styles.cardBtnOutlined}`}
        style={plan.recommended
          ? { background: cat.color, borderColor: cat.color }
          : { color: cat.color, borderColor: cat.color }}
        onClick={(e) => { e.stopPropagation(); onBuy(plan); }}
      >
        Выбрать
      </button>

      <ul className={styles.featureList}>
        {allFeatures.map((feat, i) => {
          const has = plan.includes.includes(feat);
          return (
            <li key={i} className={`${styles.featItem} ${!has ? styles.featMissing : ""}`}>
              {has ? <Check color={cat.color} /> : <Dash />}
              <span>{feat}</span>
            </li>
          );
        })}
      </ul>

      <span className={styles.compareLink} style={{ color: cat.color }}>
        {isActive ? "Скрыть сравнение" : "Сравнить программы →"}
      </span>
    </div>
  );
};

/* ── Comparison table (modal) ── */
const CompareTable = ({ category, activePlanId, onBuy }) => {
  const cat = CAT[category];
  const catPlans = plans.filter((p) => p.category === category);
  const features = [...new Set(catPlans.flatMap((p) => p.includes))];

  return (
    <div className={styles.compareWrap} style={{ "--accent": cat.color }}>
      <div className={styles.compareHead}>
        <span className={styles.compareHeadTitle}>Сравнение программ — {cat.label}</span>
      </div>
      <div className={styles.compareScroll}>
        <table className={styles.compareTable}>
          <colgroup>
            <col style={{ minWidth: 170 }} />
            {catPlans.map((p) => <col key={p.id} style={{ minWidth: 150 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className={`${styles.cTh} ${styles.cSticky}`} />
              {catPlans.map((p) => (
                <th key={p.id}
                  className={`${styles.cTh} ${p.id === activePlanId ? styles.cThActive : ""}`}>
                  {p.recommended && (
                    <span className={styles.cBadge} style={{ color: cat.color, background: cat.color + "18" }}>
                      {p.badge}
                    </span>
                  )}
                  <div className={styles.cThName}>{p.title}</div>
                  <div className={styles.cThPrice}>{fmtPrice(p.price)} тнг</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat, i) => (
              <tr key={i} className={styles.cRow}>
                <td className={`${styles.cFeatName} ${styles.cSticky}`}>{feat}</td>
                {catPlans.map((p) => (
                  <td key={p.id}
                    className={`${styles.cCell} ${p.id === activePlanId ? styles.cCellActive : ""}`}>
                    {p.includes.includes(feat) ? <Check color={cat.color} /> : <Dash />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={`${styles.cFeatName} ${styles.cSticky}`} />
              {catPlans.map((p) => (
                <td key={p.id} className={styles.cCell}>
                  <button className={styles.cBtn}
                    style={{ background: cat.color }}
                    onClick={() => onBuy(p)}>
                    Выбрать
                  </button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

/* ── Kaspi payment modal ── */
const KaspiModal = ({ plan, onClose }) => {
  const [step, setStep] = useState("checkout");

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      window.open("https://kaspi.kz", "_blank");
      setStep("redirect");
    }, 1800);
  };

  return (
    <div className={styles.kaspiOverlay} onClick={onClose}>
      <div className={styles.kaspiModal} onClick={(e) => e.stopPropagation()}>

        {/* header */}
        <div className={styles.kaspiHeader}>
          <svg className={styles.kaspiLogo} viewBox="0 0 90 28" fill="none">
            <text x="0" y="22" fontFamily="Arial, sans-serif" fontWeight="800"
              fontSize="24" fill="#fff" letterSpacing="-0.5">kaspi</text>
          </svg>
          <button className={styles.kaspiClose} onClick={onClose} aria-label="Закрыть">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="rgba(255,255,255,0.8)"
                strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {step === "checkout" && (
          <div className={styles.kaspiBody}>
            <p className={styles.kaspiLabel}>Оплата программы обследований</p>
            <h3 className={styles.kaspiPlanName}>{plan.title}</h3>
            <p className={styles.kaspiPlanSub}>{plan.tagline}</p>

            <div className={styles.kaspiDivider} />

            <div className={styles.kaspiRow}>
              <span className={styles.kaspiRowLabel}>Программа</span>
              <span className={styles.kaspiRowVal}>{plan.title}</span>
            </div>
            <div className={styles.kaspiRow}>
              <span className={styles.kaspiRowLabel}>Клиника</span>
              <span className={styles.kaspiRowVal}>Садап Клиник</span>
            </div>

            <div className={styles.kaspiTotal}>
              <span className={styles.kaspiTotalLabel}>Итого</span>
              <span className={styles.kaspiTotalNum}>{fmtPrice(plan.price)} ₸</span>
            </div>

            <button className={styles.kaspiPayBtn} onClick={handlePay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8"/>
                <path d="M2 10h20" stroke="white" strokeWidth="1.8"/>
              </svg>
              Оплатить через Kaspi
            </button>

            <p className={styles.kaspiFootnote}>
              Безопасный переход на kaspi.kz — ваши данные защищены
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className={styles.kaspiBodyCenter}>
            <div className={styles.kaspiSpinner} />
            <p className={styles.kaspiProcessing}>Переходим на kaspi.kz…</p>
          </div>
        )}

        {step === "redirect" && (
          <div className={styles.kaspiBodyCenter}>
            <div className={styles.kaspiSuccessIcon}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#E30613" fillOpacity="0.1"/>
                <path d="M10 18l6 6 10-10" stroke="#E30613" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.kaspiProcessing}>Страница Kaspi открыта в новой вкладке</p>
            <button className={styles.kaspiCloseBtn} onClick={onClose}>Закрыть</button>
          </div>
        )}

      </div>
    </div>
  );
};

/* ── Arrow button ── */
const ArrowBtn = ({ dir, onClick }) => (
  <button
    className={`${styles.arrowBtn} ${dir === "left" ? styles.arrowLeft : styles.arrowRight}`}
    onClick={onClick}
    aria-label={dir === "left" ? "Назад" : "Вперёд"}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {dir === "left"
        ? <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      }
    </svg>
  </button>
);

/* ── Page ── */
export default function TariffsPage() {
  const [activeTab, setActiveTab]           = useState("all");
  const [activePlan, setActivePlan]         = useState(null);
  const [priceFilters, setPriceFilters]     = useState([]);
  const [specFilters, setSpecFilters]       = useState([]);
  const [kaspiPlan, setKaspiPlan]           = useState(null);
  const gridRef = useRef(null);

  const scroll = (dir) => {
    if (!gridRef.current) return;
    gridRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  const togglePrice = (val) =>
    setPriceFilters((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const toggleSpec = (val) =>
    setSpecFilters((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const featuresForCategory = (catId) =>
    [...new Set(plans.filter((p) => p.category === catId).flatMap((p) => p.includes))];

  const byTab = activeTab === "all"
    ? plans.filter((p) => p.recommended)
    : plans.filter((p) => p.category === activeTab);

  const displayed = byTab.filter((plan) => {
    if (priceFilters.length > 0) {
      const ok = priceFilters.some((r) => {
        if (r === "low")  return plan.price < 20000;
        if (r === "mid")  return plan.price >= 20000 && plan.price <= 40000;
        if (r === "high") return plan.price > 40000;
        return true;
      });
      if (!ok) return false;
    }
    if (specFilters.length > 0) {
      if (!specFilters.some((s) => plan.includes.includes(s))) return false;
    }
    return true;
  });

  const handleCardClick = (plan) => setActivePlan(activePlan?.id === plan.id ? null : plan);
  const closeModal = () => setActivePlan(null);

  useEffect(() => {
    if (!activePlan) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activePlan]);

  useEffect(() => { setActivePlan(null); }, [activeTab]);

  const hasFilters = priceFilters.length > 0 || specFilters.length > 0;

  return (
    <div className={styles.page}>
      <Header showAccountButton={true} fixed={true} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
        <div className={styles.heroLeft}>
          <p className={styles.heroEyebrow}>Программы обследований</p>
          <h1 className={styles.heroTitle}>
            Готовые программы<br />для вашего здоровья
          </h1>
          <p className={styles.heroSub}>
            Выберите подходящий комплекс обследований и получите доступ к качественной медицинской помощи
          </p>
          <div className={styles.heroBenefits}>
            <div className={styles.heroBenefit}>
              <div className={styles.heroBenefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Широкое покрытие<br/>медицинских услуг</span>
            </div>
            <div className={styles.heroBenefit}>
              <div className={styles.heroBenefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                </svg>
              </div>
              <span>Без скрытых<br/>платежей</span>
            </div>
            <div className={styles.heroBenefit}>
              <div className={styles.heroBenefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/>
                </svg>
              </div>
              <span>Быстрое<br/>оформление</span>
            </div>
            <div className={styles.heroBenefit}>
              <div className={styles.heroBenefitIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 16z"/>
                </svg>
              </div>
              <span>Поддержка<br/>24/7</span>
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.heroVisual}>
            {/* large teal circle */}
            <div className={styles.heroCircleLg} />
            {/* stethoscope SVG */}
            <svg className={styles.heroStethoscope} viewBox="0 0 120 170" fill="none">
              {/* earpieces */}
              <circle cx="36" cy="18" r="8" stroke="#0c3465" strokeWidth="3.5" fill="white"/>
              <circle cx="72" cy="18" r="8" stroke="#0c3465" strokeWidth="3.5" fill="white"/>
              {/* Y-connector */}
              <path d="M36 26 L36 48 Q36 56 54 56 Q72 56 72 48 L72 26" stroke="#0c3465" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
              {/* main tube curves down */}
              <path d="M54 56 Q54 90 82 104 Q102 115 102 134 Q102 155 82 161 Q62 167 52 153 Q44 141 52 131" stroke="#0c3465" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
              {/* chest piece */}
              <circle cx="44" cy="128" r="13" stroke="#0c3465" strokeWidth="3.5" fill="white"/>
              <circle cx="44" cy="128" r="5" fill="#0c3465" fillOpacity="0.2"/>
            </svg>
            {/* floating heart */}
            <div className={styles.heroHeart}>
              <svg viewBox="0 0 60 54" fill="none">
                <path d="M30 50S5 34 5 18A14 14 0 0 1 30 10 14 14 0 0 1 55 18C55 34 30 50 30 50Z" fill="#0c3465" fillOpacity="0.15" stroke="#0c3465" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* small pill card */}
            <div className={styles.heroStatBadge}>
              <span className={styles.heroStatNum}>15+</span>
              <span className={styles.heroStatText}>программ</span>
            </div>
            {/* dots */}
            <div className={styles.heroDot1} />
            <div className={styles.heroDot2} />
            <div className={styles.heroDot3} />
          </div>
        </div>
        </div>
      </div>

      <main className={styles.main}>
        {/* tabs */}
        <div className={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.tab} ${activeTab === cat.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* filters */}
        <div className={styles.filtersRow}>
          <FilterDropdown
            label="Цена"
            options={PRICE_OPTIONS}
            selected={priceFilters}
            onToggle={togglePrice}
            onClear={() => setPriceFilters([])}
          />
          <FilterDropdown
            label="Специалисты"
            options={SPECIALIST_OPTIONS}
            selected={specFilters}
            onToggle={toggleSpec}
            onClear={() => setSpecFilters([])}
          />
          {hasFilters && (
            <button className={styles.filterResetAll}
              onClick={() => { setPriceFilters([]); setSpecFilters([]); }}>
              Сбросить всё
            </button>
          )}
        </div>

        {/* cards */}
        <div className={styles.gridWrapper}>
          <ArrowBtn dir="left" onClick={() => scroll("left")} />
          <div className={styles.grid} ref={gridRef}>
            {displayed.length > 0 ? displayed.map((plan) => {
              const features = activeTab === "all"
                ? plan.includes
                : featuresForCategory(plan.category);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  allFeatures={features}
                  isActive={activePlan?.id === plan.id}
                  onClick={() => handleCardClick(plan)}
                  onBuy={setKaspiPlan}
                />
              );
            }) : (
              <div className={styles.emptyState}>
                Нет программ, подходящих под выбранные фильтры
              </div>
            )}
          </div>
          <ArrowBtn dir="right" onClick={() => scroll("right")} />
        </div>

        {/* modal */}
        {activePlan && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Закрыть">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <CompareTable category={activePlan.category} activePlanId={activePlan.id} onBuy={setKaspiPlan} />
            </div>
          </div>
        )}
      </main>

      <Footer />

      {kaspiPlan && (
        <KaspiModal plan={kaspiPlan} onClose={() => setKaspiPlan(null)} />
      )}
    </div>
  );
}
