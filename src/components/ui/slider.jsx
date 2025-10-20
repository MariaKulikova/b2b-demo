import { forwardRef } from 'react';

/**
 * Slider компонент для выбора числовых значений
 */
const Slider = forwardRef(({
  className = '',
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-blue-600
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:hover:bg-blue-700
        [&::-moz-range-thumb]:w-4
        [&::-moz-range-thumb]:h-4
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-blue-600
        [&::-moz-range-thumb]:cursor-pointer
        [&::-moz-range-thumb]:border-0
        [&::-moz-range-thumb]:hover:bg-blue-700
        ${className}`}
      {...props}
    />
  );
});

Slider.displayName = 'Slider';

export { Slider };
