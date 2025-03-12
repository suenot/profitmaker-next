
import React, { useEffect, useRef } from 'react';
import { useWidget, WidgetGroup } from '@/context/WidgetContext';
import { X, Search } from 'lucide-react';

interface GroupMenuProps {
  widgetId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const GroupMenu: React.FC<GroupMenuProps> = ({ widgetId, position, onClose }) => {
  const { 
    widgetGroups, 
    widgets, 
    addWidgetToGroup,
  } = useWidget();
  
  const menuRef = useRef<HTMLDivElement>(null);
  
  const widget = widgets.find(w => w.id === widgetId);
  
  // Close menu when clicking outside
  useEffect(() => {
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
  
  const handleSelectGroup = (groupId: string) => {
    addWidgetToGroup(widgetId, groupId);
    onClose();
  };

  // Predefined group colors in the project
  const groupColors = [
    { id: 'group-1', name: 'USDRUB', color: '#FFD700' }, // Gold/Yellow
    { id: 'group-2', name: 'Группа 2', color: '#F87171' }, // Red
    { id: 'group-3', name: 'Группа 3', color: '#A78BFA' }, // Purple
    { id: 'group-4', name: 'Группа 4', color: '#60A5FA' }, // Blue
    { id: 'group-5', name: 'Группа 5', color: '#BEF264' }, // Light Green
    { id: 'group-6', name: 'Группа 6', color: '#6EE7B7' }, // Teal
    { id: 'group-7', name: 'Группа 7', color: '#FCD34D' }, // Amber/Orange
  ];

  return (
    <div
      ref={menuRef}
      className="group-menu absolute rounded-lg shadow-lg overflow-hidden z-[1000] border border-terminal-border bg-[#1A202C] text-white"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: '240px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      <div className="flex items-center p-3 border-b border-terminal-border/50">
        <X size={18} className="mr-2 cursor-pointer" onClick={onClose} />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Об инструменте"
            className="w-full px-2 py-1 pl-8 bg-terminal-widget rounded-sm text-sm border border-terminal-border/50"
          />
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-terminal-muted" />
        </div>
      </div>
      
      <div className="p-0">
        {groupColors.map((group) => (
          <button
            key={group.id}
            className="flex items-center w-full px-4 py-3 hover:bg-terminal-accent/30 transition-colors text-left"
            onClick={() => handleSelectGroup(group.id)}
          >
            <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: group.color }}></span>
            <span className="text-sm">{group.name}</span>
          </button>
        ))}
      </div>
      
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
          <Search size={32} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Выберите инструмент</h3>
        <p className="text-sm text-gray-400">
          Чтобы начать работу в виджете, найдите необходимый инструмент
        </p>
      </div>
    </div>
  );
};

export default GroupMenu;
