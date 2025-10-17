/**
 * WebSocket клиент для управления браузером через голосового агента
 * Агент может отправлять команды управления браузером через sessionId
 *
 * ВАЖНО: SessionId управляется через sessionManager.js, который обеспечивает
 * единый sessionId с TTL 24 часа для всего приложения.
 */

class BrowserControlWebSocket {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.serverUrl = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isIntentionallyClosed = false;
    this.messageHandlers = new Map();

    // Константы для localStorage (только для server URL, sessionId управляется sessionManager)
    this.STORAGE_KEY_SERVER_URL = 'browserControl_serverUrl';

    // Конфигурация приложения (routes и metadata)
    // Команды генерируются динамически в commandGenerator.js
    this.appConfig = {
      routes: [],
      metadata: {}
    };
  }

  /**
   * Подключение к WebSocket серверу
   * @param {string} url - URL WebSocket сервера
   * @param {string} sessionId - Уникальный ID сессии
   */
  connect(url, sessionId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    this.sessionId = sessionId;
    this.serverUrl = url;
    this.isIntentionallyClosed = false;

    // Сохраняем данные подключения в localStorage для восстановления
    this.saveToLocalStorage();

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected to browser control server');
          this.reconnectAttempts = 0;

          // Генерируем карту доступных действий
          const actionsMap = this.getActionsMap();

          // Регистрируем sessionId на сервере с картой действий
          this.send({
            type: 'register',
            sessionId: this.sessionId,
            actionsMap,
            timestamp: Date.now()
          });

          console.log('[BrowserControl] Registered with actions map:', actionsMap);

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');

          // Пытаемся переподключиться если закрытие не было намеренным
          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
              this.connect(url, this.sessionId);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Обработка входящих сообщений от сервера
   * @param {Object} data - Данные сообщения
   */
  handleMessage(data) {
    console.log('Received message from server:', data);

    const { type, command, params } = data;

    // Вызываем зарегистрированные обработчики для данного типа
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      handlers.forEach(handler => handler(data));
    }

    // Обработка команд управления браузером
    switch (command) {
      case 'navigate':
        this.handleNavigate(params);
        break;
      case 'click':
        this.handleClick(params);
        break;
      case 'fill':
        this.handleFill(params);
        break;
      case 'scroll':
        this.handleScroll(params);
        break;
      case 'execute':
        this.handleExecute(params);
        break;
      default:
        console.log('Unknown command:', command);
    }
  }

  /**
   * Навигация по внутренним путям приложения (только клиентский роутинг)
   * ВАЖНО: Работает ТОЛЬКО с локальными route, никаких внешних URL!
   * Использует HashRouter для SPA навигации БЕЗ перезагрузки страницы.
   * Полные URL прервут голосовой звонок!
   *
   * @param {Object} params - Параметры навигации
   * @param {string} params.route - Клиентский маршрут (основной параметр)
   * @param {string} params.path - Алиас для route (для обратной совместимости)
   * @param {string} params.url - Устаревший параметр (для обратной совместимости)
   * @param {Object} params.queryParams - Query параметры
   */
  handleNavigate({ route, path, url, queryParams }) {
    // Приоритет: route > path > url (для обратной совместимости)
    const targetPath = route || path || url;

    if (!targetPath) {
      console.error('[BrowserControl] Navigate: route is required');
      this.sendAck('navigate', false, 'Route is required');
      return;
    }

    try {
      // Валидация: запрещаем любые URL (только локальные route)
      // Это критично для предотвращения прерывания голосового звонка!
      if (targetPath.includes('://') || targetPath.startsWith('//')) {
        console.error('[BrowserControl] Navigate: external URLs are FORBIDDEN! Use only client-side routes like "/cars" or "/car/123". Full URLs will interrupt the voice call!');
        this.sendAck('navigate', false, 'External URLs are forbidden. Use only client-side routes starting with /');
        return;
      }

      // Валидация: route должен начинаться с "/" (абсолютный route в рамках приложения)
      if (!targetPath.startsWith('/')) {
        console.error('[BrowserControl] Navigate: route must start with "/" (e.g., "/cars", "/car/123")');
        this.sendAck('navigate', false, 'Route must start with "/"');
        return;
      }

      // Формируем полный route с query параметрами
      let fullRoute = targetPath;

      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        fullRoute += (targetPath.includes('?') ? '&' : '?') + params.toString();
      }

      // Навигация через HashRouter: устанавливаем hash
      // Это вызовет React Router БЕЗ перезагрузки страницы (критично для голосового звонка!)
      const newHash = `#${fullRoute}`;

      console.log('[BrowserControl] Client-side navigation to:', newHash);

      // Устанавливаем новый hash (React Router автоматически обработает)
      window.location.hash = newHash;

      this.sendAck('navigate', true, null, { route: fullRoute, hash: newHash });
    } catch (error) {
      console.error('[BrowserControl] Navigation error:', error);
      this.sendAck('navigate', false, error.message);
    }
  }

  /**
   * Клик по элементу
   */
  handleClick({ selector }) {
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
        this.sendAck('click', true);
      } else {
        this.sendAck('click', false, `Element not found: ${selector}`);
      }
    }
  }

  /**
   * Заполнение поля
   */
  handleFill({ selector, value }) {
    if (selector && value !== undefined) {
      const element = document.querySelector(selector);
      if (element) {
        element.value = value;
        // Trigger change event
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        this.sendAck('fill', true);
      } else {
        this.sendAck('fill', false, `Element not found: ${selector}`);
      }
    }
  }

  /**
   * Прокрутка страницы
   */
  handleScroll({ x = 0, y = 0 }) {
    window.scrollTo(x, y);
    this.sendAck('scroll', true);
  }

  /**
   * Выполнение высокоуровневой команды
   * Обрабатывает команды с простой структурой {id, description}
   * @param {Object} params - Параметры команды
   * @param {string} params.id - ID команды для выполнения
   */
  handleExecute({ id }) {
    if (!id) {
      console.error('[BrowserControl] Execute: command id is required');
      this.sendAck('execute', false, 'Command id is required');
      return;
    }

    console.log(`[BrowserControl] Executing command: ${id}`);

    try {
      // ===== НАВИГАЦИЯ =====
      if (id === 'go_home') {
        window.location.hash = '#/';
        this.sendAck('execute', true, null, { id, action: 'navigated to home' });
        return;
      }

      if (id === 'go_cars') {
        window.location.hash = '#/cars';
        this.sendAck('execute', true, null, { id, action: 'navigated to cars page' });
        return;
      }

      if (id === 'go_about') {
        window.location.hash = '#/about';
        this.sendAck('execute', true, null, { id, action: 'navigated to about page' });
        return;
      }

      if (id === 'go_contact') {
        window.location.hash = '#/contact';
        this.sendAck('execute', true, null, { id, action: 'navigated to contact page' });
        return;
      }

      if (id === 'go_back_cars') {
        window.location.hash = '#/cars';
        this.sendAck('execute', true, null, { id, action: 'navigated back to cars' });
        return;
      }

      // ===== ПРОСМОТР АВТОМОБИЛЕЙ =====
      if (id.startsWith('view_car_')) {
        const carId = id.replace('view_car_', '');
        window.location.hash = `#/car/${carId}`;
        this.sendAck('execute', true, null, { id, action: `viewing car ${carId}` });
        return;
      }

      // ===== ФИЛЬТРЫ ПО МАРКАМ =====
      if (id.startsWith('filter_make_')) {
        const makeSelector = document.querySelector('#car-make-filter');
        if (!makeSelector) {
          this.sendAck('execute', false, 'Make filter not found (not on /cars page?)');
          return;
        }

        if (id === 'filter_make_all') {
          makeSelector.value = '';
        } else {
          // Извлекаем название марки из id (filter_make_bmw -> BMW)
          const makeId = id.replace('filter_make_', '');
          const makeName = makeId.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');

          // Ищем соответствующую опцию в select
          const option = Array.from(makeSelector.options).find(
            opt => opt.value.toLowerCase() === makeName.toLowerCase()
          );

          if (option) {
            makeSelector.value = option.value;
          } else {
            makeSelector.value = makeName;
          }
        }

        makeSelector.dispatchEvent(new Event('change', { bubbles: true }));
        this.sendAck('execute', true, null, { id, action: 'applied make filter' });
        return;
      }

      // ===== ФИЛЬТРЫ ПО МОДЕЛЯМ =====
      if (id.startsWith('filter_model_')) {
        const modelSelector = document.querySelector('#car-model-filter');
        if (!modelSelector) {
          this.sendAck('execute', false, 'Model filter not found (not on /cars page?)');
          return;
        }

        if (id === 'filter_model_all') {
          modelSelector.value = '';
        } else {
          // Извлекаем название модели из id (filter_model_x5 -> X5, filter_model_range_rover_sport -> Range Rover Sport)
          const modelId = id.replace('filter_model_', '');
          const modelName = modelId.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');

          // Ищем соответствующую опцию в select
          const option = Array.from(modelSelector.options).find(
            opt => opt.value.toLowerCase() === modelName.toLowerCase()
          );

          if (option) {
            modelSelector.value = option.value;
          } else {
            modelSelector.value = modelName;
          }
        }

        modelSelector.dispatchEvent(new Event('change', { bubbles: true }));
        this.sendAck('execute', true, null, { id, action: 'applied model filter' });
        return;
      }

      // ===== ФИЛЬТРЫ ПО ЦЕНЕ =====
      if (id.startsWith('filter_price_')) {
        const priceSelector = document.querySelector('#car-price-filter');
        if (!priceSelector) {
          this.sendAck('execute', false, 'Price filter not found (not on /cars page?)');
          return;
        }

        const priceMap = {
          'filter_price_low': 'under-50000',
          'filter_price_mid': '50000-80000',
          'filter_price_high': 'over-80000',
          'filter_price_all': ''
        };

        const priceValue = priceMap[id];
        if (priceValue !== undefined) {
          priceSelector.value = priceValue;
          priceSelector.dispatchEvent(new Event('change', { bubbles: true }));
          this.sendAck('execute', true, null, { id, action: 'applied price filter' });
        } else {
          this.sendAck('execute', false, `Unknown price filter: ${id}`);
        }
        return;
      }

      // ===== ПОИСК =====
      if (id.startsWith('search_')) {
        const searchInput = document.querySelector('#car-search-input');
        if (!searchInput) {
          this.sendAck('execute', false, 'Search input not found (not on /cars page?)');
          return;
        }

        if (id === 'search_clear') {
          searchInput.value = '';
        } else {
          // Извлекаем поисковый запрос из id (search_bmw -> BMW)
          const searchTerm = id.replace('search_', '').replace(/_/g, ' ');
          searchInput.value = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
        }

        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.sendAck('execute', true, null, { id, action: 'performed search' });
        return;
      }

      // ===== ДЕЙСТВИЯ =====
      if (id === 'clear_all_filters') {
        const clearBtn = document.querySelector('#car-clear-filters-btn');
        if (clearBtn) {
          clearBtn.click();
          this.sendAck('execute', true, null, { id, action: 'cleared all filters' });
        } else {
          this.sendAck('execute', false, 'Clear filters button not found');
        }
        return;
      }

      if (id === 'scroll_top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.sendAck('execute', true, null, { id, action: 'scrolled to top' });
        return;
      }

      if (id === 'scroll_bottom') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        this.sendAck('execute', true, null, { id, action: 'scrolled to bottom' });
        return;
      }

      // ===== КОМБИНИРОВАННЫЕ КОМАНДЫ =====
      // Формат: show_cheap_bmw, show_mid_audi, show_luxury_ferrari
      if (id.startsWith('show_')) {
        const parts = id.split('_');
        if (parts.length >= 3) {
          const priceCategory = parts[1]; // cheap, mid, luxury
          const make = parts.slice(2).join(' '); // bmw, mercedes_benz, land_rover, etc.

          // Применяем фильтр по марке
          const makeSelector = document.querySelector('#car-make-filter');
          const priceSelector = document.querySelector('#car-price-filter');

          if (!makeSelector || !priceSelector) {
            this.sendAck('execute', false, 'Filters not found (not on /cars page?)');
            return;
          }

          // Устанавливаем марку
          const makeName = make.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');

          const option = Array.from(makeSelector.options).find(
            opt => opt.value.toLowerCase() === makeName.toLowerCase()
          );

          if (option) {
            makeSelector.value = option.value;
          } else {
            makeSelector.value = makeName;
          }
          makeSelector.dispatchEvent(new Event('change', { bubbles: true }));

          // Устанавливаем цену (обновленные диапазоны)
          const priceMap = {
            'cheap': 'under-50000',
            'mid': '50000-80000',
            'luxury': 'over-80000'
          };

          const priceValue = priceMap[priceCategory];
          if (priceValue) {
            priceSelector.value = priceValue;
            priceSelector.dispatchEvent(new Event('change', { bubbles: true }));
          }

          this.sendAck('execute', true, null, { id, action: 'applied combined filters' });
          return;
        }
      }

      // Если команда не распознана
      console.warn(`[BrowserControl] Unknown command id: ${id}`);
      this.sendAck('execute', false, `Unknown command: ${id}`);

    } catch (error) {
      console.error('[BrowserControl] Execute error:', error);
      this.sendAck('execute', false, error.message);
    }
  }

  /**
   * Отправка подтверждения выполнения команды
   */
  sendAck(command, success, error = null, data = null) {
    this.send({
      type: 'ack',
      command,
      success,
      error,
      data,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Отправка сообщения на сервер
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  /**
   * Регистрация обработчика для определенного типа сообщений
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * Удаление обработчика
   */
  offMessage(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Отключение от WebSocket
   */
  disconnect() {
    this.isIntentionallyClosed = true;

    if (this.ws) {
      // Отправляем сообщение о завершении сессии
      this.send({
        type: 'unregister',
        sessionId: this.sessionId,
        timestamp: Date.now()
      });

      this.ws.close();
      this.ws = null;
    }

    this.sessionId = null;
    this.messageHandlers.clear();
  }

  /**
   * Проверка состояния подключения
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Получение session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Сохранение данных подключения в localStorage
   * ВАЖНО: SessionId НЕ сохраняется здесь, он управляется sessionManager
   */
  saveToLocalStorage() {
    try {
      // Сохраняем только server URL, sessionId управляется sessionManager
      if (this.serverUrl) {
        localStorage.setItem(this.STORAGE_KEY_SERVER_URL, this.serverUrl);
      }
    } catch (error) {
      console.error('[BrowserControl] Failed to save to localStorage:', error);
    }
  }

  /**
   * Восстановление данных подключения из localStorage
   * SessionId берётся из sessionManager, здесь только serverUrl
   */
  restoreFromLocalStorage() {
    try {
      const serverUrl = localStorage.getItem(this.STORAGE_KEY_SERVER_URL);

      if (serverUrl) {
        return { serverUrl };
      }
      return null;
    } catch (error) {
      console.error('[BrowserControl] Failed to restore from localStorage:', error);
      return null;
    }
  }

  /**
   * Очистка данных подключения из localStorage
   * ВАЖНО: НЕ очищает sessionId, он управляется sessionManager
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_SERVER_URL);
    } catch (error) {
      console.error('[BrowserControl] Failed to clear localStorage:', error);
    }
  }

  /**
   * Автоматическое переподключение при загрузке страницы
   * Использует sessionId из sessionManager (с TTL 24 часа)
   *
   * @param {string} sessionId - SessionId из sessionManager
   * @returns {Promise<boolean>} true если успешно переподключено
   */
  async autoReconnect(sessionId) {
    const savedData = this.restoreFromLocalStorage();

    if (savedData && sessionId) {
      const { serverUrl } = savedData;
      console.log('[BrowserControl] Auto-reconnecting with session:', sessionId);

      try {
        await this.connect(serverUrl, sessionId);
        console.log('[BrowserControl] Auto-reconnect successful');
        return true;
      } catch (error) {
        console.error('[BrowserControl] Auto-reconnect failed:', error);
        this.clearLocalStorage();
        return false;
      }
    }

    console.log('[BrowserControl] No saved connection data or sessionId for auto-reconnect');
    return false;
  }

  /**
   * Установка конфигурации приложения
   * @param {Object} config - Конфигурация с routes и metadata
   */
  setAppConfig(config) {
    this.appConfig = {
      routes: config.routes || [],
      metadata: config.metadata || {}
    };

    console.log('[BrowserControl] App config updated:', this.appConfig);
  }

  /**
   * Сбор интерактивных элементов с текущей страницы (парсинг DOM)
   * @returns {Array} Массив интерактивных элементов
   */
  collectPageActions() {
    const interactiveElements = [];

    try {
      // Собираем все кликабельные элементы
      const clickableSelectors = [
        'a[href]',
        'button',
        '[role="button"]',
        'input[type="button"]',
        'input[type="submit"]'
      ];

      clickableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          // Создаем уникальный селектор для элемента
          let uniqueSelector = selector;

          if (el.id) {
            uniqueSelector = `#${el.id}`;
          } else if (el.className) {
            const classes = el.className.trim().split(/\s+/).join('.');
            uniqueSelector = `${el.tagName.toLowerCase()}.${classes}`;
          }

          const element = {
            selector: uniqueSelector,
            type: this.getElementType(el),
            label: this.getElementLabel(el),
            description: this.getElementDescription(el),
            attributes: this.getElementAttributes(el)
          };

          interactiveElements.push(element);
        });
      });

      // Собираем все input поля и select элементы
      const inputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea, select');
      inputs.forEach(el => {
        let uniqueSelector = el.tagName.toLowerCase();

        if (el.id) {
          uniqueSelector = `#${el.id}`;
        } else if (el.name) {
          uniqueSelector = `${el.tagName.toLowerCase()}[name="${el.name}"]`;
        }

        const element = {
          selector: uniqueSelector,
          type: this.getElementType(el),
          label: this.getElementLabel(el),
          description: this.getElementDescription(el),
          attributes: this.getElementAttributes(el)
        };

        // Для select элементов добавляем список доступных опций
        if (el.tagName.toLowerCase() === 'select') {
          element.options = this.getSelectOptions(el);
        }

        interactiveElements.push(element);
      });

    } catch (error) {
      console.error('[BrowserControl] Error collecting page actions:', error);
    }

    return interactiveElements;
  }

  /**
   * Определение типа элемента
   */
  getElementType(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();

    if (tagName === 'a') return 'link';
    if (tagName === 'button') return 'button';
    if (tagName === 'select') return 'select';
    if (tagName === 'textarea') return 'input';
    if (tagName === 'input') {
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      return 'input';
    }

    return 'other';
  }

  /**
   * Получение текста/label элемента
   */
  getElementLabel(element) {
    // Попытка получить текст из разных источников
    return element.textContent?.trim() ||
           element.value ||
           element.placeholder ||
           element.getAttribute('aria-label') ||
           element.getAttribute('title') ||
           element.alt ||
           '';
  }

  /**
   * Получение описания элемента
   */
  getElementDescription(element) {
    return element.getAttribute('aria-description') ||
           element.getAttribute('data-description') ||
           element.title ||
           '';
  }

  /**
   * Получение атрибутов элемента
   */
  getElementAttributes(element) {
    const attrs = {};
    const importantAttrs = ['id', 'name', 'placeholder', 'type', 'href', 'value', 'aria-label'];

    importantAttrs.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        attrs[attr] = value;
      }
    });

    return attrs;
  }

  /**
   * Получение списка опций из select элемента
   * @param {HTMLSelectElement} selectElement - Select элемент
   * @returns {Array} Массив опций с value и label
   */
  getSelectOptions(selectElement) {
    const options = [];

    try {
      const optionElements = selectElement.querySelectorAll('option');
      optionElements.forEach(option => {
        options.push({
          value: option.value,
          label: option.textContent.trim(),
          selected: option.selected
        });
      });
    } catch (error) {
      console.error('[BrowserControl] Error getting select options:', error);
    }

    return options;
  }

  /**
   * Получение информации о текущей странице
   * ВАЖНО: Для HashRouter используем hash вместо pathname
   * @returns {Object} Информация о странице
   */
  getCurrentPageInfo() {
    // Для HashRouter текущий route находится в hash (например: #/cars)
    const hash = window.location.hash;
    // Убираем символ # из начала, если он есть
    const route = hash.startsWith('#') ? hash.substring(1) : hash || '/';

    return {
      url: window.location.href,
      route: route,  // Для HashRouter: #/cars -> /cars
      hash: hash,    // Полный hash с символом #
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || ''
    };
  }

  /**
   * Генерация полной карты доступных действий
   * @returns {Object} Полная карта AvailableActionsMap
   */
  getActionsMap() {
    const actionsMap = {
      timestamp: Date.now(),
      routes: this.appConfig.routes,
      currentPage: this.getCurrentPageInfo(),
      interactiveElements: this.collectPageActions(),
      commands: this.commands || [], // Высокоуровневые команды (генерируются динамически)
      metadata: this.appConfig.metadata
    };

    return actionsMap;
  }

  /**
   * Обновление карты действий на сервере
   * Отправляет актуальную карту через WebSocket
   */
  updateActionsMap() {
    if (!this.isConnected()) {
      console.warn('[BrowserControl] Cannot update actions map - not connected');
      return;
    }

    const actionsMap = this.getActionsMap();

    this.send({
      type: 'update-actions-map',
      sessionId: this.sessionId,
      actionsMap,
      timestamp: Date.now()
    });

    console.log('[BrowserControl] Actions map updated on server');
  }

  /**
   * Обновление списка высокоуровневых команд
   * @param {Array} commands - Массив команд с полями {id, description}
   */
  updateCommands(commands) {
    this.commands = commands;
    console.log(`[BrowserControl] Commands updated: ${commands.length} commands available`);

    // Если подключены к серверу, отправляем обновленную карту действий
    if (this.isConnected()) {
      this.updateActionsMap();
    }
  }

  /**
   * Получить список доступных команд
   * @returns {Array} Массив команд
   */
  getCommands() {
    return this.commands || [];
  }

  /**
   * Вывести список команд в консоль в читаемом виде
   */
  listCommands() {
    const commands = this.getCommands();
    console.log(`\n=== Available Commands (${commands.length}) ===\n`);
    commands.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.id}`);
      console.log(`   ${cmd.description}\n`);
    });
    console.log('Use window.browserControl.execute("command_id") to execute a command\n');
  }

  /**
   * Выполнить команду по ID (для тестирования из консоли)
   * @param {string} commandId - ID команды
   * @returns {boolean} true если команда найдена и отправлена
   */
  executeCommand(commandId) {
    const commands = this.getCommands();
    const command = commands.find(cmd => cmd.id === commandId);

    if (!command) {
      console.error(`[BrowserControl] Command not found: ${commandId}`);
      console.log('Available commands:');
      commands.forEach(cmd => console.log(`  - ${cmd.id}: ${cmd.description}`));
      return false;
    }

    console.log(`[BrowserControl] Executing: ${command.description}`);

    // Выполняем команду локально
    this.handleExecute({ id: commandId });

    return true;
  }

  /**
   * Поиск команд по описанию или ID
   * @param {string} query - Поисковый запрос
   * @returns {Array} Найденные команды
   */
  searchCommands(query) {
    const commands = this.getCommands();
    const lowerQuery = query.toLowerCase();

    const results = commands.filter(cmd =>
      cmd.id.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery)
    );

    console.log(`\n=== Search Results for "${query}" (${results.length}) ===\n`);
    results.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.id}`);
      console.log(`   ${cmd.description}\n`);
    });

    return results;
  }
}

