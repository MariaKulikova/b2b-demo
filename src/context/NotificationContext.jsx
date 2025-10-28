import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * NotificationContext - контекст для управления уведомлениями о бронировании
 *
 * Использование:
 * const { showNotification, hideNotification, notification } = useNotification();
 * showNotification({ date, time, name, phone, bookingId, carInfo });
 */
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  /**
   * Показать уведомление о бронировании
   * @param {Object} data - Данные о бронировании
   * @param {string} data.date - Дата бронирования (например: "2025-11-15")
   * @param {string} data.time - Время бронирования (например: "14:30")
   * @param {string} data.name - Имя клиента
   * @param {string} data.phone - Телефон клиента
   * @param {string} data.bookingId - ID бронирования
   * @param {string} [data.carInfo] - Опциональная информация о машине (например: "2020 BMW X5")
   */
  const showNotification = useCallback((data) => {
    console.log('[NotificationContext] Showing notification:', data);
    setNotification(data);

    // Auto-hide через 10 секунд
    setTimeout(() => {
      hideNotification();
    }, 10000);
  }, []);

  /**
   * Скрыть уведомление
   */
  const hideNotification = useCallback(() => {
    console.log('[NotificationContext] Hiding notification');
    setNotification(null);
  }, []);

  const value = {
    notification,
    showNotification,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook для использования NotificationContext
 * @returns {Object} { notification, showNotification, hideNotification }
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
