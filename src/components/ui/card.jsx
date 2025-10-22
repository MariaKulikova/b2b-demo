import React from 'react';

const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-2xl bg-white text-gray-950 shadow-md ${className}`}
    {...props}
  />
);

const CardHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardContent = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
);

export { Card, CardHeader, CardContent, CardTitle };