# High-Level Commands System

## Концепция

Вместо сложных низкоуровневых команд с селекторами и последовательностями действий, используем **простой плоский список высокоуровневых команд**.

### Принцип максимальной простоты

Каждая команда состоит только из двух полей:
- `id` - уникальный идентификатор для выполнения
- `description` - человекочитаемое описание на английском

```javascript
{
  id: 'view_car_123',
  description: 'View BMW X5 2020 (€35,000) details'
}
```

Агент читает `description`, выбирает нужную команду, и отправляет `id` для выполнения.

## Сравнение подходов

### Было (низкоуровневые команды)

Агент должен знать:
- Селекторы элементов
- Последовательность действий
- Структуру URL

```javascript
// Агент составляет сложную последовательность:
1. navigate({ route: '/cars' })
2. fill({ selector: '#car-search-input', value: 'BMW' })
3. fill({ selector: '#car-price-filter', value: 'under-25000' })
```

### Стало (высокоуровневые команды)

Агент просто выбирает из списка:

```javascript
{
  id: 'show_cheap_bmw',
  description: 'Show BMW cars under €25,000'
}

// Агент отправляет:
execute({ id: 'show_cheap_bmw' })
```

## Категории команд

### 1. Навигация (Navigation)

Переходы между страницами и к конкретным автомобилям:

```javascript
{ id: 'go_home', description: 'Go to homepage' }
{ id: 'go_cars', description: 'Go to cars inventory page' }
{ id: 'go_about', description: 'Go to about us page' }
{ id: 'go_contact', description: 'Go to contact page' }

// Динамические команды для каждого авто:
{ id: 'view_car_1', description: 'View BMW X5 2020 (€35,000) details' }
{ id: 'view_car_2', description: 'View Mercedes-Benz E-Class 2019 (€32,000) details' }
{ id: 'view_car_3', description: 'View Audi A4 2021 (€28,000) details' }
```

### 2. Фильтры (Filters)

Применение фильтров по марке и цене:

```javascript
// Фильтры по марке (динамические, из API):
{ id: 'filter_make_bmw', description: 'Show only BMW cars' }
{ id: 'filter_make_mercedes', description: 'Show only Mercedes-Benz cars' }
{ id: 'filter_make_audi', description: 'Show only Audi cars' }
{ id: 'filter_make_all', description: 'Show all car makes' }

// Фильтры по цене:
{ id: 'filter_price_low', description: 'Show cars under €25,000' }
{ id: 'filter_price_mid', description: 'Show cars €25,000 - €35,000' }
{ id: 'filter_price_high', description: 'Show cars over €35,000' }
{ id: 'filter_price_all', description: 'Show all price ranges' }
```

### 3. Поиск (Search)

Предопределенные поисковые запросы:

```javascript
{ id: 'search_bmw', description: 'Search for BMW cars' }
{ id: 'search_mercedes', description: 'Search for Mercedes cars' }
{ id: 'search_audi', description: 'Search for Audi cars' }
{ id: 'search_suv', description: 'Search for SUV models' }
{ id: 'search_clear', description: 'Clear search field' }
```

### 4. Действия (Actions)

Основные действия на странице:

```javascript
{ id: 'clear_all_filters', description: 'Clear all filters and search' }
{ id: 'scroll_top', description: 'Scroll to top of page' }
{ id: 'scroll_bottom', description: 'Scroll to bottom of page' }
```

### 5. Комбинированные команды (Combined)

Сложные сценарии в одной команде:

```javascript
{ id: 'show_cheap_bmw', description: 'Show BMW cars under €25,000' }
{ id: 'show_luxury_mercedes', description: 'Show Mercedes-Benz cars over €35,000' }
{ id: 'show_mid_range_audi', description: 'Show Audi cars €25,000-€35,000' }
```

## Контекстная доступность

Команды могут быть доступны только в определенном контексте:

```javascript
// На главной странице (/):
[
  { id: 'go_cars', description: 'Go to cars inventory page' },
  { id: 'go_about', description: 'Go to about us page' },
  { id: 'view_car_1', description: 'View BMW X5 2020 (featured car)' }
]

// На странице инвентаря (/cars):
[
  { id: 'go_home', description: 'Go to homepage' },
  { id: 'filter_make_bmw', description: 'Show only BMW cars' },
  { id: 'filter_price_low', description: 'Show cars under €25,000' },
  { id: 'view_car_1', description: 'View BMW X5 2020' },
  { id: 'view_car_2', description: 'View Mercedes E-Class 2019' },
  { id: 'clear_all_filters', description: 'Clear all filters' }
]

// На странице автомобиля (/car/123):
[
  { id: 'go_back_cars', description: 'Go back to inventory' },
  { id: 'view_car_2', description: 'View next car (Mercedes E-Class)' },
  { id: 'scroll_to_features', description: 'Scroll to features section' }
]
```

## Динамическая генерация команд

