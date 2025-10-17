import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCarInventory } from '../services/api';

// Создаем контекст для управления данными автомобилей
const CarsContext = createContext(null);

/**
 * Provider для управления состоянием списка автомобилей
 */
export const CarsProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCarInventory();
        setCars(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load cars:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  // Вспомогательные функции для работы с данными
  const getHotOffers = () => cars.filter(car => car.isHotOffer);
  const getCarById = (id) => cars.find(car => car.id === parseInt(id));
  const getAllCars = () => cars;

  const value = {
    cars,
    loading,
    error,
    getHotOffers,
    getCarById,
    getAllCars,
  };

  return <CarsContext.Provider value={value}>{children}</CarsContext.Provider>;
};

/**
 * Hook для использования контекста автомобилей
 */
export const useCars = () => {
  const context = useContext(CarsContext);
  if (!context) {
    throw new Error('useCars must be used within CarsProvider');
  }
  return context;
};
