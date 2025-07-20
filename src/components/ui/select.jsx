import React from 'react';

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

const SelectTrigger = ({ className = '', children, ...props }) => (
  <div
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const SelectValue = ({ placeholder, ...props }) => (
  <span className="text-gray-400" {...props}>{placeholder}</span>
);

const SelectContent = ({ children, ...props }) => (
  <div
    className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md"
    {...props}
  >
    {children}
  </div>
);

const SelectItem = ({ children, value, ...props }) => (
  <div
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
    {...props}
  >
    {children}
  </div>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };