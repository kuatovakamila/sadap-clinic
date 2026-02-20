import styles from "./About.module.css";
import Image from "next/image";

const About = () => {
  return (
    <section className={styles.about}>
      <div className={styles.aboutContainer}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2 className={styles.aboutTitle}>О клинике</h2>
            <p className={styles.aboutDescription}>
              Наша Миссия - Предоставлять широкий спектр медицинских услуг для жителей Актау и области,
              обеспечивая качественное лечение через точную диагностику, высококвалифицированных врачей
              и современное оборудование
            </p>
            <button className={styles.aboutButton}>
              <span className={styles.buttonText}>ПОДРОБНЕЕ</span>
            </button>
          </div>
          <div className={styles.aboutImageWrapper}>
            <Image
              src="/o-clinike.JPG"
              alt="О клинике"
              width={500}
              height={350}
              className={styles.aboutImage}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

