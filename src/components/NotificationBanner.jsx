import React, { useEffect, useState } from 'react';
import { CheckCircle, X, Calendar, Clock, User, Phone, Hash, Car } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

/**
 * NotificationBanner - компонент для отображения уведомления о бронировании
 * Отображается вверху страницы как sticky баннер
 */
const NotificationBanner = () => {
  const { notification, hideNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);

  // Управление анимацией появления/исчезновения
  useEffect(() => {
    if (notification) {
      // Небольшая задержка для анимации
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  // Если нет уведомления, не рендерим компонент
  if (!notification) {
    return null;
  }

  const { date, time, name, phone, bookingId, carInfo } = notification;

  // Форматирование даты для более читабельного вида
  const formatDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div
      className={`sticky top-0 z-40 w-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Success icon and main message */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 mt-0.5" />

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-2">
                Test Drive Booked Successfully!
              </h3>

              {/* Booking details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 opacity-80" />
                  <span className="truncate">
                    <span className="font-semibold">Date:</span> {formatDate(date)}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0 opacity-80" />
                  <span className="truncate">
                    <span className="font-semibold">Time:</span> {time}
                  </span>
                </div>

                {/* Name */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0 opacity-80" />
                  <span className="truncate">
                    <span className="font-semibold">Name:</span> {name}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 opacity-80" />
                  <span className="truncate">
                    <span className="font-semibold">Phone:</span> {phone}
                  </span>
                </div>

                {/* Booking ID */}
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 flex-shrink-0 opacity-80" />
                  <span className="truncate">
                    <span className="font-semibold">ID:</span> {bookingId}
                  </span>
                </div>

                {/* Car Info (if available) */}
                {carInfo && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 flex-shrink-0 opacity-80" />
                    <span className="truncate">
                      <span className="font-semibold">Car:</span> {carInfo}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional message */}
              <p className="mt-2 text-xs sm:text-sm opacity-90">
                We'll send you a confirmation email shortly. See you soon!
              </p>
            </div>
          </div>

          {/* Right side - Close button */}
          <button
            onClick={hideNotification}
            className="flex-shrink-0 p-1 hover:bg-green-700 rounded-full transition-colors duration-200"
            aria-label="Close notification"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
