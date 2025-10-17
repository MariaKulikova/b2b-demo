/**
 * Генератор высокоуровневых команд для Browser Control
 *
 * Генерирует команды ТОЛЬКО на основе реального инвентаря:
 * - Только существующие марки и модели
 * - Комбинированные команды только если есть результаты
 * - Динамические ценовые диапазоны
 */

/**
 * Генерация команд навигации
 */
function generateNavigationCommands(currentRoute) {
  const commands = [];

  if (currentRoute !== '/') {
    commands.push({
      id: 'go_home',
      description: 'Go to homepage'
    });
  }

  if (currentRoute !== '/cars') {
    commands.push({
      id: 'go_cars',
      description: 'Go to cars inventory page'
    });
  }

  if (currentRoute !== '/about') {
    commands.push({
      id: 'go_about',
      description: 'Go to about us page'
    });
  }

  if (currentRoute !== '/contact') {
    commands.push({
      id: 'go_contact',
      description: 'Go to contact page'
    });
  }

  if (currentRoute.startsWith('/car/')) {
    commands.push({
      id: 'go_back_cars',
      description: 'Go back to cars inventory'
    });
  }

  return commands;
}

/**
 * Генерация команд просмотра автомобилей
 */
function generateCarViewCommands(cars) {
  return cars.map(car => ({
    id: `view_car_${car.id}`,
    description: `View ${car.make} ${car.model} ${car.year} (€${car.price.toLocaleString('en-US')})`
  }));
}

/**
 * Генерация команд фильтрации по маркам (только существующие марки)
 */
function generateMakeFilterCommands(cars) {
  const commands = [];

  // Получаем ТОЛЬКО уникальные марки из реального инвентаря
  const existingMakes = [...new Set(cars.map(c => c.make))].sort();

  existingMakes.forEach(make => {
    const count = cars.filter(c => c.make === make).length;
    commands.push({
      id: `filter_make_${make.toLowerCase().replace(/[\s-]+/g, '_')}`,
      description: `Show ${make} cars (${count} available)`
    });
  });

  commands.push({
    id: 'filter_make_all',
    description: 'Show all car makes'
  });

  return commands;
}

/**
 * Генерация команд фильтрации по моделям (только существующие модели)
 */
function generateModelFilterCommands(cars) {
  const commands = [];

  // Получаем ТОЛЬКО уникальные модели из реального инвентаря
  const existingModels = [...new Set(cars.map(c => c.model))].sort();

  existingModels.forEach(model => {
    const carsWithModel = cars.filter(c => c.model === model);
    const count = carsWithModel.length;
    const make = carsWithModel[0].make; // Марка для контекста

    commands.push({
      id: `filter_model_${model.toLowerCase().replace(/[\s-]+/g, '_')}`,
      description: `Show ${make} ${model} (${count} available)`
    });
  });

  commands.push({
    id: 'filter_model_all',
    description: 'Show all car models'
  });

  return commands;
}

/**
 * Генерация команд фильтрации по цене
 * Используем статичные диапазоны, но можно сделать динамическими
 */
function generatePriceFilterCommands(cars) {
  const commands = [];

  // Подсчитываем количество автомобилей в каждом диапазоне
  const lowCount = cars.filter(c => c.price < 50000).length;
  const midCount = cars.filter(c => c.price >= 50000 && c.price <= 80000).length;
  const highCount = cars.filter(c => c.price > 80000).length;

  if (lowCount > 0) {
    commands.push({
      id: 'filter_price_low',
      description: `Show cars under €50,000 (${lowCount} available)`
    });
  }

  if (midCount > 0) {
    commands.push({
      id: 'filter_price_mid',
      description: `Show cars €50,000 - €80,000 (${midCount} available)`
    });
  }

  if (highCount > 0) {
    commands.push({
      id: 'filter_price_high',
      description: `Show cars over €80,000 (${highCount} available)`
    });
  }

  commands.push({
    id: 'filter_price_all',
    description: 'Show all price ranges'
  });

  return commands;
}

/**
 * Генерация команд поиска (только для существующих марок и моделей)
 */
function generateSearchCommands(cars) {
  const commands = [];

  // Поиск по маркам (только существующие)
  const uniqueMakes = [...new Set(cars.map(c => c.make))].sort();
  uniqueMakes.forEach(make => {
    commands.push({
      id: `search_${make.toLowerCase().replace(/[\s-]+/g, '_')}`,
      description: `Search for ${make} cars`
    });
  });

  commands.push({
    id: 'search_clear',
    description: 'Clear search field'
  });

  return commands;
}

