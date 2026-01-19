"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './RussianDatePicker.module.css';

const RussianDatePicker = ({ value, onChange, disabled, required, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateDisplay = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
    if (onChange) {
      onChange(formatDateForInput(date));
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelectedDate = (date) => {
    if (!selectedDate || !date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="hidden"
        name={name}
        value={selectedDate ? formatDateForInput(selectedDate) : ''}
      />
      <div 
        className={`${styles.input} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={styles.inputText}>
          {selectedDate ? formatDateDisplay(selectedDate) : 'Выберите дату'}
        </span>
        <span className={styles.arrow}>▼</span>
      </div>
      
      {isOpen && !disabled && (
        <div className={styles.calendar}>
          <div className={styles.header}>
            <button 
              type="button"
              className={styles.navButton} 
              onClick={() => navigateMonth(-1)}
            >
              ◀
            </button>
            <span className={styles.monthYear}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              type="button"
              className={styles.navButton} 
              onClick={() => navigateMonth(1)}
            >
              ▶
            </button>
          </div>
          
          <div className={styles.daysHeader}>
            {dayNames.map(day => (
              <div key={day} className={styles.dayName}>{day}</div>
            ))}
          </div>
          
          <div className={styles.daysGrid}>
            {days.map((date, index) => (
              <div 
                key={index} 
                className={`${styles.dayCell} ${
                  date ? styles.dayActive : styles.dayEmpty
                } ${
                  date && isSelectedDate(date) ? styles.daySelected : ''
                } ${
                  date && isDateDisabled(date) ? styles.dayDisabled : ''
                }`}
                onClick={() => date && !isDateDisabled(date) && handleDateClick(date)}
              >
                {date ? date.getDate() : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RussianDatePicker;