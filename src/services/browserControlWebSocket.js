/**
 * WebSocket клиент для управления браузером через голосового агента
 * Агент может отправлять команды управления браузером через sessionId
 *
 * ВАЖНО: SessionId управляется через sessionManager.js, который обеспечивает
 * единый sessionId с TTL 24 часа для всего приложения.
 */

import { commandExecutor } from './commandExecutor.js';

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
    // Параметризованные команды генерируются динамически в commandGenerator.js
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
    console.log('[BrowserControl] Received message from server:', data);

    const { type, command, params, payload, commandHash } = data;

    if (command === 'execute') {
      console.log('[BrowserControl] Execute command received - payload:', payload, 'params:', params, 'commandHash:', commandHash);
    }

    // Вызываем зарегистрированные обработчики для данного типа
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      handlers.forEach(handler => handler(data));
    }

    // Обработка команд управления браузером
    switch (command) {
      case 'navigate':
        this.handleNavigate(params, commandHash);
        break;
      case 'click':
        this.handleClick(params, commandHash);
        break;
      case 'fill':
        this.handleFill(params, commandHash);
        break;
      case 'scroll':
        this.handleScroll(params, commandHash);
        break;
      case 'execute':
        // Для execute команд используем payload, который содержит { commandId, params }
        const executePayload = payload || params || {};
        this.handleExecute(executePayload, commandHash);
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
   * Выполнение параметризованной команды
   * Делегирует выполнение в commandExecutor
   * @param {Object} payload - Параметры команды
   * @param {string} payload.commandId - ID команды для выполнения
   * @param {Object} payload.params - Параметры команды (опционально)
   * @param {string} commandHash - Уникальный хеш команды для отслеживания
   */
  async handleExecute({ commandId, params } = {}, commandHash) {
    console.log('[BrowserControl] handleExecute called with:', { commandId, params, commandHash });

    if (!commandId) {
      console.error('[BrowserControl] Execute: commandId is required');
      this.sendAck('execute', false, 'commandId is required', null, commandHash);
      return;
    }

    console.log(`[BrowserControl] Executing parameterized command: ${commandId}`, params || {});

    try {
      // Выполняем команду через централизованный executor (может быть async)
      const result = await commandExecutor.execute(commandId, params);

      if (result.success) {
        this.sendAck('execute', true, null, {
          commandId,
          params: params || {},
          action: result.action,
          warning: result.warning,
          results: result.results  // Добавляем результаты фильтрации для агента
        }, commandHash);
      } else {
        this.sendAck('execute', false, result.error, {
          commandId,
          params: params || {}
        }, commandHash);
      }
    } catch (error) {
      console.error('[BrowserControl] Execute error:', error);
      this.sendAck('execute', false, error.message, {
        commandId,
        params: params || {}
      }, commandHash);
    }
  }

  /**
   * Отправка подтверждения выполнения команды
   * @param {string} command - Команда
   * @param {boolean} success - Успешность выполнения
   * @param {string} error - Ошибка (если есть)
   * @param {Object} data - Данные результата
   * @param {string} commandHash - Уникальный хеш команды
   */
  sendAck(command, success, error = null, data = null, commandHash = null) {
    const ackMessage = {
      type: 'ack',
      command,
      success,
      error,
      data,
      sessionId: this.sessionId,
      commandHash,
      timestamp: Date.now()
    };
    console.log('[BrowserControl] Sending ack:', ackMessage);
    this.send(ackMessage);
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
      description: document.querySelector('meta[name="description"]')?.content || '',
      inventoryId: this.appConfig.metadata?.inventoryId  // ID источника инвентаря для voice agent
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
      commands: this.commands || [], // Параметризованные команды {id, params} (генерируются динамически)
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
   * Обновление списка параметризованных команд
   * @param {Array} commands - Массив команд с полями {id, params}
   */
  updateCommands(commands) {
    this.commands = commands;
    console.log(`[BrowserControl] Commands updated: ${commands.length} parameterized commands available`);

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
    console.log(`\n=== Available Parameterized Commands (${commands.length}) ===\n`);
    commands.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.id}`);
      if (cmd.params && Object.keys(cmd.params).length > 0) {
        console.log(`   Params: ${JSON.stringify(cmd.params, null, 2)}\n`);
      } else {
        console.log(`   (No parameters)\n`);
      }
    });
    console.log('Use window.browserControl.execute("command_id", params) to execute a command\n');
  }

  /**
   * Выполнить команду по ID (для тестирования из консоли)
   * @param {string} commandId - ID команды
   * @param {Object} params - Параметры команды (опционально)
   * @returns {boolean} true если команда найдена и выполнена
   */
  executeCommand(commandId, params) {
    const commands = this.getCommands();
    const command = commands.find(cmd => cmd.id === commandId);

    if (!command) {
      console.error(`[BrowserControl] Command not found: ${commandId}`);
      console.log('Available commands:');
      commands.forEach(cmd => console.log(`  - ${cmd.id}`));
      return false;
    }

    console.log(`[BrowserControl] Executing command: ${commandId}`, params || {});

    // Выполняем команду локально
    this.handleExecute({ commandId, params: params || {} });

    return true;
  }

  /**
   * Поиск команд по ID
   * @param {string} query - Поисковый запрос
   * @returns {Array} Найденные команды
   */
  searchCommands(query) {
    const commands = this.getCommands();
    const lowerQuery = query.toLowerCase();

    const results = commands.filter(cmd =>
      cmd.id.toLowerCase().includes(lowerQuery)
    );

    console.log(`\n=== Search Results for "${query}" (${results.length}) ===\n`);
    results.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.id}`);
      if (cmd.params && Object.keys(cmd.params).length > 0) {
        console.log(`   Params: ${JSON.stringify(cmd.params, null, 2)}\n`);
      } else {
        console.log(`   (No parameters)\n`);
      }
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
     * Выполнить параметризованную команду по ID
     * @example window.browserControl.execute('view_cars', { carIds: [1, 2] })
     * @example window.browserControl.execute('set_filter', { filterType: 'make', values: ['BMW'] })
     * @example window.browserControl.execute('go_home')
     */
    execute: (commandId, params) => browserControlWS.executeCommand(commandId, params),

    /**
     * Получить список всех доступных параметризованных команд
     * @example window.browserControl.getCommands()
     */
    getCommands: () => browserControlWS.getCommands(),

    /**
     * Показать список параметризованных команд в консоли
     * @example window.browserControl.list()
     */
    list: () => browserControlWS.listCommands(),

    /**
     * Поиск команд по ID
     * @example window.browserControl.search('filter')
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
      console.log('  window.browserControl.list()                         - Show all available parameterized commands');
      console.log('  window.browserControl.search("query")                - Search commands by ID');
      console.log('  window.browserControl.execute("cmd_id", params)      - Execute a parameterized command');
      console.log('  window.browserControl.getCommands()                  - Get commands array');
      console.log('  window.browserControl.status()                       - Show connection status');
      console.log('  window.browserControl.debugVoiceSession()            - Start debug session without ElevenLabs');
      console.log('  window.browserControl.help()                         - Show this help\n');
      console.log('Examples:');
      console.log('  window.browserControl.list()');
      console.log('  window.browserControl.search("filter")');
      console.log('  window.browserControl.execute("go_home")');
      console.log('  window.browserControl.execute("set_filter", { filterType: "make", values: ["BMW"] })');
      console.log('  window.browserControl.execute("view_cars", { carIds: [1, 2, 3] })');
      console.log('  window.browserControl.execute("set_filters", { filters: { make: ["BMW"], price: { max: 50000 } } })');
      console.log('  window.browserControl.debugVoiceSession()');
      console.log('');
    },

    /**
     * Запуск отладочной сессии управления браузером БЕЗ подключения к ElevenLabs
     * Полезно для тестирования команд управления браузером
     * @example window.browserControl.debugVoiceSession()
     */
    debugVoiceSession: async () => {
      try {
        // Импортируем sessionManager
        const { getOrCreateSessionId, refreshSession } = await import('./sessionManager.js');

        // Получаем или создаём sessionId
        const sessionId = getOrCreateSessionId();
        console.log('\n=== Debug Voice Session ===');
        console.log(`Session ID: ${sessionId}`);

        // Обновляем timestamp сессии
        refreshSession();

        // Получаем WebSocket URL из переменных окружения
        const wsUrl = import.meta.env.VITE_BROWSER_CONTROL_WS_URL || 'wss://car-frontend-api.test.meteora.pro/browser-control';
        console.log(`WebSocket URL: ${wsUrl}`);

        // Подключаемся к WebSocket серверу
        console.log('\nConnecting to Browser Control WebSocket...');
        await browserControlWS.connect(wsUrl, sessionId);

        console.log('\n✓ Debug session started successfully!');
        console.log('\nNow you can:');
        console.log('  - Use window.browserControl.list() to see available commands');
        console.log('  - Use window.browserControl.execute("command_id") to execute commands');
        console.log('  - Use window.browserControl.status() to check connection status');
        console.log('  - Send commands from external systems using sessionId:', sessionId);
        console.log('\nTo disconnect, use: browserControlWS.disconnect()\n');

        return { success: true, sessionId, wsUrl };
      } catch (error) {
        console.error('\n✗ Failed to start debug session:', error);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
      }
    }
  };

  console.log('[BrowserControl] Global commands available via window.browserControl');
  console.log('Type window.browserControl.help() for usage information');
}

export default BrowserControlWebSocket;
