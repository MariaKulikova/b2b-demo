import React from 'react';
import { Car } from 'lucide-react';

/**
 * Компонент-заглушка для изображений автомобилей
 */
const CarImagePlaceholder = ({ make, model, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
      <Car className="h-16 w-16 text-gray-400 mb-2" />
      {(make || model) && (
        <div className="text-center px-4">
          <p className="text-sm font-medium text-gray-600">
            {make} {model}
          </p>
          <p className="text-xs text-gray-500 mt-1">Image not available</p>
        </div>
      )}
    </div>
  );
};

export default CarImagePlaceholder;
