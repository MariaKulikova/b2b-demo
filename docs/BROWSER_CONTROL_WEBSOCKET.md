# Browser Control WebSocket Integration

## Обзор

Интеграция WebSocket для управления браузером через голосового агента ElevenLabs. Когда пользователь начинает голосовой разговор, генерируется уникальный `sessionId`, который передается как в ElevenLabs агента, так и в WebSocket сервер. Агент может использовать MCP tools для отправки команд управления браузером через WebSocket, находя нужную сессию по `sessionId`.

## Архитектура

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (React App)                        │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ VoiceAssistant Component                                 │ │
│  │                                                           │ │
│  │  1. Генерирует sessionId = crypto.randomUUID()          │ │
│  │  2. Подключается к WebSocket с sessionId                │ │
│  │  3. Передает sessionId в ElevenLabs через overrides      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                    │
│                          ├──────────────┐                     │
│                          │              │                     │
│                          ▼              ▼                     │
│             ┌─────────────────┐   ┌────────────┐            │
│             │ ElevenLabs Agent│   │  WebSocket │            │
│             │ (sessionId in   │   │   Client   │            │
│             │  variables)     │   │ (registered│            │
│             └─────────────────┘   │ sessionId) │            │
│                                   └────────────┘            │
└──────────────────────────────────────────────────────────────┘
                   │                        ▲
                   │                        │
                   ▼                        │
         ┌───────────────────────────────────────┐
         │   ElevenLabs Agent (MCP tools)        │
         │                                        │
         │  - Получает sessionId из variables     │
         │  - Отправляет команды через WebSocket │
         │    используя sessionId                 │
         └───────────────────────────────────────┘
```

## Компоненты

### 1. BrowserControlWebSocket Service

**Файл**: `src/services/browserControlWebSocket.js`

WebSocket клиент, который:
- Подключается к WebSocket серверу
- Регистрирует sessionId на сервере
- Обрабатывает входящие команды управления браузером
- Автоматически переподключается при разрыве соединения

#### Поддерживаемые команды:

##### execute (HIGH-LEVEL)
**РЕКОМЕНДУЕТСЯ**: Выполнение высокоуровневых команд с простой структурой `{id, description}`.

Агент получает список доступных команд в `actionsMap.commands` и выполняет их по ID.

```javascript
{
  command: 'execute',
  params: {
    id: 'view_car_1'  // ID команды из списка
  }
}
```

**Примеры команд**:
- Навигация: `go_home`, `go_cars`, `go_about`, `go_contact`
- Просмотр авто: `view_car_1`, `view_car_2`, `view_car_3`
- Фильтры по марке: `filter_make_bmw`, `filter_make_audi`, `filter_make_all`
- Фильтры по цене: `filter_price_low`, `filter_price_mid`, `filter_price_high`
- Поиск: `search_bmw`, `search_mercedes`, `search_clear`
- Действия: `clear_all_filters`, `scroll_top`, `scroll_bottom`
- Комбинированные: `show_cheap_bmw`, `show_luxury_mercedes`

См. [HIGH_LEVEL_COMMANDS.md](./HIGH_LEVEL_COMMANDS.md) для подробностей.

##### navigate (LOW-LEVEL)
Навигация по внутренним страницам приложения через клиентский роутинг (HashRouter).

**ВАЖНО**: Принимает только локальные path (например `/cars`, `/car/123`). Внешние URL и полная перезагрузка страницы запрещены для безопасности.

```javascript
{
  command: 'navigate',
  params: {
    path: '/cars',  // Только локальные path, начинающиеся с "/"
    queryParams: { filter: 'bmw' }  // Опционально
  }
}
```

**Валидация**:
- ✅ Разрешено: `/cars`, `/car/123`, `/about`
- ❌ Запрещено: `https://example.com`, `//external.com`, `external.com`

##### click
```javascript
{
  command: 'click',
  params: {
    selector: '#button-id' // CSS selector
  }
}
```

##### fill
```javascript
{
  command: 'fill',
  params: {
    selector: 'input[name="email"]',
    value: 'test@example.com'
  }
}
```

##### scroll
```javascript
{
  command: 'scroll',
  params: {
    x: 0,
    y: 1000
  }
}
```

### 2. VoiceAssistant Component

**Файл**: `src/components/VoiceAssistant.jsx`

Обновленный компонент, который:
1. Генерирует `sessionId` при открытии (`crypto.randomUUID()`)
2. Подключается к WebSocket серверу с `sessionId`
3. Передает `sessionId` в ElevenLabs через `overrides.agent.prompt.variables`
4. Отключается от WebSocket при закрытии

