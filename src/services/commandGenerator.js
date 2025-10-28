/**
 * Генератор параметризованных команд для Browser Control
 *
 * Новый подход: вместо множества команд с description,
 * генерируем небольшое количество параметризованных команд с params schema.
 *
 * Преимущества:
 * - Сжатие данных (~10 команд вместо 100+)
 * - Структурированность (явные типы и ограничения)
 * - Масштабируемость (добавление авто не увеличивает количество команд)
 */

/**
 * Основная функция генерации параметризованных команд
 *
 * @param {Array} cars - Список автомобилей из API
 * @param {string} currentRoute - Текущий маршрут
 * @returns {Array} Массив параметризованных команд
 */
export function generateCommands(cars, currentRoute) {
  if (!cars || cars.length === 0) {
    console.warn('[CommandGenerator] No cars in inventory, generating minimal commands');
    return generateNavigationCommands(currentRoute);
  }

  console.log(`[CommandGenerator] Generating parameterized commands for ${cars.length} cars`);

  const commands = [];

  // Собираем уникальные значения для enum
  const uniqueValues = extractUniqueValues(cars);
  const ranges = calculateRanges(cars);

  // 1. Навигация (простые команды без параметров)
  commands.push(...generateNavigationCommands(currentRoute));

  // 2. Параметризованные команды для фильтрации и просмотра
  if (currentRoute === '/cars' || currentRoute === '/') {
    // Одиночный фильтр
    commands.push(generateSingleFilterCommand(uniqueValues, ranges));

    // Пакетные фильтры
    commands.push(generateBatchFiltersCommand(uniqueValues, ranges));

    // Просмотр авто
    commands.push(generateViewCarsCommand(cars));

    // Очистка фильтров
    commands.push(generateClearFiltersCommand());

    // Сортировка
    commands.push(generateSetSortCommand());

    // Простые действия
    commands.push(...generateSimpleActions());
  }

  console.log(`[CommandGenerator] Generated ${commands.length} parameterized commands`);

  return commands;
}

/**
 * Извлечение уникальных значений из инвентаря для enum
 */
function extractUniqueValues(cars) {
  return {
    makes: [...new Set(cars.map(c => c.make).filter(Boolean))].sort(),
    models: [...new Set(cars.map(c => c.model).filter(Boolean))].sort(),
    bodyTypes: [...new Set(cars.map(c => c.bodyType).filter(Boolean))].sort(),
    transmissions: [...new Set(cars.map(c => c.transmission).filter(Boolean))].sort(),
    fuelTypes: [...new Set(cars.map(c => c.fuelType).filter(Boolean))].sort(),
    colors: [...new Set(cars.map(c => c.color).filter(Boolean))].sort(),
    carIds: cars.map(c => c.id),
  };
}

/**
 * Расчёт min/max диапазонов для численных параметров
 */
function calculateRanges(cars) {
  const years = cars.map(c => c.year);
  const prices = cars.map(c => c.price);
  const mileages = cars.map(c => c.mileage);

  return {
    year: { min: Math.min(...years), max: Math.max(...years) },
    price: { min: Math.min(...prices), max: Math.max(...prices) },
    mileage: { min: Math.min(...mileages), max: Math.max(...mileages) },
  };
}

/**
 * Навигационные команды (без параметров)
 */
function generateNavigationCommands(currentRoute) {
  const commands = [];

  if (currentRoute !== '/') {
    commands.push({ id: 'go_home' });
  }

  if (currentRoute !== '/cars') {
    commands.push({ id: 'go_cars' });
  }

  if (currentRoute !== '/about') {
    commands.push({ id: 'go_about' });
  }

  if (currentRoute !== '/contact') {
    commands.push({ id: 'go_contact' });
  }

  if (currentRoute.startsWith('/car/')) {
    commands.push({ id: 'go_back_cars' });
  }

  // Команда для бронирования тест-драйва (доступна всегда)
  if (currentRoute !== '/book-test-drive') {
    commands.push({
      id: 'go_book_test_drive',
      params: {
        carInfo: {
          type: 'string',
          optional: true,
          description: 'Car information string in format "year make model" (e.g., "2020 BMW X5")'
        }
      }
    });
  }

  // Команда для уведомления об успешном бронировании (доступна всегда)
  commands.push({
    id: 'notify_success_booking',
    params: {
      date: {
        type: 'string',
        description: 'Booking date in ISO format (e.g., "2025-11-15")'
      },
      time: {
        type: 'string',
        description: 'Booking time (e.g., "14:30")'
      },
      name: {
        type: 'string',
        description: 'Customer name'
      },
      phone: {
        type: 'string',
        description: 'Customer phone number'
      },
      bookingId: {
        type: 'string',
        description: 'Unique booking ID'
      },
      carInfo: {
        type: 'string',
        optional: true,
        description: 'Optional car information (e.g., "2020 BMW X5")'
      }
    }
  });

  return commands;
}

