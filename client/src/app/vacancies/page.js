"use client";
import { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const VACANCIES = [
  {
    id: 1,
    title: "Педиатр",
    department: "Педиатрия",
    type: "Полная занятость",
    experience: "От 3 лет",
    salary: "от 350 000 тнг",
    description: "Ищем опытного педиатра для работы с детьми от 0 до 18 лет. Прием пациентов, диагностика, составление планов лечения.",
    requirements: ["Высшее медицинское образование", "Действующий сертификат педиатра", "Опыт работы от 3 лет", "Коммуникабельность и любовь к детям"],
    hot: true,
  },
  {
    id: 2,
    title: "Акушер-гинеколог",
    department: "Гинекология",
    type: "Полная занятость",
    experience: "От 5 лет",
    salary: "от 450 000 тнг",
    description: "Требуется квалифицированный акушер-гинеколог для ведения беременности, приёма пациентов и проведения УЗИ.",
    requirements: ["Высшее медицинское образование", "Специализация акушерство и гинекология", "Опыт ведения беременности", "Навыки УЗИ-диагностики"],
    hot: true,
  },
  {
    id: 3,
    title: "Медицинская сестра",
    department: "Общий уход",
    type: "Полная занятость",
    experience: "От 1 года",
    salary: "от 180 000 тнг",
    description: "Ассистирование врачам на приёме, выполнение назначений, ведение медицинской документации, забор анализов.",
    requirements: ["Среднее медицинское образование", "Действующий сертификат медсестры", "Внимательность и аккуратность"],
    hot: false,
  },
  {
    id: 4,
    title: "Администратор клиники",
    department: "Административный отдел",
    type: "Полная занятость",
    experience: "Без опыта",
    salary: "от 150 000 тнг",
    description: "Встреча пациентов, запись на приём, ответы на звонки, работа с медицинской системой, консультирование по услугам клиники.",
    requirements: ["Грамотная речь", "Знание ПК", "Стрессоустойчивость", "Опыт работы с людьми приветствуется"],
    hot: false,
  },
  {
    id: 5,
    title: "Невролог",
    department: "Неврология",
    type: "Частичная занятость",
    experience: "От 3 лет",
    salary: "от 300 000 тнг",
    description: "Приём пациентов с неврологическими заболеваниями, диагностика, назначение лечения, ведение документации.",
    requirements: ["Высшее медицинское образование", "Сертификат невролога", "Опыт работы от 3 лет"],
    hot: false,
  },
  {
    id: 6,
    title: "УЗИ-специалист",
    department: "Диагностика",
    type: "Полная занятость",
    experience: "От 2 лет",
    salary: "от 380 000 тнг",
    description: "Проведение ультразвуковых исследований органов брюшной полости, малого таза, щитовидной железы, сосудов.",
    requirements: ["Медицинское образование", "Сертификат УЗИ-диагностики", "Опыт работы от 2 лет", "Знание современного оборудования"],
    hot: true,
  },
];

const VacancyModal = ({ vacancy, onClose }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <button className={styles.modalClose} onClick={onClose}>×</button>
      <div className={styles.modalHeader}>
        {vacancy.hot && <span className={styles.hotBadge}>Срочно</span>}
        <h2 className={styles.modalTitle}>{vacancy.title}</h2>
        <p className={styles.modalDept}>{vacancy.department}</p>
      </div>
      <div className={styles.modalMeta}>
        <div className={styles.metaItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          {vacancy.type}
        </div>
        <div className={styles.metaItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          {vacancy.experience}
        </div>
        <div className={styles.metaItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
          </svg>
          {vacancy.salary}
        </div>
      </div>
      <p className={styles.modalDesc}>{vacancy.description}</p>
      <div className={styles.modalReqs}>
        <p className={styles.modalReqsTitle}>Требования</p>
        <ul className={styles.reqList}>
          {vacancy.requirements.map((r, i) => (
            <li key={i} className={styles.reqItem}>
              <div className={styles.reqDot} />
              {r}
            </li>
          ))}
        </ul>
      </div>
      <a href="mailto:support@sadapclinic.kz?subject=Отклик на вакансию: " className={styles.applyBtn}>
        Откликнуться на вакансию
      </a>
    </div>
  </div>
);

export default function VacanciesPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.page}>
      <Header fixed={true} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Карьера</p>
          <h1 className={styles.heroTitle}>Вакансии в Садап Клиник</h1>
          <p className={styles.heroSub}>
            Мы ищем профессионалов, которые разделяют нашу миссию — качественная
            медицина и забота о каждом пациенте. Присоединяйтесь к нашей команде.
          </p>
          <div className={styles.heroBadges}>
            <div className={styles.heroBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Официальное трудоустройство
            </div>
            <div className={styles.heroBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Конкурентная зарплата
            </div>
            <div className={styles.heroBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c3465" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              Профессиональный рост
            </div>
          </div>
        </div>
      </section>

      {/* Vacancies list */}
      <main className={styles.main}>
        <div className={styles.container}>
          <p className={styles.count}>Открытых вакансий: <strong>{VACANCIES.length}</strong></p>
          <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {VACANCIES.map(v => (
              <div key={v.id} className={`${styles.card} ${v.hot ? styles.cardHot : ""}`}>
                {v.hot && <div className={styles.cardHotBadge}>Срочно</div>}
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      <line x1="12" y1="12" x2="12" y2="16"/>
                      <line x1="10" y1="14" x2="14" y2="14"/>
                    </svg>
                  </div>
                  <span className={styles.cardDept}>{v.department}</span>
                </div>
                <h3 className={styles.cardTitle}>{v.title}</h3>
                <p className={styles.cardDesc}>{v.description.slice(0, 100)}...</p>
                <div className={styles.cardMeta}>
                  <span className={styles.cardMetaItem}>{v.type}</span>
                  <span className={styles.cardMetaItem}>{v.experience}</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardSalary}>{v.salary}</span>
                  <button className={styles.cardBtn} onClick={() => setSelected(v)}>
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            <div className={styles.ctaLeft}>
              <h2 className={styles.ctaTitle}>Не нашли подходящую вакансию?</h2>
              <p className={styles.ctaSub}>Отправьте резюме — мы рассмотрим его при открытии новых позиций</p>
            </div>
            <a href="mailto:support@sadapclinic.kz?subject=Резюме" className={styles.ctaBtn}>
              Отправить резюме
            </a>
          </div>
        </div>
      </main>

      <Footer />

      {selected && <VacancyModal vacancy={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
