import React, { useEffect, useRef } from 'react';
import { useWidget, WidgetType } from '@/context/WidgetContext';
import { BarChart3, PieChart, ListOrdered, FileText, Clock, LineChart, Newspaper, Calendar } from 'lucide-react';

interface WidgetMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
}

const WidgetMenu: React.FC<WidgetMenuProps> = ({ position, onClose }) => {
  const { addWidget } = useWidget();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Adjust position to ensure menu stays within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.min(position.y, window.innerHeight - 500)
  };
  
  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
    onClose();
  };

  const widgetOptions = [
    { type: 'chart' as WidgetType, label: 'График цены', icon: <LineChart size={16} /> },
    { type: 'portfolio' as WidgetType, label: 'Портфель', icon: <PieChart size={16} /> },
    { type: 'orderForm' as WidgetType, label: 'Форма заявки', icon: <FileText size={16} /> },
    { type: 'transactions' as WidgetType, label: 'История операций', icon: <ListOrdered size={16} /> },
    { type: 'watchlist' as WidgetType, label: 'Список наблюдения', icon: <BarChart3 size={16} /> },
    { type: 'news' as WidgetType, label: 'Новости рынка', icon: <Newspaper size={16} /> },
    { type: 'calendar' as WidgetType, label: 'Экономический календарь', icon: <Calendar size={16} /> },
    { type: 'positions' as WidgetType, label: 'Открытые позиции', icon: <Clock size={16} /> },
  ];

  return (
    <div
      ref={menuRef}
      className="widget-menu absolute rounded-lg shadow-lg overflow-hidden z-50 border border-terminal-border bg-terminal-widget/95 backdrop-blur-md text-terminal-text"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y, width: '300px' }}
    >
      <div className="px-3 py-2 border-b border-terminal-border/50">
        <h3 className="text-sm font-medium">Добавить виджет</h3>
      </div>
      
      <div className="p-2">
        {widgetOptions.map((option) => (
          <button
            key={option.type}
            className="flex items-center w-full space-x-3 px-3 py-2 rounded-md hover:bg-terminal-accent/50 hover:text-terminal-text transition-colors text-left text-sm"
            onClick={() => handleAddWidget(option.type)}
          >
            <span className="text-terminal-muted">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      
      <div className="p-2 border-t border-terminal-border/50 text-xs text-terminal-muted px-3">
        Выберите виджет для добавления на рабочую область
      </div>
    </div>
  );
};

export default WidgetMenu;
