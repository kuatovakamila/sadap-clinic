"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const getNavUrl = (item) => {
  const urlMap = {
    "Главная":             "/",
    "Услуги":              "/services",
    "Врачи":               "/doctors",
    "Выбрать врача":       "/doctors",
    "О клинике":           "/reviews",
    "О нас":               "/aboutUs",
    "Записаться на прием": "/services",
    "Программы":              "/tariffs",
    "Отзывы":              "/reviews-page",
    "Вакансии":            "/vacancies",
    "Check-up":            "/tariffs",
    "Контакты":            "/contacts",
  };
  return urlMap[item] || "#";
};

const NAV_ICONS = {
  "Записаться на прием": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  "Выбрать врача": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>
    </svg>
  ),
  "О клинике": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>
  ),
  "Программы": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>
  ),
  "Отзывы": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  "Вакансии": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  "Check-up": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4"/>
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
    </svg>
  ),
  "Контакты": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

export default function Header({
  navItems = ["Записаться на прием", "Выбрать врача", "О клинике", "Check-up", "Программы", "Отзывы", "Вакансии", "Контакты"],
  fixed = false,
  onAppointmentClick = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu  = () => setIsOpen(false);

  const handleNavClick = (item, e) => {
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

        {/* Logo */}
        <Link href="/" className={styles.logoWrapper} onClick={closeMenu}>
          <Image
            src="/SADAP_ just logo.png"
            alt="Sadap Clinic"
            width={52}
            height={52}
            className={styles.logo}
          />
        </Link>

        {/* Burger */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <span className={`${styles.burgerLine} ${isOpen ? styles.burgerLineTop : ""}`} />
          <span className={`${styles.burgerLine} ${isOpen ? styles.burgerLineMid : ""}`} />
          <span className={`${styles.burgerLine} ${isOpen ? styles.burgerLineBot : ""}`} />
        </button>

        {/* Nav */}
        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ""}`}>
          <ul className={styles.navList}>
            {navItems.map((item, index) => {
              const isActive = pathname === getNavUrl(item);
              return (
              <li key={index} className={styles.navItem}>
                <Link
                  href={getNavUrl(item)}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  {NAV_ICONS[item] && (
                    <span className={styles.navIcon}>{NAV_ICONS[item]}</span>
                  )}
                  {item}
                </Link>
              </li>
              );
            })}
          </ul>
        </nav>

        {/* Account button — always visible */}
        <Link href="/profile" className={styles.accountButton} onClick={closeMenu}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Личный кабинет</span>
        </Link>

      </div>
    </header>
  );
}