#### Передача sessionId в ElevenLabs:

```javascript
await conversation.startSession({
  agentId: AGENT_ID,
  overrides: {
    agent: {
      prompt: {
        variables: {
          sessionId: sessionId,
          browserControlEnabled: true
        }
      }
    }
  }
});
```

## Переменные окружения

### Локальная разработка (`.env`)

```bash
# Browser Control WebSocket Server URL
VITE_BROWSER_CONTROL_WS_URL=ws://localhost:4335/browser-control

# ElevenLabs Agent ID
VITE_ELEVENLABS_AGENT_ID=agent_5401k7rsje0efeha45my8vkajp8t
```

### Production (`.env.production`)

```bash
# Browser Control WebSocket Server URL
VITE_BROWSER_CONTROL_WS_URL=wss://car-frontend-api.test.meteora.pro/browser-control

# ElevenLabs Agent ID
VITE_ELEVENLABS_AGENT_ID=agent_3701k17y6168fzg8zag3efhsmz7y
```

**Как это работает:**
- `pnpm dev` использует `.env` (локальные настройки)
- `pnpm build` использует `.env.production` (продакшн настройки)
- Fallback значения в коде на случай отсутствия переменных

## WebSocket Protocol

### Client → Server

#### Регистрация сессии
```json
{
  "type": "register",
  "sessionId": "uuid-here",
  "timestamp": 1234567890
}
```

#### Отмена регистрации
```json
{
  "type": "unregister",
  "sessionId": "uuid-here",
  "timestamp": 1234567890
}
```

#### Подтверждение выполнения команды
```json
{
  "type": "ack",
  "command": "click",
  "success": true,
  "error": null,
  "sessionId": "uuid-here",
  "timestamp": 1234567890
}
```

### Server → Client

#### Команда управления браузером (HIGH-LEVEL)
```json
{
  "type": "command",
  "sessionId": "uuid-here",
  "command": "execute",
  "params": {
    "id": "view_car_1"
  },
  "timestamp": 1234567890
}
```

#### Команда управления браузером (LOW-LEVEL)
```json
{
  "type": "command",
  "sessionId": "uuid-here",
  "command": "navigate",
  "params": {
    "path": "/cars",
    "queryParams": { "filter": "bmw" }
  },
  "timestamp": 1234567890
}
```

**Важно**: Для команды `navigate` используйте параметр `path` (локальный путь), а не `url`.
Для обратной совместимости поддерживается также параметр `url`, но он должен содержать только локальный path.

## Использование с MCP Tools

### 1. В ElevenLabs Agent

Агент получает `sessionId` через переменные:

```javascript
// В промпте агента доступна переменная
{{sessionId}}
```

### 2. MCP Tool для управления браузером

```typescript
// Пример MCP tool
async function sendBrowserCommand(
  sessionId: string,
  command: string,
  params: object
) {
  // Находим WebSocket соединение по sessionId
  const ws = findWebSocketBySessionId(sessionId);

  if (!ws) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  // Отправляем команду
  ws.send(JSON.stringify({
    type: 'command',
    sessionId,
    command,
    params,
    timestamp: Date.now()
  }));
}

// Использование
await sendBrowserCommand(sessionId, 'navigate', {
  path: '/cars'  // Только локальный path, без domain и hash
});
```

## Примеры использования

### HIGH-LEVEL команды (рекомендуется)

#### Просмотр конкретного автомобиля

```javascript
// Агент выбирает команду из списка actionsMap.commands
// Пользователь: "Show me the BMW X5"
// Агент находит: { id: 'view_car_1', description: 'View BMW X5 2020 (€32,500)' }
{
  command: 'execute',
  params: {
    id: 'view_car_1'
  }
}
```

#### Фильтрация по марке

```javascript
// Пользователь: "Show me only BMW cars"
// Команда: { id: 'filter_make_bmw', description: 'Show only BMW cars' }
{
  command: 'execute',
  params: {
    id: 'filter_make_bmw'
  }
}
```

#### Комбинированная фильтрация

```javascript
// Пользователь: "Show me cheap BMW cars"
// Команда: { id: 'show_cheap_bmw', description: 'Show BMW cars under €25,000' }
{
  command: 'execute',
  params: {
    id: 'show_cheap_bmw'
  }
}
```

#### Очистка всех фильтров

