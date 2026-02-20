"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

// маппинг пунктов меню на ссылки
const getNavUrl = (item) => {
  const urlMap = {
    "Главная": "/",
    "Услуги": "/services",
    "Врачи": "/doctors",
    "Выбрать врача": "/doctors",
    "О клинике": "/reviews",
    "О нас": "/aboutUs",
    "O нас": "/aboutUs",
    "Личный кабинет": "/profile",
    "Записаться на прием": "/services",
  };
  return urlMap[item] || "#";
};

export default function Header({
  navItems = ["Записаться на прием", "Выбрать врача", "О клинике", "Личный кабинет"],
  showAccountButton = false,
  fixed = false,
  onAppointmentClick = null,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (item, e) => {
    console.log("Nav clicked:", item, "onAppointmentClick:", !!onAppointmentClick);
    if (item === "Записаться на прием" && onAppointmentClick) {
      e.preventDefault();
      closeMenu();
      onAppointmentClick();
    } else {
      closeMenu();
    }
  };

  return (
    <header className={`${styles.header} ${fixed ? styles.headerFixed : ""}`}>
      <div className={styles.headerContainer}>
        {/* ЛОГО (уменьшенный) */}
        <Link href="/" className={styles.logoWrapper} onClick={closeMenu}>
          <Image
            src="/image.png"
            alt="Sadap Clinic"
            width={150}
            height={60}
            className={styles.logo}
          />
        </Link>

        {/* БУРГЕР (иконка меню) */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <Image src="/menu.png" alt="Меню" width={24} height={24} />
        </button>

        {/* НАВИГАЦИЯ */}
        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ""}`}>
          <ul className={styles.navList}>
            {navItems.map((item, index) => (
              <li key={index} className={styles.navItem}>
                <Link
                  href={getNavUrl(item)}
                  className={styles.navLink}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Кнопка ЛК на десктопе */}
        {showAccountButton && (
          <Link href="/profile" className={styles.accountButton}>
            <span>Личный кабинет</span>
          </Link>
        )}
      </div>
    </header>
  );
}
