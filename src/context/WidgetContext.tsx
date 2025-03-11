import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export type WidgetType = 'chart' | 'portfolio' | 'orderForm' | 'transactions' | 'watchlist' | 'news' | 'calendar' | 'positions';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
}

interface WidgetContextType {
  widgets: Widget[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void;
  updateWidgetSize: (id: string, size: { width: number; height: number }) => void;
  activateWidget: (id: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const defaultWidgetSizes: Record<WidgetType, { width: number; height: number }> = {
  chart: { width: 650, height: 330 },
  portfolio: { width: 800, height: 350 },
  orderForm: { width: 350, height: 550 },
  transactions: { width: 400, height: 350 },
  watchlist: { width: 350, height: 400 },
  news: { width: 400, height: 500 },
  calendar: { width: 400, height: 350 },
  positions: { width: 500, height: 350 }
};

const widgetTitles: Record<WidgetType, string> = {
  chart: 'Деньги не спят: график',
  portfolio: 'Инвестиционный счёт',
  orderForm: 'Заявка',
  transactions: 'Деньги не спят: История операций',
  watchlist: 'Список наблюдения',
  news: 'Новости рынка',
  calendar: 'Экономический календарь',
  positions: 'Открытые позиции'
};

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  // Initialize with some default widgets
  useEffect(() => {
    const initialWidgets: Widget[] = [
      {
        id: '1',
        type: 'portfolio',
        title: 'Инвестиционный счёт',
        position: { x: 20, y: 80 },
        size: { width: 800, height: 350 },
        zIndex: 1,
        isActive: false
      },
      {
        id: '2',
        type: 'orderForm',
        title: 'Заявка',
        position: { x: 830, y: 80 },
        size: { width: 350, height: 550 },
        zIndex: 2,
        isActive: false
      },
      {
        id: '3',
        type: 'chart',
        title: 'Деньги не спят: график',
        position: { x: 20, y: 440 },
        size: { width: 650, height: 330 },
        zIndex: 3,
        isActive: false
      },
      {
        id: '4',
        type: 'transactions',
        title: 'Деньги не спят: История операций',
        position: { x: 680, y: 440 },
        size: { width: 400, height: 330 },
        zIndex: 4,
        isActive: false
      },
    ];
    setWidgets(initialWidgets);
    setNextZIndex(5);
  }, []);

  const addWidget = (type: WidgetType) => {
    const id = `widget-${Date.now()}`;
    
    // Calculate position - try to place it in a visible area
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Start from center and adjust based on existing widgets
    let x = Math.max(20, Math.floor((viewportWidth - defaultWidgetSizes[type].width) / 2));
    let y = Math.max(80, Math.floor((viewportHeight - defaultWidgetSizes[type].height) / 2));
    
    // Offset a bit to make the new widget visible
    x += widgets.length * 15;
    y += widgets.length * 15;
    
    // Make sure it stays within viewport bounds
    x = Math.min(x, viewportWidth - defaultWidgetSizes[type].width - 20);
    y = Math.min(y, viewportHeight - defaultWidgetSizes[type].height - 20);
    
    const newWidget: Widget = {
      id,
      type,
      title: widgetTitles[type],
      position: { x, y },
      size: defaultWidgetSizes[type],
      zIndex: nextZIndex,
      isActive: true
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setNextZIndex(prev => prev + 1);
    
    toast(`Виджет "${widgetTitles[type]}" добавлен`, {
      duration: 2000,
    });
  };

  const removeWidget = (id: string) => {
    const widgetToRemove = widgets.find(w => w.id === id);
    
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    
    if (widgetToRemove) {
      toast(`Виджет "${widgetToRemove.title}" удален`, {
        duration: 2000,
      });
    }
  };

  const updateWidgetPosition = (id: string, position: { x: number; y: number }) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, position } : widget
      )
    );
  };

  const updateWidgetSize = (id: string, size: { width: number; height: number }) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, size } : widget
      )
    );
  };

  const activateWidget = (id: string) => {
    setWidgets(prev => {
      const inactiveWidgets = prev.map(widget => 
        widget.id === id ? { ...widget, zIndex: nextZIndex, isActive: true } : { ...widget, isActive: false }
      );
      return inactiveWidgets;
    });
    
    setNextZIndex(prev => prev + 1);
  };

  return (
    <WidgetContext.Provider 
      value={{ 
        widgets, 
        addWidget, 
        removeWidget, 
        updateWidgetPosition, 
        updateWidgetSize, 
        activateWidget 
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};
