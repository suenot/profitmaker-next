import React, { useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { BarChart3, PieChart, ListOrdered, FileText, Clock, LineChart, Newspaper, Calendar } from 'lucide-react';

type WidgetType = 'chart' | 'portfolio' | 'orderForm' | 'transactionHistory' | 'custom';

interface WidgetMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
}

const WidgetMenu: React.FC<WidgetMenuProps> = ({ position, onClose }) => {
  const addWidget = useDashboardStore(s => s.addWidget);
  const activeDashboardId = useDashboardStore(s => s.activeDashboardId);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Debug logging for widget menu
  React.useEffect(() => {
    console.log('WidgetMenu: Active dashboard changed', { activeDashboardId });
  }, [activeDashboardId]);
  
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
    if (!activeDashboardId) return;
    
    // Calculate position for new widget
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Default sizes for different widget types
    const defaultSizes = {
      chart: { width: 650, height: 330 },
      portfolio: { width: 800, height: 350 },
      orderForm: { width: 350, height: 550 },
      transactionHistory: { width: 400, height: 350 },
      custom: { width: 400, height: 300 }
    };
    
    const size = defaultSizes[type];
    let x = Math.max(20, Math.floor((viewportWidth - size.width) / 2));
    let y = Math.max(80, Math.floor((viewportHeight - size.height) / 2));
    
    // Widget titles mapping
    const widgetTitles = {
      chart: 'Деньги не спят: график',
      portfolio: 'Инвестиционный счёт',
      orderForm: 'Заявка',
      transactionHistory: 'Деньги не спят: История операций',
      custom: 'Пользовательский виджет'
    };
    
    addWidget(activeDashboardId, {
      type,
      title: widgetTitles[type], // deprecated
      defaultTitle: widgetTitles[type],
      userTitle: undefined,
      position: { x, y, width: size.width, height: size.height },
      config: {},
      isVisible: true,
      isMinimized: false
    });
    
    onClose();
  };

  const widgetOptions = [
    { type: 'chart' as WidgetType, label: 'График цены', icon: <LineChart size={16} /> },
    { type: 'portfolio' as WidgetType, label: 'Портфель', icon: <PieChart size={16} /> },
    { type: 'orderForm' as WidgetType, label: 'Форма заявки', icon: <FileText size={16} /> },
    { type: 'transactionHistory' as WidgetType, label: 'История операций', icon: <ListOrdered size={16} /> },
    { type: 'custom' as WidgetType, label: 'Пользовательский виджет', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div
      ref={menuRef}
      className="widget-menu absolute rounded-lg shadow-lg overflow-hidden z-[10002] border border-terminal-border bg-terminal-widget/95 backdrop-blur-md text-terminal-text"
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
