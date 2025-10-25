import React from 'react';

const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <div className={`absolute opacity-10 animate-bounce ${className}`} style={{ animationDelay: `${delay}s` }}>
    <Icon size={32} className="text-blue-400" />
  </div>
);

export default FloatingIcon;
