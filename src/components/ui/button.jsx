import React from 'react';

const Button = ({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'default',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-brand-dark text-white hover:bg-red-900',
    secondary: 'bg-white text-brand-dark hover:bg-gray-50 hover:text-brand-dark',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50'
  };
  
  const sizes = {
    default: 'h-10 py-2 px-4',
    lg: 'h-12 px-8 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export { Button };