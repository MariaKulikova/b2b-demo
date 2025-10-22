import React from 'react';

const Button = ({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'default',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-brand-dark text-white hover:bg-brand-dark',
    secondary: 'bg-brand-orange text-white hover:bg-brand-orange/90',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50'
  };
  
  const sizes = {
    sm: 'py-1.5 px-3 text-sm rounded-md',
    default: 'py-2.5 px-5 rounded-lg',
    lg: 'py-3.5 px-10 text-lg rounded-xl'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export { Button };