// Singleton экземпляр
export const browserControlWS = new BrowserControlWebSocket();

// Добавляем глобальные методы для удобного тестирования из консоли браузера
if (typeof window !== 'undefined') {
  window.browserControl = {
    /**
     * Выполнить команду по ID
     * @example window.browserControl.execute('view_car_1')
     */
    execute: (commandId) => browserControlWS.executeCommand(commandId),

    /**
     * Получить список всех доступных команд
     * @example window.browserControl.getCommands()
     */
    getCommands: () => browserControlWS.getCommands(),

    /**
     * Показать список команд в консоли
     * @example window.browserControl.list()
     */
    list: () => browserControlWS.listCommands(),

    /**
     * Поиск команд по описанию или ID
     * @example window.browserControl.search('bmw')
     */
    search: (query) => browserControlWS.searchCommands(query),

    /**
     * Получить информацию о подключении
     * @example window.browserControl.status()
     */
    status: () => {
      const connected = browserControlWS.isConnected();
      const sessionId = browserControlWS.getSessionId();
      const commandsCount = browserControlWS.getCommands().length;
      const currentPage = browserControlWS.getCurrentPageInfo();

      console.log('\n=== Browser Control Status ===');
      console.log(`Connected: ${connected ? '✓' : '✗'}`);
      console.log(`Session ID: ${sessionId || 'N/A'}`);
      console.log(`Commands available: ${commandsCount}`);
      console.log(`Current route: ${currentPage.route}`);
      console.log(`Current URL: ${currentPage.url}\n`);

      return { connected, sessionId, commandsCount, currentPage };
    },

    /**
     * Справка по использованию
     * @example window.browserControl.help()
     */
    help: () => {
      console.log('\n=== Browser Control Help ===\n');
      console.log('Available methods:');
      console.log('  window.browserControl.list()              - Show all available commands');
      console.log('  window.browserControl.search("query")     - Search commands by text');
      console.log('  window.browserControl.execute("cmd_id")   - Execute a command');
      console.log('  window.browserControl.getCommands()       - Get commands array');
      console.log('  window.browserControl.status()            - Show connection status');
      console.log('  window.browserControl.help()              - Show this help\n');
      console.log('Examples:');
      console.log('  window.browserControl.list()');
      console.log('  window.browserControl.search("bmw")');
      console.log('  window.browserControl.execute("view_car_1")');
      console.log('');
    }
  };

  console.log('[BrowserControl] Global commands available via window.browserControl');
  console.log('Type window.browserControl.help() for usage information');
}

export default BrowserControlWebSocket;
