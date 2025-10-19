# ElevenLabs Agent Setup Guide

Это руководство описывает настройку ElevenLabs агента для работы с dynamic variables и управления браузером через WebSocket.

## Содержание

- [Обзор](#обзор)
- [Настройка Dynamic Variables](#настройка-dynamic-variables)
- [Настройка System Prompt](#настройка-system-prompt)
- [Примеры использования](#примеры-использования)
- [Тестирование](#тестирование)
- [Troubleshooting](#troubleshooting)

## Обзор

Наше приложение передает в ElevenLabs агента следующие динамические переменные:

- `sessionId` - уникальный идентификатор сессии браузера (используется для управления браузером через WebSocket)
- `availableCars` - список доступных автомобилей в формате CSV (для информирования агента об инвентаре)

Эти переменные передаются при запуске сессии через React SDK:

```javascript
await conversation.startSession({
  agentId: AGENT_ID,
  dynamicVariables: {
    sessionId: sessionId,
    browserControlEnabled: true,
    availableCars: availableCars  // CSV формат
  }
});
```

## Настройка Dynamic Variables

### Шаг 1: Определение переменных в System Prompt

В [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai) откройте настройки вашего агента и в разделе **System Prompt** добавьте определения переменных с использованием синтаксиса `{{variable_name}}`:

```
You are a helpful car dealership assistant for Cool Cars Amsterdam.
You can help customers browse our car inventory, answer questions about specific cars,
and book test drives.

BROWSER CONTROL:
Your browser session ID is: {{sessionId}}
Browser control is enabled: {{browserControlEnabled}}

When browser control is enabled (browserControlEnabled is true), you can use MCP tools
to control the browser using the sessionId. This allows you to:
- Navigate to specific car pages
- Fill out forms (test drive booking, contact forms)
- Show specific information to the customer
- Scroll to relevant sections

Always use the sessionId when calling browser control MCP tools to ensure you're
controlling the correct browser instance.

AVAILABLE CARS INVENTORY:
Below is the current inventory of available cars in CSV format:
{{availableCars}}

Each row contains: id, make, model, year, price, mileage, fuelType, transmission, color
Use this information to answer questions about available cars, prices, and specifications.
When referring to a specific car, use the car's ID to navigate to its details page.

GUIDELINES:
- Be friendly and professional
- Provide accurate information about cars from the availableCars inventory
- Help customers find the right car for their needs
- Offer to book test drives when appropriate
- Use browser control to enhance the customer experience
- When showing a car, use the car's ID from the inventory (e.g., view_car_123)
```

### Шаг 2: Включение Security Settings для Dynamic Variables

1. В настройках агента перейдите в раздел **Security**
2. Убедитесь, что опция **"Allow dynamic variables"** включена
3. Если вы также используете overrides для System Prompt или First Message, включите соответствующие опции

## Примеры использования переменных

### Пример 1: Проверка доступности browser control

```
If {{browserControlEnabled}} is true, I can help you navigate the website.
```

### Пример 2: Использование sessionId в MCP tools

Когда агент вызывает MCP tool для управления браузером, он должен передавать `{{sessionId}}`:

```json
{
  "tool": "browser_navigate",
  "parameters": {
    "sessionId": "{{sessionId}}",
    "url": "/car/123"
  }
}
```

### Пример 3: Использование availableCars для ответов

Агент может использовать данные из `{{availableCars}}` для точных ответов о наличии и характеристиках автомобилей:

**Формат CSV данных:**
```csv
id,make,model,year,price,mileage,fuelType,transmission,color
1,BMW,X5,2022,75000,12000,Diesel,Automatic,Black
2,Mercedes-Benz,C-Class,2023,55000,5000,Petrol,Automatic,Silver
3,Audi,A4,2021,45000,25000,Diesel,Manual,Blue
```

**Пример диалога:**
```
Customer: "Do you have any BMW cars available?"
Agent: "Yes! Looking at our current inventory, we have a 2022 BMW X5 in Black with 12,000 km,
        priced at €75,000. It has a Diesel engine and automatic transmission.
        Would you like me to show you more details about this car?"
```

## Настройка System Prompt

### Рекомендуемая структура промпта

```
[ROLE DESCRIPTION]
You are a helpful car dealership assistant...

[BROWSER CONTROL VARIABLES]
Session ID: {{sessionId}}
Browser Control Enabled: {{browserControlEnabled}}

[AVAILABLE INVENTORY]
Current cars in stock (CSV format):
{{availableCars}}

Format: id,make,model,year,price,mileage,fuelType,transmission,color
Use this data to answer questions about available cars accurately.

[CAPABILITIES]
When browser control is enabled, you can...

[GUIDELINES]
- Use availableCars data to provide accurate inventory information
- Reference car IDs when navigating (e.g., view_car_1)
- Do this...
- Don't do that...

[EXAMPLE SCENARIOS]
Customer: "I want to see the BMW X5"
You: Let me navigate to that car for you... [uses browser control with car ID from availableCars]
```

## Тестирование

### Локальное тестирование

1. Запустите локальный backend с WebSocket сервером:
   ```bash
   # Backend должен слушать на ws://localhost:4335/browser-control
   ```

2. Убедитесь что `.env` содержит правильные значения:
   ```bash
   VITE_ELEVENLABS_AGENT_ID=agent_5401k7rsje0efeha45my8vkajp8t
   VITE_BROWSER_CONTROL_WS_URL=ws://localhost:4335/browser-control
   ```

3. Запустите frontend:
   ```bash
   pnpm dev
   ```

4. Откройте браузер на `http://localhost:5173` и нажмите кнопку микрофона

5. Проверьте консоль браузера на предмет ошибок:
   ```
   Generated session ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Browser control WebSocket connected
   Conversation started with session ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### Production тестирование

Для production используйте значения из `.env.production`:
```bash
VITE_ELEVENLABS_AGENT_ID=agent_3701k17y6168fzg8zag3efhsmz7y
VITE_BROWSER_CONTROL_WS_URL=wss://car-frontend-api.test.meteora.pro/browser-control
```

## Troubleshooting

### Переменные не передаются в агента

**Проблема**: Агент не видит значения `{{sessionId}}` или `{{browserControlEnabled}}`

**Решение**:
1. Проверьте что в Security settings включена опция "Allow dynamic variables"
2. Убедитесь что переменные определены в System Prompt с синтаксисом `{{variable_name}}`
3. Проверьте консоль браузера - должно быть сообщение "Conversation started with session ID: ..."

### WebSocket не подключается

**Проблема**: В консоли ошибка "Failed to connect to browser control WebSocket"

**Решение**:
1. Проверьте что backend сервер запущен и слушает на правильном порту
2. Проверьте URL в `.env` файле
3. Для production убедитесь что используется `wss://` (secure WebSocket)
4. Проверьте firewall и CORS настройки на backend

### Агент не использует browser control

**Проблема**: Агент не вызывает MCP tools для управления браузером

**Решение**:
1. Убедитесь что в System Prompt четко описано когда и как использовать browser control
2. Проверьте что MCP tools правильно настроены на стороне агента
3. Добавьте примеры использования в промпт
4. Проверьте что `browserControlEnabled` передается как `true`

## Дополнительная информация

- [ElevenLabs Dynamic Variables Documentation](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [ElevenLabs React SDK Documentation](https://elevenlabs.io/docs/agents-platform/libraries/react)
- [Browser Control WebSocket Documentation](./BROWSER_CONTROL_WEBSOCKET.md)

## Переменные окружения

Все конфигурационные параметры хранятся в `.env` файлах:

| Переменная | Описание | Local значение | Production значение |
|-----------|----------|----------------|---------------------|
| `VITE_ELEVENLABS_AGENT_ID` | ID агента ElevenLabs | `agent_5401k7rsje0efeha45my8vkajp8t` | `agent_3701k17y6168fzg8zag3efhsmz7y` |
| `VITE_BROWSER_CONTROL_WS_URL` | URL WebSocket сервера | `ws://localhost:4335/browser-control` | `wss://car-frontend-api.test.meteora.pro/browser-control` |
| `VITE_CAR_API_URL` | URL Car Inventory API | `http://localhost:4335` | `https://car-frontend-api.test.meteora.pro` |
| `VITE_DEALER_ID` | ID дилера | `shiftgears_demo` | `shiftgears_demo` |
