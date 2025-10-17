/**
 * Session Manager
 *
 * Управляет жизненным циклом sessionId с TTL 24 часа.
 * SessionId сохраняется в localStorage и восстанавливается при перезагрузке страницы.
 */

// Константы
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
const STORAGE_KEY_SESSION_ID = 'app_sessionId';
const STORAGE_KEY_SESSION_TIMESTAMP = 'app_sessionTimestamp';

/**
 * Генерация нового UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback для старых браузеров
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Получить или создать sessionId
 *
 * Проверяет наличие существующего sessionId в localStorage.
 * Если sessionId существует и не истёк (< 24 часов) - возвращает его.
 * Если истёк или отсутствует - генерирует новый и сохраняет с текущим timestamp.
 *
 * @returns {string} SessionId (UUID v4)
 */
export function getOrCreateSessionId() {
  try {
    const existingSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    const existingTimestamp = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);

    if (existingSessionId && existingTimestamp) {
      const timestamp = parseInt(existingTimestamp, 10);
      const now = Date.now();
      const age = now - timestamp;

      // Проверяем, не истёк ли sessionId
      if (age < SESSION_TTL) {
        console.log(
          `[SessionManager] Using existing sessionId: ${existingSessionId} ` +
          `(age: ${Math.round(age / 1000 / 60)} minutes, TTL: ${SESSION_TTL / 1000 / 60} minutes)`
        );
        return existingSessionId;
      } else {
        console.log(
          `[SessionManager] SessionId expired (age: ${Math.round(age / 1000 / 60)} minutes), ` +
          'generating new one'
        );
      }
    }

    // Генерируем новый sessionId
    const newSessionId = generateUUID();
    const now = Date.now();

    localStorage.setItem(STORAGE_KEY_SESSION_ID, newSessionId);
    localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, now.toString());

    console.log(`[SessionManager] Created new sessionId: ${newSessionId}`);

    return newSessionId;
  } catch (error) {
    console.error('[SessionManager] Error accessing localStorage:', error);

    // Fallback: генерируем sessionId без сохранения
    return generateUUID();
  }
}

/**
 * Обновить timestamp сессии
 *
 * Продлевает жизнь текущей сессии, обновляя timestamp до текущего времени.
 * Используется при активных действиях пользователя для продления сессии.
 *
 * @returns {boolean} true если успешно обновлено, false в случае ошибки
 */
export function refreshSession() {
  try {
    const existingSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);

    if (!existingSessionId) {
      console.warn('[SessionManager] Cannot refresh session: no sessionId found');
      return false;
    }

    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, now.toString());

    console.log(`[SessionManager] Session refreshed for sessionId: ${existingSessionId}`);
    return true;
  } catch (error) {
    console.error('[SessionManager] Error refreshing session:', error);
    return false;
  }
}

/**
 * Очистить текущую сессию
 *
 * Принудительно удаляет sessionId и timestamp из localStorage.
 * Используется при выходе пользователя (logout) или для сброса контекста.
 *
 * @returns {boolean} true если успешно очищено, false в случае ошибки
 */
export function clearSession() {
  try {
    const existingSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);

    localStorage.removeItem(STORAGE_KEY_SESSION_ID);
    localStorage.removeItem(STORAGE_KEY_SESSION_TIMESTAMP);

    console.log(`[SessionManager] Session cleared: ${existingSessionId || 'no session'}`);
    return true;
  } catch (error) {
    console.error('[SessionManager] Error clearing session:', error);
    return false;
  }
}

/**
 * Получить текущий sessionId без создания нового
 *
 * Возвращает существующий sessionId или null если его нет.
 * Не проверяет TTL и не создаёт новый sessionId.
 *
 * @returns {string|null} SessionId или null
 */
export function getCurrentSessionId() {
  try {
    return localStorage.getItem(STORAGE_KEY_SESSION_ID);
  } catch (error) {
    console.error('[SessionManager] Error getting current sessionId:', error);
    return null;
  }
}

/**
 * Получить информацию о текущей сессии
 *
 * @returns {Object} Информация о сессии
 */
export function getSessionInfo() {
  try {
    const sessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    const timestampStr = localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP);

    if (!sessionId || !timestampStr) {
      return {
        exists: false,
        sessionId: null,
        timestamp: null,
        age: null,
        ttl: SESSION_TTL,
        expired: true,
      };
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const age = now - timestamp;
    const expired = age >= SESSION_TTL;

    return {
      exists: true,
      sessionId,
      timestamp,
      age,
      ageMinutes: Math.round(age / 1000 / 60),
      ttl: SESSION_TTL,
      ttlMinutes: SESSION_TTL / 1000 / 60,
      expired,
      remainingTime: expired ? 0 : SESSION_TTL - age,
      remainingMinutes: expired ? 0 : Math.round((SESSION_TTL - age) / 1000 / 60),
    };
  } catch (error) {
    console.error('[SessionManager] Error getting session info:', error);
    return {
      exists: false,
      sessionId: null,
      timestamp: null,
      age: null,
      ttl: SESSION_TTL,
      expired: true,
      error: error.message,
    };
  }
}

/**
 * Проверить, истекла ли текущая сессия
 *
 * @returns {boolean} true если сессия истекла или отсутствует
 */
export function isSessionExpired() {
  const info = getSessionInfo();
  return info.expired;
}

// Экспортируем константы для использования в других модулях
export const SESSION_CONFIG = {
  TTL: SESSION_TTL,
  STORAGE_KEY_SESSION_ID,
  STORAGE_KEY_SESSION_TIMESTAMP,
};

// Debug функция (доступна в window для отладки)
if (typeof window !== 'undefined') {
  window.debugSession = () => {
    console.log('=== Session Debug Info ===');
    const info = getSessionInfo();
    console.log('Session Info:', info);
    console.log('Session Config:', SESSION_CONFIG);
  };
}

export default {
  getOrCreateSessionId,
  refreshSession,
  clearSession,
  getCurrentSessionId,
  getSessionInfo,
  isSessionExpired,
  SESSION_CONFIG,
};
