import React from 'react';

const Checkbox = ({ className = '', checked, onCheckedChange, ...props }) => (
  <input
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
    checked={checked}
    onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
    {...props}
  />
);

export { Checkbox };