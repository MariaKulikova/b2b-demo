import { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCars } from '../context/CarsContext';
import { generateCommands } from '../services/commandGenerator';
import { browserControlWS } from '../services/browserControlWebSocket';

/**
 * React hook для генерации и обновления высокоуровневых команд
 *
 * Автоматически генерирует список доступных команд на основе:
 * - Текущего маршрута (location.pathname)
 * - Списка автомобилей из API (useCars)
 * - Активных фильтров (опционально)
 *
 * При изменении любого из этих параметров:
 * 1. Генерируется новый список команд
 * 2. Список отправляется в WebSocket сервер через browserControlWS
 *
 * @returns {Array} Массив команд с полями {id, description}
 */
export function useCommands() {
  const { getAllCars, loading } = useCars();
  const location = useLocation();

  // Генерируем команды при изменении маршрута или списка автомобилей
  const commands = useMemo(() => {
    // Не генерируем команды пока загружаются данные
    if (loading) {
      return [];
    }

    const cars = getAllCars();

    // Для HashRouter используем pathname из location (React Router автоматически парсит hash)
    // Например: hash = "#/cars" -> location.pathname = "/cars"
    const currentRoute = location.pathname;

    console.log('[useCommands] Generating commands for route:', currentRoute, 'with', cars.length, 'cars');

    const generatedCommands = generateCommands(cars, currentRoute);

    console.log('[useCommands] Generated', generatedCommands.length, 'commands');

    return generatedCommands;
  }, [getAllCars, loading, location.pathname]);

  // Обновляем команды в WebSocket при их изменении
  useEffect(() => {
    if (commands.length > 0) {
      console.log('[useCommands] Updating commands in browserControlWS');
      browserControlWS.updateCommands(commands);
    }
  }, [commands]);

  return commands;
}

export default useCommands;
