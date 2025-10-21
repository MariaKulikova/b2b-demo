import React from 'react';

// Native HTML select component with consistent styling
const Select = ({ className = '', children, ...props }) => {
  const backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

  return (
    <select
      className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 pr-10 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors appearance-none bg-no-repeat ${className}`}
      style={{
        backgroundImage,
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em'
      }}
      {...props}
    >
      {children}
    </select>
  );
};

export { Select };