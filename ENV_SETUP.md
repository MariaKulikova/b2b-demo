# Environment Configuration Guide

## Доступные окружения

### 1. Локальная разработка (`.env.local`)
Использует локальный API сервер на `localhost:3334`

```bash
pnpm dev:local
```

**Конфигурация:**
```env
VITE_CAR_API_URL=http://localhost:3334
VITE_BROWSER_CONTROL_WS_URL=ws://localhost:3334/browser-control
VITE_ELEVENLABS_AGENT_ID=agent_5401k7rsje0efeha45my8vkajp8t
```

### 2. Тестовый сервер (`.env.development`)
Использует тестовый API на `car-frontend-api.test.meteora.pro`

```bash
pnpm dev          # По умолчанию
pnpm dev:test     # Явно указать
```

**Конфигурация:**
```env
VITE_CAR_API_URL=https://car-frontend-api.test.meteora.pro
VITE_BROWSER_CONTROL_WS_URL=wss://car-frontend-api.test.meteora.pro/browser-control
VITE_ELEVENLABS_AGENT_ID=agent_3701k17y6168fzg8zag3efhsmz7y
```

### 3. Production (`.env.production`)
Используется при сборке для продакшена

```bash
pnpm build        # Production build
```

## Быстрый старт

### Первая настройка

1. Скопируйте `.env.example` в `.env.local`:
```bash
cp .env.example .env.local
```

2. Отредактируйте `.env.local` под ваши локальные настройки

3. Запустите dev сервер:
```bash
pnpm dev:local    # Локальный API
# или
pnpm dev          # Тестовый API (по умолчанию)
```

## Команды запуска

| Команда | Окружение | Описание |
|---------|-----------|----------|
| `pnpm dev` | development | Тестовый API (по умолчанию) |
| `pnpm dev:local` | local | Локальный API (localhost:3334) |
| `pnpm dev:test` | development | Тестовый API (явно) |
| `pnpm build` | production | Production сборка |
| `pnpm build:test` | development | Тестовая сборка |

## Приоритет загрузки .env файлов

Vite загружает файлы в следующем порядке (последний переопределяет):

1. `.env` - базовый (игнорируется git)
2. `.env.local` - локальные переопределения (игнорируется git)
3. `.env.[mode]` - специфичный для режима (игнорируется git)
4. `.env.[mode].local` - локальные переопределения для режима (игнорируется git)

**Примечание:** Все .env файлы являются локальными и не коммитятся в репозиторий

## Git

**Коммитятся:**
- `.env.example` - пример конфигурации (единственный .env файл в репозитории)

**НЕ коммитятся (в .gitignore):**
- `.env` - базовый файл
- `.env.local` - локальная разработка
- `.env.development` - тестовое окружение
- `.env.production` - продакшен окружение
- Все остальные `.env*` файлы

**Важно:** Каждый разработчик создаёт свои локальные .env файлы на основе .env.example

## Переменные окружения

### VITE_CAR_API_URL
URL API сервера для получения данных об автомобилях

### VITE_DEALER_ID
Идентификатор дилера

### VITE_BROWSER_CONTROL_WS_URL
WebSocket URL для управления браузером через голосового агента

### VITE_ELEVENLABS_AGENT_ID
ID агента ElevenLabs для голосового помощника

## Troubleshooting

### Приложение использует неправильное окружение

1. Проверьте, что запускаете правильную команду
2. Проверьте, что `.env.local` не переопределяет нужные переменные
3. Перезапустите dev сервер

### Изменения в .env не применяются

1. Перезапустите dev сервер (Vite кеширует переменные)
2. Проверьте, что переменная начинается с `VITE_`
3. Очистите кеш: `rm -rf node_modules/.vite`
