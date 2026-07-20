import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

const CONTACTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Адрес",
    value: "г. Актау, микрорайон 11А, 3",
    href: "https://yandex.kz/maps/29575/aktau/house/11a_shaghyn_audany_3/YUgYdwFgQU0PQFppfXp0dHRiYw==/?ll=51.160888%2C43.655817&z=16",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: "Записаться на приём",
    value: "+7 700 020-18-20",
    href: "tel:+77000201820",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    label: "Email",
    value: "support@sadapclinic.kz",
    href: "mailto:support@sadapclinic.kz",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    label: "Instagram",
    value: "@sadap_clinic",
    href: "https://instagram.com/sadap_clinic",
  },
];

export default function ContactsPage() {
  return (
    <div className={styles.page}>
      <Header fixed={true} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Свяжитесь с нами</p>
          <h1 className={styles.heroTitle}>Контакты</h1>
          <p className={styles.heroSub}>
            Мы всегда на связи — звоните, пишите или приходите в клинику лично.
          </p>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.container}>
          <div className={styles.mapGrid}>
            <div className={styles.mapWrap}>
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=51.160888%2C43.655817&z=16&pt=51.160888,43.655817,pm2rdm"
                className={styles.map}
                title="Карта расположения клиники"
                frameBorder="0"
              />
            </div>

            <div className={styles.contactsPanel}>
              {CONTACTS.map((c, i) => (
                <div key={i} className={styles.contactRow}>
                  <div className={styles.contactIcon}>{c.icon}</div>
                  <div className={styles.contactBody}>
                    <span className={styles.contactLabel}>{c.label}</span>
                    {c.href ? (
                      <a href={c.href} className={styles.contactValue}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                        {c.value}
                      </a>
                    ) : (
                      <span className={styles.contactValue}>{c.value}</span>
                    )}
                  </div>
                </div>
              ))}

              <Link href="/appointments" className={styles.ctaBtn}>
                Записаться онлайн
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