Команды генерируются динамически на основе:
1. **Текущий route** - какие команды доступны на этой странице
2. **Данные из API** - список автомобилей, марки, цены
3. **Состояние UI** - активные фильтры, поисковый запрос

### Пример генератора

```javascript
function generateCommands(cars, currentRoute) {
  const commands = [];

  // 1. Навигация (всегда доступны)
  if (currentRoute !== '/') {
    commands.push({ id: 'go_home', description: 'Go to homepage' });
  }
  if (currentRoute !== '/cars') {
    commands.push({ id: 'go_cars', description: 'Go to cars inventory' });
  }

  // 2. Команды для просмотра автомобилей
  cars.forEach(car => {
    commands.push({
      id: `view_car_${car.id}`,
      description: `View ${car.make} ${car.model} ${car.year} (€${car.price.toLocaleString()})`
    });
  });

  // 3. Фильтры по маркам (только на /cars)
  if (currentRoute === '/cars') {
    const uniqueMakes = [...new Set(cars.map(c => c.make))];
    uniqueMakes.forEach(make => {
      commands.push({
        id: `filter_make_${make.toLowerCase().replace(/\s+/g, '_')}`,
        description: `Show only ${make} cars`
      });
    });

    // Фильтры по цене
    commands.push(
      { id: 'filter_price_low', description: 'Show cars under €25,000' },
      { id: 'filter_price_mid', description: 'Show cars €25,000-€35,000' },
      { id: 'filter_price_high', description: 'Show cars over €35,000' }
    );

    // Очистка
    commands.push({ id: 'clear_all_filters', description: 'Clear all filters' });
  }

  return commands;
}
```

## Выполнение команд

### На клиенте (браузер)

```javascript
class BrowserControlWebSocket {
  // Обработка команды execute
  handleExecute({ id, params }) {
    console.log(`[BrowserControl] Executing command: ${id}`);

    // Простой switch по id
    if (id === 'go_home') {
      window.location.hash = '#/';
    }
    else if (id === 'go_cars') {
      window.location.hash = '#/cars';
    }
    else if (id.startsWith('view_car_')) {
      const carId = id.replace('view_car_', '');
      window.location.hash = `#/car/${carId}`;
    }
    else if (id.startsWith('filter_make_')) {
      const make = id.replace('filter_make_', '').replace(/_/g, ' ');
      document.querySelector('#car-make-filter').value = make;
      document.querySelector('#car-make-filter').dispatchEvent(new Event('change', { bubbles: true }));
    }
    else if (id === 'filter_price_low') {
      document.querySelector('#car-price-filter').value = 'under-25000';
      document.querySelector('#car-price-filter').dispatchEvent(new Event('change', { bubbles: true }));
    }
    else if (id === 'clear_all_filters') {
      document.querySelector('#car-clear-filters-btn').click();
    }

    this.sendAck('execute', true, null, { id });
  }
}
```

### От агента (через MCP tool)

```typescript
// Агент получает список команд
const availableCommands = actionsMap.commands;
// [
//   { id: 'view_car_1', description: 'View BMW X5 2020 (€35,000)' },
//   { id: 'filter_make_bmw', description: 'Show only BMW cars' },
//   ...
// ]

// Агент выбирает команду на основе запроса пользователя
// User: "Show me BMW cars"
// Agent анализирует descriptions и выбирает:
const selectedCommand = 'filter_make_bmw';

// Агент отправляет команду через WebSocket
await sendBrowserCommand(sessionId, 'execute', {
  id: selectedCommand
});
```

## Протокол WebSocket

### Регистрация с командами

```json
{
  "type": "register",
  "sessionId": "uuid",
  "actionsMap": {
    "commands": [
      { "id": "go_home", "description": "Go to homepage" },
      { "id": "view_car_1", "description": "View BMW X5 2020 (€35,000)" },
      { "id": "filter_make_bmw", "description": "Show only BMW cars" }
    ],
    "currentPage": {
      "route": "/cars",
      "title": "Cars Inventory"
    }
  }
}
```

### Выполнение команды

**Агент → Браузер:**
```json
{
  "type": "command",
  "sessionId": "uuid",
  "command": "execute",
  "params": {
    "id": "filter_make_bmw"
  }
}
```

**Браузер → Агент (ACK):**
```json
{
  "type": "ack",
  "command": "execute",
  "success": true,
  "data": {
    "id": "filter_make_bmw"
  },
  "sessionId": "uuid"
}
```

## План реализации

### Этап 1: Генератор команд

**Файл**: `src/services/commandGenerator.js`

```javascript
export function generateCommands(cars, currentRoute, filters = {}) {
  const commands = [];

  // Навигация
  commands.push(...generateNavigationCommands(currentRoute));

  // Просмотр автомобилей
  commands.push(...generateCarViewCommands(cars));

  // Фильтры (только на /cars)
  if (currentRoute === '/cars') {
    commands.push(...generateFilterCommands(cars));
    commands.push(...generateActionCommands());
  }

  return commands;
}
```

### Этап 2: Обновление WebSocket клиента

**Файл**: `src/services/browserControlWebSocket.js`

Добавить обработчик `execute`:
```javascript
handleMessage(data) {
  const { command, params } = data;

  switch (command) {
    case 'execute':
      this.handleExecute(params);
      break;
    // ... остальные команды
  }
}

