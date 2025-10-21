import React from 'react';

const Input = ({ className = '', ...props }) => {
  const classes = `flex h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 transition-colors ${className}`;

  return <input className={classes} {...props} />;
};

export { Input };