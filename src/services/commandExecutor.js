/**
 * Централизованная логика выполнения параметризованных команд
 *
 * Обрабатывает команды с parameters:
 * - set_filter - установить один фильтр
 * - set_filters - установить множественные фильтры
 * - view_cars - просмотр одного или нескольких авто
 * - clear_filters - очистка фильтров
 * - Навигационные команды (go_home, go_cars, go_about, go_contact, go_back_cars)
 * - Простые действия (scroll_top, scroll_bottom)
 */

export class CommandExecutor {
  constructor() {
    this.filterSelectors = {
      make: '#car-make-filter',
      model: '#car-model-filter',
      price: '#car-price-filter',
      bodyType: '#car-body-type-filter',
      transmission: '#car-transmission-filter',
      fuelType: '#car-fuel-type-filter',
      color: '#car-color-filter',
      year: '#car-year-filter',
      mileage: '#car-mileage-filter'
    };
  }

  /**
   * Выполнение команды
   * @param {string} commandId - ID команды
   * @param {Object} params - Параметры команды
   * @returns {Object} Результат выполнения { success, error?, action? }
   */
  execute(commandId, params = {}) {
    console.log(`[CommandExecutor] Executing: ${commandId}`, params);

    try {
      switch (commandId) {
        // ===== НАВИГАЦИЯ =====
        case 'go_home':
          return this.navigateTo('/');

        case 'go_cars':
          return this.navigateTo('/cars');

        case 'go_about':
          return this.navigateTo('/about');

        case 'go_contact':
          return this.navigateTo('/contact');

        case 'go_back_cars':
          return this.navigateTo('/cars');

        case 'go_book_test_drive':
          return this.navigateToBookTestDrive(params);

        // ===== ОДИНОЧНЫЙ ФИЛЬТР =====
        case 'set_filter':
          return this.setSingleFilter(params);

        // ===== ПАКЕТНЫЕ ФИЛЬТРЫ =====
        case 'set_filters':
          return this.setMultipleFilters(params);

        // ===== ПРОСМОТР АВТО =====
        case 'view_cars':
          return this.viewCars(params);

        // ===== ОЧИСТКА ФИЛЬТРОВ =====
        case 'clear_filters':
          return this.clearFilters(params);

        // ===== СОРТИРОВКА =====
        case 'set_sort':
          return this.setSort(params);

        // ===== ПРОСТЫЕ ДЕЙСТВИЯ =====
        case 'scroll_top':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return { success: true, action: 'scrolled to top' };

        case 'scroll_bottom':
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          return { success: true, action: 'scrolled to bottom' };

        default:
          console.warn(`[CommandExecutor] Unknown command: ${commandId}`);
          return { success: false, error: `Unknown command: ${commandId}` };
      }
    } catch (error) {
      console.error(`[CommandExecutor] Error executing ${commandId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Навигация по route
   */
  navigateTo(route) {
    window.location.hash = `#${route}`;
    return { success: true, action: `navigated to ${route}` };
  }

  /**
   * Навигация на страницу бронирования тест-драйва
   * Параметры: { carInfo?: string } - опциональная информация о машине в формате "year make model"
   */
  navigateToBookTestDrive({ carInfo } = {}) {
    let url = '/book-test-drive';

    if (carInfo) {
      // Добавляем query параметр car с информацией о машине
      url += `?car=${encodeURIComponent(carInfo)}`;
      console.log(`[CommandExecutor] Navigating to test drive booking for: ${carInfo}`);
    } else {
      console.log(`[CommandExecutor] Navigating to test drive booking (no car specified)`);
    }

    window.location.hash = `#${url}`;
    return {
      success: true,
      action: carInfo
        ? `navigated to test drive booking for ${carInfo}`
        : 'navigated to test drive booking page'
    };
  }

  /**
   * Установка одного фильтра
   * Параметры: { filterType, values?, min?, max? }
   */
  setSingleFilter({ filterType, values, min, max }) {
    if (!filterType) {
      return { success: false, error: 'filterType is required' };
    }

    // Range фильтры которые работают напрямую через URL (без DOM элементов)
    const urlRangeFilters = ['price', 'mileage', 'year'];

    // Для численных фильтров (range) - обрабатываем сразу если это price/mileage/year
    if ((min !== undefined || max !== undefined) && urlRangeFilters.includes(filterType)) {
      // Range фильтры работают напрямую с URL, не требуют DOM элемента
      console.log(`[CommandExecutor] Applying URL range filter for ${filterType}:`, { min, max });
      this.applyRangeFilter(null, filterType, { min, max });
      return { success: true, action: `applied ${filterType} range filter (min: ${min}, max: ${max})` };
    }

    // Для остальных фильтров проверяем наличие DOM элемента
    const selector = this.filterSelectors[filterType];
    if (!selector) {
      return { success: false, error: `Unknown filter type: ${filterType}` };
    }

    const element = document.querySelector(selector);
    if (!element) {
      return { success: false, error: `Filter element not found: ${selector} (not on /cars page?)` };
    }

    // Для категориальных фильтров (select/multi-select)
    if (values) {
      this.applyValuesFilter(element, values, filterType);
      return { success: true, action: `applied ${filterType} filter with values: ${values.join(', ')}` };
    }

    // Для других численных фильтров (не price/mileage) с DOM элементами
    if (min !== undefined || max !== undefined) {
      this.applyRangeFilter(element, filterType, { min, max });
      return { success: true, action: `applied ${filterType} range filter (min: ${min}, max: ${max})` };
    }

    return { success: false, error: 'Either values or min/max must be provided' };
  }

  /**
   * Установка множественных фильтров
   * Параметры: { filters: { make: [...], price: { min, max }, ... } }
   */
  async setMultipleFilters({ filters }) {
    console.log('[CommandExecutor] setMultipleFilters called with:', filters);

    if (!filters || typeof filters !== 'object') {
      return { success: false, error: 'filters object is required' };
    }

    const appliedFilters = [];
    const errors = [];

    // Range фильтры которые работают напрямую через URL (без DOM элементов)
    const urlRangeFilters = ['price', 'mileage', 'year'];

    Object.entries(filters).forEach(([filterType, value]) => {
      console.log(`[CommandExecutor] Processing filter: ${filterType}`, value);
      console.log(`[CommandExecutor] Value type: ${typeof value}, isArray: ${Array.isArray(value)}`);

      try {
        if (Array.isArray(value)) {
          // Категориальный фильтр - требует DOM элемент
          const selector = this.filterSelectors[filterType];
          if (!selector) {
            console.warn(`[CommandExecutor] Unknown filter type: ${filterType}`);
            errors.push(`Unknown filter type: ${filterType}`);
            return;
          }

          const element = document.querySelector(selector);
          if (!element) {
            console.warn(`[CommandExecutor] Element not found for selector: ${selector}`);
            errors.push(`Filter element not found: ${selector}`);
            return;
          }

          console.log(`[CommandExecutor] Found element for ${filterType}:`, element);
          console.log(`[CommandExecutor] Applying values filter for ${filterType}:`, value);
          this.applyValuesFilter(element, value, filterType);
          appliedFilters.push(`${filterType}: ${value.join(', ')}`);
        } else if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
          // Численный range фильтр
          if (urlRangeFilters.includes(filterType)) {
            // Range фильтры работают напрямую с URL, не требуют DOM элемента
            console.log(`[CommandExecutor] Applying URL range filter for ${filterType}:`, value);
            this.applyRangeFilter(null, filterType, value);
            appliedFilters.push(`${filterType}: ${value.min || 'any'} - ${value.max || 'any'}`);
          } else {
            // Другие range фильтры используют DOM элементы
            const selector = this.filterSelectors[filterType];
            if (!selector) {
              console.warn(`[CommandExecutor] Unknown filter type: ${filterType}`);
              errors.push(`Unknown filter type: ${filterType}`);
              return;
            }

            const element = document.querySelector(selector);
            if (!element) {
              console.warn(`[CommandExecutor] Element not found for selector: ${selector}`);
              errors.push(`Filter element not found: ${selector}`);
              return;
            }

            console.log(`[CommandExecutor] Found element for ${filterType}:`, element);
            console.log(`[CommandExecutor] Applying range filter for ${filterType}:`, value);
            this.applyRangeFilter(element, filterType, value);
            appliedFilters.push(`${filterType}: ${value.min || 'any'} - ${value.max || 'any'}`);
          }
        } else {
          console.warn(`[CommandExecutor] Unknown value type for ${filterType}:`, value);
        }
      } catch (error) {
        console.error(`[CommandExecutor] Error applying ${filterType}:`, error);
        errors.push(`Error applying ${filterType}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      // Даже при ошибках читаем результаты, если хотя бы часть фильтров применилась
      const results = appliedFilters.length > 0 ? await this.waitAndGetFilteredResults() : null;

      return {
        success: appliedFilters.length > 0,
        action: `partially applied filters: ${appliedFilters.join('; ')}`,
        error: errors.join('; '),
        results
      };
    }

    // Ждем обновления React и читаем результаты
    const results = await this.waitAndGetFilteredResults();

    return {
      success: true,
      action: `applied filters: ${appliedFilters.join('; ')}`,
      results
    };
  }

  /**
   * Применение фильтра с массивом значений (для select)
   * Теперь поддерживает множественные значения через URL параметры
   */
  applyValuesFilter(element, values, filterType) {
    console.log(`[CommandExecutor] applyValuesFilter: filterType=${filterType}, values=`, values);

    // Для категориальных фильтров (make, bodyType, fuelType, transmission)
    // устанавливаем множественные значения через URL параметры
    const categoricalFilters = ['make', 'bodyType', 'fuelType', 'transmission'];

    if (categoricalFilters.includes(filterType) && values.length > 0) {
      // Получаем текущие параметры из URL
      const hash = window.location.hash;
      const [path, queryString] = hash.split('?');
      const params = new URLSearchParams(queryString || '');

      // Устанавливаем значения через запятую (например: "BMW,Audi")
      params.set(filterType, values.join(','));

      // Обновляем URL
      const newHash = params.toString() ? `${path}?${params.toString()}` : path;
      console.log(`[CommandExecutor] Setting ${filterType} to URL: ${values.join(',')}`);
      window.location.hash = newHash;
      return;
    }

    // Для обычных select элементов (не категориальные фильтры)
    if (element.tagName.toLowerCase() === 'select') {
      // Берём первое значение
      if (values.length > 0) {
        element.value = values[0];
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (element.type === 'checkbox' || element.type === 'radio') {
      // Для checkbox/radio группы
      values.forEach(value => {
        const checkbox = document.querySelector(`input[value="${value}"]`);
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  }

  /**
   * Применение range фильтра (min/max)
   * Работает напрямую с URL параметрами, т.к. RangeSlider - кастомный компонент без input элементов
   * @param {HTMLElement|null} _element - Не используется для price/mileage (работа через URL)
   * @param {string} filterType - Тип фильтра (price, mileage)
   * @param {Object} params - Параметры min/max
   */
  applyRangeFilter(_element, filterType, { min, max }) {
    console.log(`[CommandExecutor] applyRangeFilter: filterType=${filterType}, min=${min}, max=${max}`);

    // Получаем текущие параметры из URL
    const hash = window.location.hash;
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    console.log(`[CommandExecutor] Current URL: ${hash}`);
    console.log(`[CommandExecutor] Current params:`, Array.from(params.entries()));

    // Маппинг типов фильтров на параметры URL
    const paramMapping = {
      price: { min: 'minPrice', max: 'maxPrice' },
      mileage: { min: 'minMileage', max: 'maxMileage' },
      year: { min: 'minYear', max: 'maxYear' }
    };

    const mapping = paramMapping[filterType];
    if (!mapping) {
      console.warn(`[CommandExecutor] No URL parameter mapping for filter type: ${filterType}`);
      return;
    }

    // Устанавливаем параметры min/max
    if (min !== undefined && mapping.min) {
      params.set(mapping.min, min);
      console.log(`[CommandExecutor] Set ${mapping.min} = ${min}`);
    }
    if (max !== undefined && mapping.max) {
      params.set(mapping.max, max);
      console.log(`[CommandExecutor] Set ${mapping.max} = ${max}`);
    }

    // Обновляем URL
    const newHash = params.toString() ? `${path}?${params.toString()}` : path;
    console.log(`[CommandExecutor] New URL hash: ${newHash}`);
    window.location.hash = newHash;
  }

  /**
   * Просмотр автомобилей
   * Параметры: { carIds: [1, 2, 3, ...] }
   */
  viewCars({ carIds }) {
    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return { success: false, error: 'carIds array is required and must not be empty' };
    }

    if (carIds.length === 1) {
      // Просмотр одного авто
      window.location.hash = `#/car/${carIds[0]}`;
      return { success: true, action: `viewing car ${carIds[0]}` };
    } else {
      // Несколько авто - можно показать compare или просто перейти на страницу с фильтром
      // Здесь можно реализовать показ нескольких авто, например через compare
      // Пока просто переходим на первое авто
      window.location.hash = `#/car/${carIds[0]}`;
      return {
        success: true,
        action: `viewing first car ${carIds[0]} (multi-view not implemented yet)`,
        warning: `Requested ${carIds.length} cars, showing first one`
      };
    }
  }

  /**
   * Очистка фильтров
   * Параметры: { filterTypes?: ['make', 'model', 'price', 'all'] }
   */
  clearFilters({ filterTypes } = {}) {
    // Если filterTypes не указаны или содержат 'all', очищаем все
    if (!filterTypes || filterTypes.includes('all')) {
      const clearBtn = document.querySelector('#car-clear-filters-btn');
      if (clearBtn) {
        clearBtn.click();
        return { success: true, action: 'cleared all filters' };
      } else {
        // Если нет кнопки, очищаем все фильтры вручную
        this.clearAllFiltersManually();
        return { success: true, action: 'cleared all filters manually' };
      }
    }

    // Очищаем конкретные фильтры
    const clearedFilters = [];
    filterTypes.forEach(filterType => {
      const selector = this.filterSelectors[filterType];
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.value = '';
          element.dispatchEvent(new Event('change', { bubbles: true }));
          clearedFilters.push(filterType);
        }
      }
    });

    return {
      success: true,
      action: `cleared filters: ${clearedFilters.join(', ')}`
    };
  }

  /**
   * Очистка всех фильтров вручную
   */
  clearAllFiltersManually() {
    Object.values(this.filterSelectors).forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.value = '';
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  /**
   * Установка сортировки
   * Параметры: { sortBy: 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'mileage-asc' | 'mileage-desc' }
   */
  setSort({ sortBy }) {
    if (!sortBy) {
      return { success: false, error: 'sortBy is required' };
    }

    // Получаем текущие параметры из URL
    const hash = window.location.hash;
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    // Устанавливаем параметр sortBy
    params.set('sortBy', sortBy);

    // Обновляем URL
    const newHash = params.toString() ? `${path}?${params.toString()}` : path;
    console.log(`[CommandExecutor] Setting sortBy to: ${sortBy}`);
    window.location.hash = newHash;

    return { success: true, action: `set sort to ${sortBy}` };
  }

  /**
   * Ждем обновления React и читаем отфильтрованные результаты
   * @returns {Promise<Object>} Результаты фильтрации
   */
  async waitAndGetFilteredResults() {
    // Ждем чтобы React обновил состояние и экспортировал результаты
    await new Promise(resolve => setTimeout(resolve, 300));

    const filteredData = window.currentFilteredCars;

    if (!filteredData || !Array.isArray(filteredData.cars)) {
      console.warn('[CommandExecutor] No filtered cars found in window.currentFilteredCars');
      return null;
    }

    const { cars, total, allCarsTotal } = filteredData;

    // Форматируем первые 10 машин для агента
    const showing = Math.min(10, cars.length);
    const formattedCars = cars.slice(0, showing).map(this.formatCarForAgent);

    // Вычисляем диапазоны
    const prices = cars.filter(c => c.price > 0).map(c => c.price);
    const mileages = cars.filter(c => c.mileage >= 0).map(c => c.mileage);

    const priceRange = prices.length > 0
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : null;

    const mileageRange = mileages.length > 0
      ? { min: Math.min(...mileages), max: Math.max(...mileages) }
      : null;

    return {
      total,
      allCarsTotal,
      showing,
      cars: formattedCars,
      priceRange,
      mileageRange
    };
  }

  /**
   * Форматирование машины для агента
   * @param {Object} car - Объект машины
   * @returns {Object} Форматированная информация для агента
   */
  formatCarForAgent(car) {
    return {
      id: car.id,
      title: `${car.year} ${car.make} ${car.model}`,
      price: car.price,
      mileage: car.mileage,
      year: car.year,
      make: car.make,
      model: car.model,
      bodyType: car.bodyType || 'N/A',
      fuelType: car.fuelType || 'N/A',
      transmission: car.transmission || 'N/A'
    };
  }
}

// Singleton экземпляр
export const commandExecutor = new CommandExecutor();

export default commandExecutor;
