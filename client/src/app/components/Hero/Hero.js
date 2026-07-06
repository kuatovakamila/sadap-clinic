import styles from "./Hero.module.css";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>

        {/* Left — text */}
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>Клиника №1 в Актау</span>

          <h1 className={styles.heroTitle}>
            Диагностика и лечение<br />в одной клинике
          </h1>

          <p className={styles.heroSubtitle}>
            Более 20 направлений: терапия, УЗИ, ЭКГ, педиатрия, гинекология и узкая специализация — всё под одной крышей
          </p>

          <Link href="/appointments/book" className={styles.heroButton}>
            Записаться на приём
          </Link>

          {/* Trust stats */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>10+</span>
              <span className={styles.heroStatLabel}>лет на рынке</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>5 000+</span>
              <span className={styles.heroStatLabel}>пациентов в год</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>20+</span>
              <span className={styles.heroStatLabel}>направлений</span>
            </div>
          </div>
        </div>

        {/* Right — photo */}
        <div className={styles.heroImageWrapper}>
          <div className={styles.imageCard}>
            <Image
              src="/doctor-welcome.JPG"
              alt="Врач клиники Sadap"
              width={360}
              height={420}
              className={styles.heroImage}
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
