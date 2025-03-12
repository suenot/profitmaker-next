import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export type WidgetType = 'chart' | 'portfolio' | 'orderForm' | 'transactions' | 'watchlist' | 'news' | 'calendar' | 'positions';

export interface WidgetGroup {
  id: string;
  name: string;
  color: string;
  symbol: string;
  isActive: boolean;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
  groupId: string | null;
}

interface WidgetContextType {
  widgets: Widget[];
  widgetGroups: WidgetGroup[];
  activeGroupId: string | null;
  addWidget: (type: WidgetType, groupId?: string | null) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void;
  updateWidgetSize: (id: string, size: { width: number; height: number }) => void;
  activateWidget: (id: string) => void;
  createGroup: (name: string, symbol: string, color: string) => string;
  updateGroup: (id: string, data: Partial<Omit<WidgetGroup, 'id'>>) => void;
  deleteGroup: (id: string) => void;
  addWidgetToGroup: (widgetId: string, groupId: string) => void;
  removeWidgetFromGroup: (widgetId: string) => void;
  activateGroup: (groupId: string) => void;
  getGroupColor: (groupId: string | null) => string;
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

// Group color palette
const groupColors = [
  '#FFD700', // Gold/Yellow (USDRUB)
  '#F87171', // Red (Group 2)
  '#A78BFA', // Purple (Group 3)
  '#60A5FA', // Blue (Group 4)
  '#BEF264', // Light Green (Group 5)
  '#6EE7B7', // Teal (Group 6)
  '#FCD34D'  // Amber/Orange (Group 7)
];

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [widgetGroups, setWidgetGroups] = useState<WidgetGroup[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

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
        isActive: false,
        groupId: null
      },
      {
        id: '2',
        type: 'orderForm',
        title: 'Заявка',
        position: { x: 830, y: 80 },
        size: { width: 350, height: 550 },
        zIndex: 2,
        isActive: false,
        groupId: null
      },
      {
        id: '3',
        type: 'chart',
        title: 'Деньги не спят: график',
        position: { x: 20, y: 440 },
        size: { width: 650, height: 330 },
        zIndex: 3,
        isActive: false,
        groupId: null
      },
      {
        id: '4',
        type: 'transactions',
        title: 'Деньги не спят: История операций',
        position: { x: 680, y: 440 },
        size: { width: 400, height: 330 },
        zIndex: 4,
        isActive: false,
        groupId: null
      },
    ];
    
    // Create default groups
    const defaultGroups: WidgetGroup[] = [
      {
        id: 'group-1',
        name: 'USDRUB',
        color: groupColors[0],
        symbol: 'USDRUB',
        isActive: true
      },
      {
        id: 'group-2',
        name: 'Группа 2',
        color: groupColors[1],
        symbol: 'ГРУППА 2',
        isActive: false
      },
      {
        id: 'group-3',
        name: 'Группа 3',
        color: groupColors[2],
        symbol: 'ГРУППА 3',
        isActive: false
      },
      {
        id: 'group-4',
        name: 'Группа 4',
        color: groupColors[3],
        symbol: 'ГРУППА 4',
        isActive: false
      },
      {
        id: 'group-5',
        name: 'Группа 5',
        color: groupColors[4],
        symbol: 'ГРУППА 5',
        isActive: false
      },
      {
        id: 'group-6',
        name: 'Группа 6',
        color: groupColors[5],
        symbol: 'ГРУППА 6',
        isActive: false
      },
      {
        id: 'group-7',
        name: 'Группа 7',
        color: groupColors[6],
        symbol: 'ГРУППА 7',
        isActive: false
      }
    ];
    
    setWidgets(initialWidgets);
    setWidgetGroups(defaultGroups);
    setNextZIndex(5);
    setActiveGroupId(defaultGroups[0].id);
  }, []);

  const addWidget = (type: WidgetType, groupId: string | null = null) => {
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
      isActive: true,
      groupId
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setNextZIndex(prev => prev + 1);
    
    toast(`Виджет "${widgetTitles[type]}" добавлен`, {
      duration: 2000,
    });
    
    return id;
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
  
  // Group management functions
  const createGroup = (name: string, symbol: string, color: string) => {
    const id = `group-${Date.now()}`;
    const newGroup: WidgetGroup = {
      id,
      name,
      color,
      symbol,
      isActive: false
    };
    
    setWidgetGroups(prev => [...prev, newGroup]);
    
    toast(`Группа "${name}" создана`, {
      duration: 2000,
    });
    
    return id;
  };
  
  const updateGroup = (id: string, data: Partial<Omit<WidgetGroup, 'id'>>) => {
    setWidgetGroups(prev => 
      prev.map(group => 
        group.id === id ? { ...group, ...data } : group
      )
    );
    
    // If the group being updated is also the active group, we need to update it
    if (id === activeGroupId && data.symbol) {
      // Update all widgets in this group to use the new symbol
      const updatedGroup = widgetGroups.find(g => g.id === id);
      if (updatedGroup) {
        const newName = data.name || updatedGroup.name;
        toast(`Группа "${newName}" обновлена`, {
          duration: 2000,
        });
      }
    }
  };
  
  const deleteGroup = (id: string) => {
    const groupToDelete = widgetGroups.find(g => g.id === id);
    
    // Remove this group from all widgets
    setWidgets(prev => 
      prev.map(widget => 
        widget.groupId === id ? { ...widget, groupId: null } : widget
      )
    );
    
    setWidgetGroups(prev => prev.filter(group => group.id !== id));
    
    // If this was the active group, clear the active group
    if (activeGroupId === id) {
      setActiveGroupId(null);
    }
    
    if (groupToDelete) {
      toast(`Группа "${groupToDelete.name}" удалена`, {
        duration: 2000,
      });
    }
  };
  
  const addWidgetToGroup = (widgetId: string, groupId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId ? { ...widget, groupId } : widget
      )
    );
    
    const widget = widgets.find(w => w.id === widgetId);
    const group = widgetGroups.find(g => g.id === groupId);
    
    if (widget && group) {
      toast(`Виджет "${widget.title}" добавлен в группу "${group.name}"`, {
        duration: 2000,
      });
    }
  };
  
  const removeWidgetFromGroup = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    const group = widget?.groupId ? widgetGroups.find(g => g.id === widget.groupId) : null;
    
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId ? { ...widget, groupId: null } : widget
      )
    );
    
    if (widget && group) {
      toast(`Виджет "${widget.title}" удален из группы "${group.name}"`, {
        duration: 2000,
      });
    }
  };
  
  const activateGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    
    setWidgetGroups(prev => 
      prev.map(group => 
        group.id === groupId ? { ...group, isActive: true } : { ...group, isActive: false }
      )
    );
    
    const group = widgetGroups.find(g => g.id === groupId);
    if (group) {
      toast(`Группа "${group.name}" активирована`, {
        duration: 2000,
      });
    }
  };
  
  const getGroupColor = (groupId: string | null) => {
    if (!groupId) return '';
    const group = widgetGroups.find(g => g.id === groupId);
    return group ? group.color : '';
  };

  return (
    <WidgetContext.Provider 
      value={{ 
        widgets, 
        widgetGroups,
        activeGroupId,
        addWidget, 
        removeWidget, 
        updateWidgetPosition, 
        updateWidgetSize, 
        activateWidget,
        createGroup,
        updateGroup,
        deleteGroup,
        addWidgetToGroup,
        removeWidgetFromGroup,
        activateGroup,
        getGroupColor
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

