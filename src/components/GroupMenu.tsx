
import React, { useEffect, useRef } from 'react';
import { useWidget, WidgetGroup } from '@/context/WidgetContext';
import { Circle, Plus, Settings, Trash2, Edit } from 'lucide-react';

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
    removeWidgetFromGroup,
    createGroup
  } = useWidget();
  
  const menuRef = useRef<HTMLDivElement>(null);
  
  const widget = widgets.find(w => w.id === widgetId);
  const currentGroupId = widget?.groupId;
  
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
  
  const handleCreateNewGroup = () => {
    // For now, create a group with default values. In a real app, this would show a dialog
    const newId = createGroup('Новая группа', 'TICKER', '#8B5CF6');
    if (widget) {
      addWidgetToGroup(widgetId, newId);
    }
    onClose();
  };
  
  const handleSelectGroup = (groupId: string) => {
    addWidgetToGroup(widgetId, groupId);
    onClose();
  };
  
  const handleRemoveFromGroup = () => {
    removeWidgetFromGroup(widgetId);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="group-menu absolute glass-effect rounded-lg shadow-lg py-2 overflow-hidden z-[1000] border border-terminal-border bg-terminal-widget"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: '240px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      <div className="px-3 py-2 border-b border-terminal-border/50">
        <h3 className="text-sm font-medium">Управление группами</h3>
      </div>
      
      {currentGroupId && (
        <div className="p-2 border-b border-terminal-border/50">
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-xs text-terminal-muted">Текущая группа</span>
          </div>
          <button
            className="flex items-center w-full space-x-3 px-3 py-2 rounded-md hover:bg-terminal-accent/50 transition-colors text-left text-sm"
            onClick={handleRemoveFromGroup}
          >
            <span className="text-terminal-negative">
              <Trash2 size={16} />
            </span>
            <span>Удалить из группы</span>
          </button>
        </div>
      )}
      
      <div className="p-2">
        <div className="flex justify-between items-center px-3 py-2">
          <span className="text-xs text-terminal-muted">Доступные группы</span>
        </div>
        
        {widgetGroups.map((group) => (
          <button
            key={group.id}
            className={`flex items-center w-full space-x-3 px-3 py-2 rounded-md 
              ${currentGroupId === group.id ? 'bg-terminal-accent/50' : 'hover:bg-terminal-accent/30'} 
              transition-colors text-left text-sm`}
            onClick={() => handleSelectGroup(group.id)}
          >
            <span>
              <Circle size={16} fill={group.color} color={group.color} />
            </span>
            <span className="flex-grow">{group.name}</span>
            <span className="text-xs text-terminal-muted">{group.symbol}</span>
          </button>
        ))}
        
        <button
          className="flex items-center w-full space-x-3 px-3 py-2 mt-2 rounded-md border border-dashed border-terminal-border/50 hover:bg-terminal-accent/30 transition-colors text-left text-sm"
          onClick={handleCreateNewGroup}
        >
          <span className="text-terminal-muted">
            <Plus size={16} />
          </span>
          <span>Создать новую группу</span>
        </button>
      </div>
      
      <div className="px-3 py-2 border-t border-terminal-border/50 text-xs text-terminal-muted">
        Группы позволяют связать виджеты с одним инструментом
      </div>
    </div>
  );
};

export default GroupMenu;
