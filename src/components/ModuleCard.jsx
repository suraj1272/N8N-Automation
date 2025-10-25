import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import Button from './Button';

const ModuleCard = ({ module, index, isRead, onMarkRead }) => (
  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-cyan-200">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          {isRead ? (
            <CheckCircle className="text-green-600 flex-shrink-0 animate-pulse" size={24} />
          ) : (
            <Circle className="text-gray-400 flex-shrink-0" size={24} />
          )}
          <h4 className="font-bold text-gray-900 text-lg">{module.title}</h4>
        </div>
        {module.content && <p className="text-gray-600 leading-relaxed ml-9">{module.content}</p>}
      </div>
      <Button
        variant={isRead ? "success" : "primary"}
        size="sm"
        onClick={onMarkRead}
        disabled={isRead}
        className={isRead ? "opacity-75" : "shadow-md hover:shadow-lg"}
      >
        {isRead ? "✓ Read" : "Mark Read"}
      </Button>
    </div>
  </div>
);

export default ModuleCard;
