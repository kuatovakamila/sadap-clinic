import styles from "./Hero.module.css";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Sadap Clinic — ваш партнер в гармоничной и полноценной жизни.
          </h1>
          <p className={styles.heroSubtitle}>
            Новое качество жизни!
          </p>

          <Link href="/experience" className={styles.heroButton}>
            <span className={styles.buttonText}>Записаться на прием</span>
          </Link>
        </div>

        <div className={styles.heroImageWrapper}>
          <Image
            src="/doctor-welcome.JPG"
            alt="Врач клиники"
            width={340}
            height={388}
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
