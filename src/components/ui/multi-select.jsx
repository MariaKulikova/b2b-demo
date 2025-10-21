import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * Multi-select dropdown component with checkboxes
 * @param {Object} props
 * @param {string} props.id - Element ID
 * @param {string} props.placeholder - Placeholder text when nothing selected
 * @param {Array<string>} props.options - Available options
 * @param {Array<string>} props.value - Selected values
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.className - Additional CSS classes
 */
export const MultiSelect = ({
  id,
  placeholder = 'Select...',
  options = [],
  value = [],
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закрываем dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) return value[0];
    if (value.length <= 3) return value.join(', ');
    return `${value.length} selected`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-left focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors flex items-center justify-between"
      >
        <span className={`truncate ${value.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <button
              onClick={clearAll}
              className="hover:bg-gray-200 rounded p-0.5"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown with checkboxes */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            <div className="py-1">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="mr-3 h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
