/**
 * Конфигурация приложения для Browser Control
 * Определяет маршруты и метаданные приложения
 *
 * ВАЖНО: Бизнес-действия (команды) генерируются динамически
 * на основе реального инвентаря в commandGenerator.js
 */

/**
 * Генерация CSV списка доступных автомобилей
 * Формат: id,description,mileage,price
 */
export function generateAvailableCarsList(cars) {
  if (!cars || cars.length === 0) {
    return 'id,description,mileage,price\n';
  }

  const header = 'id,description,mileage,price';
  const rows = cars.map(car => {
    const id = car.id || '';
    const description = `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim();
    const mileage = car.mileage || 0;
    const price = car.price || 0;
    return `${id},"${description}",${mileage},${price}`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Маршруты приложения
 */
export const routes = [
  {
    path: '/',
    name: 'Home',
    description: 'Main homepage with featured cars and hot offers'
  },
  {
    path: '/cars',
    name: 'Cars Inventory',
    description: 'Browse all available cars with search and filters'
  },
  {
    path: '/car/:id',
    name: 'Car Details',
    description: 'Detailed information about a specific car',
    params: ['id']
  },
  {
    path: '/about',
    name: 'About Us',
    description: 'Information about the dealership'
  },
  {
    path: '/contact',
    name: 'Contact',
    description: 'Contact form and dealership information'
  }
];

/**
 * Метаданные приложения
 */
export const metadata = {
  appName: 'Cool Cars Amsterdam',
  domain: 'demo.shiftgears.ai',
  description: 'Car dealership website for browsing and booking test drives',
  inventoryId: import.meta.env.VITE_INVENTORY_ID || 'autopolis_shiftgears_demo',
  features: [
    'Car search and filtering',
    'Detailed car information',
    'Test drive booking',
    'WhatsApp and phone contact',
    'Voice assistant integration'
  ],
  contact: {
    phone: '+447418613962',
    whatsapp: '+447418613962',
    email: 'info@shiftgears.ai'
  }
};

/**
 * Генерирует полную конфигурацию приложения с данными об автомобилях
 * @param {Array} cars - Массив автомобилей из API
 * @returns {Object} Полная конфигурация приложения
 */
export function generateAppConfig(cars = []) {
  return {
    routes,
    metadata: {
      ...metadata,
      availableCarsList: generateAvailableCarsList(cars),
      totalCars: cars.length
    }
  };
}

/**
 * Базовая конфигурация приложения для Browser Control
 */
export const appConfig = {
  routes,
  metadata
};

export default appConfig;