```javascript
// Пользователь: "Clear all filters"
// Команда: { id: 'clear_all_filters', description: 'Clear all filters and search' }
{
  command: 'execute',
  params: {
    id: 'clear_all_filters'
  }
}
```

### LOW-LEVEL команды (для сложных кейсов)

#### Навигация на страницу автомобилей

```javascript
// Агент отправляет команду через MCP tool
{
  command: 'navigate',
  params: {
    path: '/cars'  // HashRouter автоматически добавит #
  }
}
```

### Навигация на конкретный автомобиль

```javascript
{
  command: 'navigate',
  params: {
    path: '/car/123'  // Результат: window.location.hash = "#/car/123"
  }
}
```

### Фильтрация по марке BMW

```javascript
// 1. Открыть страницу с query параметрами
{
  command: 'navigate',
  params: {
    path: '/cars',
    queryParams: { make: 'BMW' }  // Результат: #/cars?make=BMW
  }
}

// 2. Выбрать фильтр
{
  command: 'click',
  params: { selector: 'select[name="make"]' }
}

// 3. Выбрать BMW
{
  command: 'click',
  params: { selector: 'option[value="BMW"]' }
}
```

### Поиск автомобиля

```javascript
{
  command: 'fill',
  params: {
    selector: '#car-search-input',
    value: 'Ferrari'
  }
}
```

### Работа с фильтрами на странице /cars

На странице `/cars` доступны три основных элемента фильтрации:
- **Поиск**: `#car-search-input` - input для поиска по марке и модели
- **Фильтр по марке**: `#car-make-filter` - select с динамическим списком марок
- **Фильтр по цене**: `#car-price-filter` - select с предопределенными диапазонами цен
- **Очистка фильтров**: `#car-clear-filters-btn` - кнопка для сброса всех фильтров

#### Пример 1: Поиск по тексту

```javascript
// Искать BMW
{
  command: 'fill',
  params: {
    selector: '#car-search-input',
    value: 'BMW'
  }
}
```

#### Пример 2: Фильтрация по марке

```javascript
// Установить фильтр на Mercedes-Benz
{
  command: 'fill',
  params: {
    selector: '#car-make-filter',
    value: 'Mercedes-Benz'
  }
}

// Альтернативно через выбор опции (если нужно визуально открыть dropdown):
// 1. Открыть dropdown
{
  command: 'click',
  params: { selector: '#car-make-filter' }
}

// 2. Выбрать опцию
{
  command: 'click',
  params: { selector: '#car-make-filter option[value="Mercedes-Benz"]' }
}
```

#### Пример 3: Фильтрация по цене

```javascript
// Показать только автомобили дешевле €25,000
{
  command: 'fill',
  params: {
    selector: '#car-price-filter',
    value: 'under-25000'
  }
}

// Показать автомобили в диапазоне €25,000 - €35,000
{
  command: 'fill',
  params: {
    selector: '#car-price-filter',
    value: '25000-35000'
  }
}

// Показать дорогие автомобили (> €35,000)
{
  command: 'fill',
  params: {
    selector: '#car-price-filter',
    value: 'over-35000'
  }
}
```

#### Пример 4: Комбинированный сценарий

```javascript
// Сценарий: Найти BMW дешевле €25,000
// 1. Перейти на страницу cars
{
  command: 'navigate',
  params: { path: '/cars' }
}

// 2. Ввести "BMW" в поиск
{
  command: 'fill',
  params: {
    selector: '#car-search-input',
    value: 'BMW'
  }
}

// 3. Установить фильтр по цене
{
  command: 'fill',
  params: {
    selector: '#car-price-filter',
    value: 'under-25000'
  }
}
```

#### Пример 5: Очистка фильтров

```javascript
// Сбросить все фильтры и показать весь инвентарь
{
  command: 'click',
  params: { selector: '#car-clear-filters-btn' }
}
```

#### Пример 6: Получение доступных опций фильтров

При подключении WebSocket, клиент автоматически отправляет карту доступных действий (`actionsMap`), которая включает:

```json
{
  "interactiveElements": [
    {
      "selector": "#car-make-filter",
      "type": "select",
      "label": "Any Make",
      "options": [
        { "value": "", "label": "Any Make", "selected": true },
        { "value": "BMW", "label": "BMW", "selected": false },
        { "value": "Mercedes-Benz", "label": "Mercedes-Benz", "selected": false },
        { "value": "Audi", "label": "Audi", "selected": false }
        // ... другие марки из API
      ]
    },
    {
      "selector": "#car-price-filter",
      "type": "select",
      "label": "Any Price",
      "options": [
        { "value": "", "label": "Any Price", "selected": true },
        { "value": "under-25000", "label": "Under €25,000", "selected": false },
        { "value": "25000-35000", "label": "€25,000 - €35,000", "selected": false },
        { "value": "over-35000", "label": "Over €35,000", "selected": false }
      ]
    }
  ]
}
```

