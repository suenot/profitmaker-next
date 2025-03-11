
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
    x: Math.min(position.x, window.innerWidth - 260),
    y: Math.min(position.y, window.innerHeight - 440)
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
    { type: 'chart' as WidgetType, label: 'Price Chart', icon: <LineChart size={18} /> },
    { type: 'portfolio' as WidgetType, label: 'Portfolio', icon: <PieChart size={18} /> },
    { type: 'orderForm' as WidgetType, label: 'Order Form', icon: <FileText size={18} /> },
    { type: 'transactions' as WidgetType, label: 'Transactions', icon: <ListOrdered size={18} /> },
    { type: 'watchlist' as WidgetType, label: 'Watchlist', icon: <BarChart3 size={18} /> },
    { type: 'news' as WidgetType, label: 'Market News', icon: <Newspaper size={18} /> },
    { type: 'calendar' as WidgetType, label: 'Economic Calendar', icon: <Calendar size={18} /> },
    { type: 'positions' as WidgetType, label: 'Open Positions', icon: <Clock size={18} /> },
  ];

  return (
    <div
      ref={menuRef}
      className="widget-menu absolute glass-effect rounded-lg shadow-lg py-2 overflow-hidden w-60 z-50"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      <div className="px-4 py-2 bg-terminal-accent/30 backdrop-blur-md">
        <h3 className="text-sm font-medium">Add Widget</h3>
      </div>
      <div className="p-2 grid grid-cols-2 gap-2">
        {widgetOptions.map((option) => (
          <button
            key={option.type}
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-terminal-accent transition-colors text-left"
            onClick={() => handleAddWidget(option.type)}
          >
            <span className="text-terminal-muted">{option.icon}</span>
            <span className="text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WidgetMenu;