handleExecute({ id, params }) {
  // Switch по id команды
  // Выполнение действия
  // Отправка ACK
}
```

### Этап 3: React hook для генерации

**Файл**: `src/hooks/useCommands.js`

```javascript
export function useCommands() {
  const { getAllCars } = useCars();
  const location = useLocation();

  const commands = useMemo(() => {
    return generateCommands(getAllCars(), location.pathname);
  }, [getAllCars, location.pathname]);

  // Обновляем WebSocket при изменении команд
  useEffect(() => {
    browserControlWS.updateCommands(commands);
  }, [commands]);

  return commands;
}
```

### Этап 4: Интеграция в App

**Файл**: `src/App.jsx`

```javascript
function App() {
  useCommands(); // Автоматически генерирует и обновляет команды

  return (
    <Router>
      <CarsProvider>
        {/* ... */}
      </CarsProvider>
    </Router>
  );
}
```

### Этап 5: Обновление документации

Обновить `BROWSER_CONTROL_WEBSOCKET.md`:
- Секция про высокоуровневые команды
- Примеры execute
- Как работает генерация команд

## Преимущества

✅ **Простота для агента** - плоский список с описаниями
✅ **Нет селекторов** - агент не знает о DOM
✅ **Контекстная доступность** - команды фильтруются по странице
✅ **Динамические команды** - генерируются из данных API
✅ **Расширяемость** - легко добавлять новые команды
✅ **Атомарность** - одна команда = одно действие
✅ **Обратная совместимость** - низкоуровневые команды остаются

## Примеры использования

### Пример 1: Просмотр конкретного автомобиля

**User**: "Show me the BMW X5"

**Agent думает**:
- Ищет в commands где description содержит "BMW X5"
- Находит: `{ id: 'view_car_1', description: 'View BMW X5 2020 (€35,000)' }`
- Отправляет: `execute({ id: 'view_car_1' })`

**Результат**: Браузер переходит на `/car/1`

### Пример 2: Фильтрация

**User**: "Show me cheap BMWs"

**Agent думает**:
- Нужно показать BMW и дешевые машины
- Находит: `{ id: 'show_cheap_bmw', description: 'Show BMW cars under €25,000' }`
- Отправляет: `execute({ id: 'show_cheap_bmw' })`

**Результат**: Применяются оба фильтра (марка + цена)

### Пример 3: Навигация

**User**: "Go back to the list"

**Agent думает**:
- Находит: `{ id: 'go_cars', description: 'Go to cars inventory' }`
- Отправляет: `execute({ id: 'go_cars' })`

**Результат**: Браузер переходит на `/cars`

## Тестирование команд

Все команды доступны через глобальный объект `window.browserControl` для удобного тестирования из консоли браузера.

### Основные методы

```javascript
// Показать справку
window.browserControl.help()

// Список всех доступных команд
window.browserControl.list()

// Поиск команд по тексту
window.browserControl.search('bmw')

// Выполнить команду
window.browserControl.execute('view_car_1')

// Статус подключения
window.browserControl.status()
```

### Примеры тестирования

```javascript
// 1. Показать все доступные команды
window.browserControl.list()
// Выведет:
// === Available Commands (45) ===
// 1. go_home
//    Go to homepage
// 2. go_cars
//    Go to cars inventory page
// ...

// 2. Найти команды связанные с BMW
window.browserControl.search('bmw')
// Выведет все команды с 'bmw' в id или description

// 3. Выполнить навигацию
window.browserControl.execute('go_cars')
// [BrowserControl] Executing: Go to cars inventory page

// 4. Применить фильтр
window.browserControl.execute('filter_make_bmw')
// [BrowserControl] Executing: Show only BMW cars

// 5. Комбинированная команда
window.browserControl.execute('show_cheap_bmw')
// [BrowserControl] Executing: Show BMW cars under €25,000

// 6. Проверить статус
window.browserControl.status()
// === Browser Control Status ===
// Connected: ✓
// Session ID: xxx-xxx-xxx
// Commands available: 45
// Current route: /cars
```

### Отладка

```javascript
// Получить массив команд для программного доступа
const commands = window.browserControl.getCommands();
console.log(commands);

// Найти конкретную команду
const command = commands.find(c => c.id === 'view_car_1');
console.log(command.description);
```

## Будущие улучшения

### Реализовано
- [x] Глобальный API для тестирования (`window.browserControl`)
- [x] Поиск команд по описанию
- [x] Статус подключения и отладка

### Планируется
- [ ] Добавить параметры к командам для гибкости
- [ ] Поддержка multi-step команд (цепочки)
- [ ] История выполненных команд
- [ ] Undo/Redo для команд
- [ ] Shortcuts для частых команд
- [ ] Локализация descriptions