Агент может использовать эту информацию для:
- Предложения доступных марок автомобилей
- Информирования о доступных диапазонах цен
- Валидации пользовательского ввода перед отправкой команд

## Тестирование

### Тестирование команд из консоли браузера

Все команды доступны через глобальный объект `window.browserControl`:

```javascript
// Показать справку
window.browserControl.help()

// Показать все доступные команды
window.browserControl.list()

// Поиск команд
window.browserControl.search('bmw')

// Выполнить команду
window.browserControl.execute('view_car_1')

// Статус подключения
window.browserControl.status()

// Получить массив команд
window.browserControl.getCommands()
```

**Примеры:**

```javascript
// Перейти на главную
window.browserControl.execute('go_home')

// Показать BMW автомобили
window.browserControl.execute('filter_make_bmw')

// Показать дешевые BMW
window.browserControl.execute('show_cheap_bmw')

// Очистить фильтры
window.browserControl.execute('clear_all_filters')
```

### Локальное тестирование с WebSocket

1. Запустите WebSocket сервер (если есть):
```bash
# В отдельном терминале
node websocket-server.js
```

2. Запустите dev сервер:
```bash
pnpm dev
```

3. Откройте браузер и откройте консоль
4. Нажмите на кнопку голосового ассистента
5. В консоли вы увидите:
```
Generated session ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Browser control WebSocket connected
Conversation started with session ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

6. Тестируйте команды через `window.browserControl.execute()`

### Тестирование без WebSocket сервера

Приложение корректно работает даже если WebSocket сервер недоступен:
- Выводится предупреждение в консоль
- Голосовой ассистент продолжает работать
- sessionId все равно передается в ElevenLabs

## Безопасность

1. **Session ID**: Генерируется на клиенте через `crypto.randomUUID()` (криптографически стойкий)
2. **WebSocket**: Используйте `wss://` для production
3. **Аутентификация**: Добавьте токен авторизации при подключении к WebSocket
4. **Валидация**: Проверяйте селекторы и параметры на сервере перед выполнением
5. **Навигация**:
   - ✅ Разрешена только навигация по локальным path приложения
   - ❌ Внешние URL запрещены (блокируются на клиенте)
   - ✅ Используется клиентский роутинг без перезагрузки страницы
   - ❌ Невозможно уйти с текущего сайта через команду navigate

## Troubleshooting

### WebSocket не подключается

```
Failed to connect to browser control WebSocket
```

**Решение**: Проверьте что WebSocket сервер запущен и доступен по URL из `.env`

### Session ID не передается в агента

**Решение**: Убедитесь что используете правильный формат для `overrides`:
```javascript
overrides: {
  agent: {
    prompt: {
      variables: { sessionId }
    }
  }
}
```

### Команды не выполняются

**Решение**: Проверьте селекторы в инструментах разработчика браузера

### Команда navigate отклонена (External URLs are not allowed)

```
[BrowserControl] Navigate: external URLs are not allowed. Use only local paths like "/cars" or "/car/123"
```

**Причина**: Попытка навигации на внешний URL или некорректный формат path

**Решение**:
- Используйте только локальные path: `/cars`, `/car/123`, `/about`
- Не используйте полные URL: `https://example.com`, `http://...`
- Path должен начинаться с `/`
- Для навигации на сторонние сайты используйте другой подход (например, открытие в новой вкладке через click на ссылке)

## Дальнейшее развитие

### Реализовано
- [x] **Высокоуровневые команды (execute)** - система упрощенных команд с `{id, description}`
  - Автоматическая генерация команд из данных приложения
  - Динамическое обновление при изменении маршрута
  - Контекстная доступность команд
  - См. [HIGH_LEVEL_COMMANDS.md](./HIGH_LEVEL_COMMANDS.md)

### Планируется
- [ ] Добавить больше команд (hover, select, screenshot)
- [ ] Реализовать очередь команд
- [ ] Добавить retry логику для failed команд
- [ ] Создать визуальный индикатор активных команд
- [ ] Логирование всех команд для отладки
