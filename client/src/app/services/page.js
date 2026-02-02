"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const servicesData = [
  { id: 1, title: "Педиатрия", image: "/services-page/pediatrics.png", slug: "pediatriya" },
  { id: 2, title: "Кардиология", image: "/services-page/cardiology.png", slug: "" },
  { id: 3, title: "Неврология", image: "/services-page/neurology.png", slug: "" },
  { id: 4, title: "Гинекология", image: "/services-page/gynecology.png", slug: "ginekologiya" },
  { id: 5, title: "Эндокринология", image: "/services-page/endocrinology.png", slug: "endokrinologiya" },
  { id: 6, title: "Уролог", image: "/services-page/urology.png", slug: "urologiya" },
  { id: 7, title: "Терапия", image: "/services-page/therapy.png", slug: "terapiya" },
  { id: 8, title: "Дерматология", image: "/services-page/dermatology.png", slug: "dermatologiya" },
  { id: 9, title: "Ортопедия", image: "/services-page/orthopedics.png", slug: "ortopediya" },
];

const ServicesPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header 
        // navItems={["Главная", "Услуги", "Врачи", "O нас"]}
        showAccountButton={false}
        fixed={true}
      />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Наши услуги</h1>
          <p className={styles.heroSubtitle}>Наши услуги надежные и точные.</p>
        </div>

        <div className={styles.servicesContainer}>
          <div className={styles.servicesGrid}>
            {servicesData.map((service) => (
              service.slug ? (
                <Link key={service.id} href={`/services/${service.slug}`} className={styles.serviceCard}>
                  <div className={styles.serviceImage}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={130}
                      height={130}
                      className={styles.serviceImg}
                    />
                  </div>
                  <div className={styles.serviceContent}>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                  </div>
                </Link>
              ) : (
                <div key={service.id} className={styles.serviceCard}>
                  <div className={styles.serviceImage}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={130}
                      height={130}
                      className={styles.serviceImg}
                    />
                  </div>
                  <div className={styles.serviceContent}>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Service Details Section */}
      <section className={styles.detailsSection}>
        <div className={styles.detailsContainer}>
          <h2 className={styles.detailsTitle}>Гинекология</h2>
          <p className={styles.detailsPrice}>Цена: 12 000 тнг/консультацию</p>

          <div className={styles.detailsCards}>
            <div className={styles.detailCard}>
              <div className={styles.detailCardIcon}>
                <Image
                  src="/problem.png"
                  alt="Проблема"
                  width={64}
                  height={64}
                  className={styles.detailIcon}
                />
              </div>
              <h3 className={styles.detailCardTitle}>Проблема</h3>
              <p className={styles.detailCardText}>
                Гинеколог помогает женщинам на всех этапах жизни — от профилактических осмотров до лечения заболеваний репродуктивной системы.
              </p>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailCardIcon}>
                <Image
                  src="/appointment.png"
                  alt="Как проходит прием?"
                  width={64}
                  height={64}
                  className={styles.detailIcon}
                />
              </div>
              <h3 className={styles.detailCardTitle}>Как проходит прием?</h3>
              <p className={styles.detailCardText}>
                Врач проводит подробную консультацию, анализы и подбирает индивидуальное лечение.<br />
                Все обследования можно пройти в клинике в один день.
              </p>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailCardIcon}>
                <Image
                  src="/doctor-icon.png"
                  alt="Кто введет прием?"
                  width={64}
                  height={64}
                  className={styles.detailIcon}
                />
              </div>
              <h3 className={styles.detailCardTitle}>Кто введет прием?</h3>
              <p className={styles.detailCardText}>
                Д-р Анна Иванова, врач-гинеколог, кандидат медицинских наук — профиль врача →<br />
                Д-р Мария Соколова, акушер-гинеколог, специалист по УЗИ — профиль врача →
              </p>
            </div>
          </div>

          <button className={styles.appointmentBtn}>
            <span className={styles.appointmentBtnText}>ЗАПИСАТЬСЯ НА ПРИЕМ</span>
          </button>
        </div>
      </section>
 <Footer/>
      {/* Footer
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLeft}>
            <Image
              src="/logo.png"
              alt="Sadap Clinic"
              width={149}
              height={74}
              className={styles.footerLogo}
            />
            <p className={styles.footerTagline}>Радость. Здоровье. Успех!</p>
            <p className={styles.footerCopyright}>Все права защищены, 2024.</p>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>Услуги</a>
              <a href="#" className={styles.footerLink}>Врачи</a>
              <a href="#" className={styles.footerLink}>Отзывы</a>
              <a href="#" className={styles.footerLink}>О нас</a>
            </div>

            <div className={styles.footerContacts}>
              <a href="tel:+77023012796" className={styles.contactItem}>
                <Image
                  src="/phone.png"
                  alt="Phone"
                  width={24}
                  height={24}
                  className={styles.contactIcon}
                />
                <span className={styles.contactText}>+7 702 301 2796</span>
              </a>

              <a href="https://instagram.com/sadapclinic_kz" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className={styles.contactIcon}
                />
                <span className={styles.contactText}>@sadapclinic_kz</span>
              </a>

              <a href="mailto:support@sadapclinic.kz" className={styles.contactItem}>
                <Image
                  src="/mail.png"
                  alt="Email"
                  width={24}
                  height={24}
                  className={styles.contactIcon}
                />
                <span className={styles.contactText}>support@sadapclinic.kz</span>
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default ServicesPage;
