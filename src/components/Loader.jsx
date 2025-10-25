import React from 'react';

const Loader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-75"></div>
    </div>
    <p className="mt-6 text-gray-600 font-medium animate-pulse">{message}</p>
  </div>
);

export default Loader;
