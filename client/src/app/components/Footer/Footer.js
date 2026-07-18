import styles from "./Footer.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>

        {/* Left — logo + tagline + button */}
        <div className={styles.footerLeft}>
          <Link href="/" className={styles.logoWrap}>
            <Image
              src="/SADAP_ just logo.png"
              alt="Sadap Clinic"
              width={44}
              height={44}
              className={styles.logo}
            />
            <span className={styles.logoName}>Sadap Clinic</span>
          </Link>
          <p className={styles.tagline}>Радость. Здоровье. Успех.</p>
          <a href="mailto:support@sadapclinic.kz" className={styles.feedbackButton}>
            Обратная связь
          </a>
        </div>

        {/* Center + Right wrapped for mobile */}
        <div className={styles.footerCols}>
          {/* Center — nav links */}
          <div className={styles.footerCol}>
            <p className={styles.colTitle}>Навигация</p>
            <div className={styles.footerLinks}>
              <Link href="/services" className={styles.footerLink}>Записаться на приём</Link>
              <Link href="/doctors"  className={styles.footerLink}>Выбрать врача</Link>
              <Link href="/tariffs"  className={styles.footerLink}>Программы</Link>
              <Link href="/profile"  className={styles.footerLink}>Личный кабинет</Link>
              <Link href="/contacts" className={styles.footerLink}>Контакты</Link>
            </div>
          </div>

          {/* Right — contacts */}
          <div className={styles.footerCol}>
            <p className={styles.colTitle}>Контакты</p>
            <div className={styles.footerContacts}>
              <a href="tel:+77000201820" className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 19z"/>
                  </svg>
                </span>
                +7 700 020 1820
              </a>

              <a href="https://instagram.com/sadapclinic_kz" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                @sadapclinic_kz
              </a>

              <a href="mailto:support@sadapclinic.kz" className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 7l10 7 10-7"/>
                  </svg>
                </span>
                support@sadapclinic.kz
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} Sadap Clinic. Все права защищены.</span>
      </div>
    </footer>
  );
};

export default Footer;