/**
 * Команда для установки одного фильтра
 */
function generateSingleFilterCommand(uniqueValues, ranges) {
  return {
    id: 'set_filter',
    params: {
      filterType: {
        type: 'string',
        enum: ['make', 'model', 'price', 'mileage', 'bodyType', 'transmission', 'fuelType', 'color', 'year']
      },
      values: {
        type: 'array',
        optional: true,
        enum: [
          ...uniqueValues.makes,
          ...uniqueValues.models,
          ...uniqueValues.bodyTypes,
          ...uniqueValues.transmissions,
          ...uniqueValues.fuelTypes,
          ...uniqueValues.colors,
        ]
      },
      min: {
        type: 'number',
        optional: true,
        min: 0
      },
      max: {
        type: 'number',
        optional: true,
        max: ranges.price.max
      }
    }
  };
}

/**
 * Команда для установки множественных фильтров
 */
function generateBatchFiltersCommand(uniqueValues, ranges) {
  return {
    id: 'set_filters',
    params: {
      filters: {
        type: 'object',
        properties: {
          make: {
            type: 'array',
            optional: true,
            enum: uniqueValues.makes
          },
          model: {
            type: 'array',
            optional: true,
            enum: uniqueValues.models
          },
          bodyType: {
            type: 'array',
            optional: true,
            enum: uniqueValues.bodyTypes
          },
          transmission: {
            type: 'array',
            optional: true,
            enum: uniqueValues.transmissions
          },
          fuelType: {
            type: 'array',
            optional: true,
            enum: uniqueValues.fuelTypes
          },
          color: {
            type: 'array',
            optional: true,
            enum: uniqueValues.colors
          },
          price: {
            type: 'object',
            optional: true,
            properties: {
              min: { type: 'number', min: ranges.price.min, max: ranges.price.max },
              max: { type: 'number', min: ranges.price.min, max: ranges.price.max }
            }
          },
          mileage: {
            type: 'object',
            optional: true,
            properties: {
              min: { type: 'number', min: ranges.mileage.min, max: ranges.mileage.max },
              max: { type: 'number', min: ranges.mileage.min, max: ranges.mileage.max }
            }
          },
          year: {
            type: 'object',
            optional: true,
            properties: {
              min: { type: 'number', min: ranges.year.min, max: ranges.year.max },
              max: { type: 'number', min: ranges.year.min, max: ranges.year.max }
            }
          }
        }
      }
    }
  };
}

/**
 * Команда для просмотра автомобилей
 */
function generateViewCarsCommand(cars) {
  return {
    id: 'view_cars',
    params: {
      offerId: {
        type: 'string',
        description: 'Offer ID to view (e.g., "534162-1"). Must be from visibleOfferIds array received in filter results.',
        enum: cars.map(c => c.id)
      }
    }
  };
}

/**
 * Команда для очистки фильтров
 */
function generateClearFiltersCommand() {
  return {
    id: 'clear_filters',
    params: {
      filterTypes: {
        type: 'array',
        optional: true,
        enum: ['make', 'model', 'price', 'mileage', 'bodyType', 'transmission', 'fuelType', 'color', 'year', 'all']
      }
    }
  };
}

/**
 * Команда для изменения сортировки
 */
function generateSetSortCommand() {
  return {
    id: 'set_sort',
    params: {
      sortBy: {
        type: 'string',
        enum: ['price-asc', 'price-desc', 'year-desc', 'year-asc', 'mileage-asc', 'mileage-desc']
      }
    }
  };
}

/**
 * Простые действия без параметров
 */
function generateSimpleActions() {
  return [
    { id: 'scroll_top' },
    { id: 'scroll_bottom' },
  ];
}

export default generateCommands;
