
import React, { useEffect, useRef, useState } from 'react';
import { useWidget, WidgetType } from '@/context/WidgetContext';
import { BarChart3, PieChart, ListOrdered, FileText, Clock, LineChart, Newspaper, Calendar, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WidgetMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
}

const WidgetMenu: React.FC<WidgetMenuProps> = ({ position, onClose }) => {
  const { addWidget, widgetGroups } = useWidget();
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<"widgets" | "groups">("widgets");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
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
    addWidget(type, selectedGroupId);
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
      className="widget-menu absolute glass-effect rounded-lg shadow-lg overflow-hidden z-50 border border-terminal-border bg-terminal-widget"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y, width: '300px' }}
    >
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "widgets" | "groups")}>
        <div className="border-b border-terminal-border/50">
          <TabsList className="w-full bg-transparent border-b border-terminal-border/20">
            <TabsTrigger 
              value="widgets" 
              className="flex-1 data-[state=active]:bg-terminal-accent/40 data-[state=active]:shadow-none"
            >
              Виджеты
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              className="flex-1 data-[state=active]:bg-terminal-accent/40 data-[state=active]:shadow-none"
            >
              Группа
            </TabsTrigger>
          </TabsList>
        </div>
      
        <TabsContent value="widgets" className="pt-1 pb-2">
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium">Добавить виджет</h3>
            {selectedGroupId && (
              <div className="flex items-center mt-1 text-xs text-terminal-muted">
                <span>Будет добавлен в группу: </span>
                <span className="ml-1 flex items-center">
                  {widgetGroups.find(g => g.id === selectedGroupId)?.name || 'Группа'}
                </span>
              </div>
            )}
          </div>
          <div className="p-2">
            {widgetOptions.map((option) => (
              <button
                key={option.type}
                className="flex items-center w-full space-x-3 px-3 py-2 rounded-md hover:bg-terminal-accent/50 transition-colors text-left text-sm"
                onClick={() => handleAddWidget(option.type)}
              >
                <span className="text-terminal-muted">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="groups" className="pt-0 pb-2">
          <div className="px-3 py-2 border-b border-terminal-border/50">
            <h3 className="text-sm font-medium">Выберите группу</h3>
            <p className="text-xs text-terminal-muted mt-1">
              Новый виджет будет добавлен в выбранную группу
            </p>
          </div>
          <div className="p-2">
            <button
              className={`flex items-center w-full space-x-3 px-3 py-2 rounded-md 
                ${selectedGroupId === null ? 'bg-terminal-accent/50' : 'hover:bg-terminal-accent/30'} 
                transition-colors text-left text-sm mb-1`}
              onClick={() => setSelectedGroupId(null)}
            >
              <span className="text-terminal-muted">Без группы</span>
            </button>
            
            {widgetGroups.map((group) => (
              <button
                key={group.id}
                className={`flex items-center w-full space-x-3 px-3 py-2 rounded-md 
                  ${selectedGroupId === group.id ? 'bg-terminal-accent/50' : 'hover:bg-terminal-accent/30'} 
                  transition-colors text-left text-sm`}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <span>
                  <Circle size={16} fill={group.color} color={group.color} />
                </span>
                <span className="flex-grow">{group.name}</span>
                <span className="text-xs text-terminal-muted">{group.symbol}</span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-2 border-t border-terminal-border/50 text-xs text-terminal-muted px-3">
        Выберите виджет для добавления на рабочую область
      </div>
    </div>
  );
};

export default WidgetMenu;
