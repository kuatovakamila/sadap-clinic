import styles from "./WhyChooseUs.module.css";
import Image from "next/image";

const features = [
  { title: "Лучшие врачи в регионе", icon: "/best.png" },
  { title: "Безупречная чистота", icon: "/clean.png" },
  { title: "Современное оборудование", icon: "/modern-equipment.png" },
  { title: "Внимательное отношение", icon: "/attention-to-clients.png" }
];

const WhyChooseUs = () => {
  return (
    <section className={styles.whyChooseUs}>
      <div className={styles.container}>
        <h2 className={styles.title}>Почему выбирают нас ?</h2>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={80}
                  height={80}
                  className={styles.featureImage}
                />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs

