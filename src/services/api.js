// API service для получения данных об автомобилях

const API_BASE_URL = import.meta.env.VITE_CAR_API_URL || 'https://car-frontend-api.test.meteora.pro';
const INVENTORY_ID = import.meta.env.VITE_INVENTORY_ID || 'autopolis_shiftgears_demo';

// Экспортируем INVENTORY_ID для использования в других модулях (например, browser control)
export { INVENTORY_ID };

/**
 * Получить список всех автомобилей из API
 * @returns {Promise<Array>} Массив автомобилей
 */
export const fetchCarInventory = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dealer-inventory/${INVENTORY_ID}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Преобразуем данные API в формат приложения с обработкой отсутствующих данных
    return result.data.map(car => ({
      ...car,
      // Если изображений нет, передаем пустой массив (компонент покажет placeholder)
      images: Array.isArray(car.images) && car.images.length > 0 ? car.images : [],
      // Цена может быть 0 (обработается в компонентах как "Contact for price")
      price: typeof car.price === 'number' ? car.price : 0,
      // Пробег может быть 0 (обработается в компонентах)
      mileage: typeof car.mileage === 'number' ? car.mileage : 0,
      // Убеждаемся что features это массив
      features: Array.isArray(car.features) && car.features.length > 0 ? car.features : [],
      // Убеждаемся что description это строка, если нет - создаем из данных
      description: car.description && car.description.trim() !== ''
        ? car.description
        : `${car.year} ${car.make} ${car.model}`,
      // Убеждаемся что все обязательные поля существуют
      make: car.make || 'Unknown',
      model: car.model || 'Model',
      year: car.year || new Date().getFullYear(),
      fuelType: car.fuelType || 'N/A',
      transmission: car.transmission || 'N/A',
      color: car.color || 'N/A'
    }));
  } catch (error) {
    console.error('Error fetching car inventory:', error);
    throw error;
  }
};
