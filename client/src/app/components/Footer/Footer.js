import styles from "./Footer.module.css";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLeft}>
          <div className={styles.logoSection}>
            <Image
              src="/image.png"
              alt="Sadap Clinic"
              width={120}
              height={40}
              className={styles.logo}
            />
            <p className={styles.tagline}>Радость. Здоровье. Успех!</p>
          </div>

          <button className={styles.feedbackButton}>
            Обратная связь
          </button>
        </div>

        <div className={styles.footerRight}>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Записаться на прием</a>
            <a href="#" className={styles.footerLink}>Выбрать врача</a>
            <a href="#" className={styles.footerLink}>Личный кабинет</a>
            <a href="#" className={styles.footerLink}>Расположение</a>
          </div>

          <div className={styles.footerContacts}>
            <a href="tel:+77023012796" className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <Image
                  src="/phone.png"
                  alt="Phone"
                  width={24}
                  height={24}
                  className={styles.contactIconImage}
                />
              </div>
              <span className={styles.contactText}>+7 702 301 2796</span>
            </a>

            <a href="https://instagram.com/sadapclinic_kz" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className={styles.contactIconImage}
                />
              </div>
              <span className={styles.contactText}>@sadapclinic_kz</span>
            </a>

            <a href="mailto:support@sadapclinic.kz" className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <Image
                  src="/mail.png"
                  alt="Email"
                  width={24}
                  height={24}
                  className={styles.contactIconImage}
                />
              </div>
              <span className={styles.contactText}>support@sadapclinic.kz</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

