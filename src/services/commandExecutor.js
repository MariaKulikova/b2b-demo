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
   * Установка одного фильтра
   * Параметры: { filterType, values?, min?, max? }
   */
  setSingleFilter({ filterType, values, min, max }) {
    if (!filterType) {
      return { success: false, error: 'filterType is required' };
    }

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
      this.applyValuesFilter(element, values);
      return { success: true, action: `applied ${filterType} filter with values: ${values.join(', ')}` };
    }

    // Для численных фильтров (range)
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
  setMultipleFilters({ filters }) {
    if (!filters || typeof filters !== 'object') {
      return { success: false, error: 'filters object is required' };
    }

    const appliedFilters = [];
    const errors = [];

    Object.entries(filters).forEach(([filterType, value]) => {
      const selector = this.filterSelectors[filterType];
      if (!selector) {
        errors.push(`Unknown filter type: ${filterType}`);
        return;
      }

      const element = document.querySelector(selector);
      if (!element) {
        errors.push(`Filter element not found: ${selector}`);
        return;
      }

      try {
        if (Array.isArray(value)) {
          // Категориальный фильтр
          this.applyValuesFilter(element, value);
          appliedFilters.push(`${filterType}: ${value.join(', ')}`);
        } else if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
          // Численный range фильтр
          this.applyRangeFilter(element, filterType, value);
          appliedFilters.push(`${filterType}: ${value.min || 'any'} - ${value.max || 'any'}`);
        }
      } catch (error) {
        errors.push(`Error applying ${filterType}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      return {
        success: appliedFilters.length > 0,
        action: `partially applied filters: ${appliedFilters.join('; ')}`,
        error: errors.join('; ')
      };
    }

    return {
      success: true,
      action: `applied filters: ${appliedFilters.join('; ')}`
    };
  }

  /**
   * Применение фильтра с массивом значений (для select)
   */
  applyValuesFilter(element, values) {
    if (element.tagName.toLowerCase() === 'select') {
      // Для одиночного select - берём первое значение
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
   */
  applyRangeFilter(element, filterType, { min, max }) {
    // Для численных диапазонов может быть два input поля или один range slider
    const minInput = document.querySelector(`#${filterType}-min`);
    const maxInput = document.querySelector(`#${filterType}-max`);

    if (minInput && min !== undefined) {
      minInput.value = min;
      minInput.dispatchEvent(new Event('input', { bubbles: true }));
      minInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (maxInput && max !== undefined) {
      maxInput.value = max;
      maxInput.dispatchEvent(new Event('input', { bubbles: true }));
      maxInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
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
}

// Singleton экземпляр
export const commandExecutor = new CommandExecutor();

export default commandExecutor;
