import { useState, useRef, useEffect } from 'react';

/**
 * RangeSlider компонент с двумя ползунками для выбора диапазона значений
 */
export const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  minValue,
  maxValue,
  onChange,
  formatValue = (value) => value.toLocaleString(),
  label = 'Range'
}) => {
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  const handleMouseDown = (thumb) => {
    setIsDragging(thumb);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sliderRef.current) return;

      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = Math.round((min + percentage * (max - min)) / step) * step;

      if (isDragging === 'min') {
        if (value <= maxValue) {
          onChange(value, maxValue);
        }
      } else if (isDragging === 'max') {
        if (value >= minValue) {
          onChange(minValue, value);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, minValue, maxValue, onChange]);

  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span className="text-blue-600">
          {formatValue(minValue)} - {formatValue(maxValue)}
        </span>
      </div>

      <div className="relative h-2" ref={sliderRef}>
        {/* Track background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-lg" />

        {/* Active range */}
        <div
          className="absolute h-2 bg-blue-600 rounded-lg"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />

        {/* Min thumb */}
        <div
          className="absolute w-4 h-4 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 -translate-y-1/4 -translate-x-1/2 transition-colors"
          style={{ left: `${minPercent}%` }}
          onMouseDown={() => handleMouseDown('min')}
        />

        {/* Max thumb */}
        <div
          className="absolute w-4 h-4 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 -translate-y-1/4 -translate-x-1/2 transition-colors"
          style={{ left: `${maxPercent}%` }}
          onMouseDown={() => handleMouseDown('max')}
        />
      </div>
    </div>
  );
};