/**
 * Генерация команд действий
 */
function generateActionCommands() {
  return [
    {
      id: 'clear_all_filters',
      description: 'Clear all filters and search'
    },
    {
      id: 'scroll_top',
      description: 'Scroll to top of page'
    },
    {
      id: 'scroll_bottom',
      description: 'Scroll to bottom of page'
    }
  ];
}

/**
 * Генерация комбинированных команд (ТОЛЬКО если есть результаты)
 */
function generateSmartCombinedCommands(cars) {
  const commands = [];
  const uniqueMakes = [...new Set(cars.map(c => c.make))].sort();

  uniqueMakes.forEach(make => {
    const makeCars = cars.filter(c => c.make === make);

    // Дешевые автомобили этой марки (< €50k)
    const cheapCars = makeCars.filter(c => c.price < 50000);
    if (cheapCars.length > 0) {
      commands.push({
        id: `show_cheap_${make.toLowerCase().replace(/[\s-]+/g, '_')}`,
        description: `Show ${make} cars under €50,000 (${cheapCars.length} found)`
      });
    }

    // Средний ценовой сегмент (€50k-€80k)
    const midCars = makeCars.filter(c => c.price >= 50000 && c.price <= 80000);
    if (midCars.length > 0) {
      commands.push({
        id: `show_mid_${make.toLowerCase().replace(/[\s-]+/g, '_')}`,
        description: `Show ${make} cars €50,000-€80,000 (${midCars.length} found)`
      });
    }

    // Дорогие автомобили этой марки (> €80k)
    const luxuryCars = makeCars.filter(c => c.price > 80000);
    if (luxuryCars.length > 0) {
      commands.push({
        id: `show_luxury_${make.toLowerCase().replace(/[\s-]+/g, '_')}`,
        description: `Show ${make} cars over €80,000 (${luxuryCars.length} found)`
      });
    }
  });

  return commands;
}

/**
 * Основная функция генерации всех команд
 *
 * @param {Array} cars - Список автомобилей из API (РЕАЛЬНЫЙ ИНВЕНТАРЬ)
 * @param {string} currentRoute - Текущий маршрут
 * @returns {Array} Массив релевантных команд
 */
export function generateCommands(cars, currentRoute) {
  const commands = [];

  // Проверка на пустой инвентарь
  if (!cars || cars.length === 0) {
    console.warn('[CommandGenerator] No cars in inventory, generating minimal commands');
    return generateNavigationCommands(currentRoute);
  }

  console.log(`[CommandGenerator] Generating commands for ${cars.length} cars`);

  // 1. Навигация (всегда доступна)
  commands.push(...generateNavigationCommands(currentRoute));

  // 2. Просмотр автомобилей (всегда доступно)
  commands.push(...generateCarViewCommands(cars));

  // 3. Команды для страницы /cars
  if (currentRoute === '/cars') {
    commands.push(...generateMakeFilterCommands(cars));
    commands.push(...generateModelFilterCommands(cars));
    commands.push(...generatePriceFilterCommands(cars));
    commands.push(...generateSearchCommands(cars));
    commands.push(...generateActionCommands());
    commands.push(...generateSmartCombinedCommands(cars));
  }

  // 4. Команды для страницы конкретного автомобиля
  if (currentRoute.startsWith('/car/')) {
    const carId = parseInt(currentRoute.split('/')[2]);
    const currentCar = cars.find(c => c.id === carId);

    if (currentCar) {
      const currentIndex = cars.findIndex(c => c.id === carId);

      if (currentIndex > 0) {
        const prevCar = cars[currentIndex - 1];
        commands.push({
          id: `view_car_${prevCar.id}`,
          description: `View previous car (${prevCar.make} ${prevCar.model})`
        });
      }

      if (currentIndex < cars.length - 1) {
        const nextCar = cars[currentIndex + 1];
        commands.push({
          id: `view_car_${nextCar.id}`,
          description: `View next car (${nextCar.make} ${nextCar.model})`
        });
      }
    }
  }

  console.log(`[CommandGenerator] Generated ${commands.length} commands`);

  return commands;
}

export default generateCommands;
