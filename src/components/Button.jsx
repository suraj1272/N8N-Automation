import React from 'react';

const Button = ({ children, variant = "primary", size = "md", disabled, onClick, className = "" }) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white",
    ghost: "hover:bg-gray-100 text-gray-700"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
