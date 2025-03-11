
import React, { useState } from 'react';
import { WidgetGroup, useWidget } from '@/context/WidgetContext';
import { Circle, Edit, Trash2, Check, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GroupManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Available colors for groups
const colorOptions = [
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink 
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
  '#10B981', // Emerald Green
  '#FBBF24', // Amber Yellow
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#F43F5E', // Rose
  '#84CC16'  // Lime
];

const GroupManagerDialog: React.FC<GroupManagerDialogProps> = ({ open, onOpenChange }) => {
  const { 
    widgetGroups, 
    createGroup, 
    updateGroup, 
    deleteGroup,
    widgets
  } = useWidget();
  
  const [editingGroup, setEditingGroup] = useState<WidgetGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSymbol, setNewGroupSymbol] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  
  // Count widgets in each group
  const getWidgetCount = (groupId: string) => {
    return widgets.filter(widget => widget.groupId === groupId).length;
  };
  
  const handleCreateGroup = () => {
    if (newGroupName && newGroupSymbol) {
      createGroup(newGroupName, newGroupSymbol, selectedColor);
      setNewGroupName('');
      setNewGroupSymbol('');
      setSelectedColor(colorOptions[0]);
    }
  };
  
  const handleStartEdit = (group: WidgetGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupSymbol(group.symbol);
    setSelectedColor(group.color);
  };
  
  const handleSaveEdit = () => {
    if (editingGroup && newGroupName && newGroupSymbol) {
      updateGroup(editingGroup.id, {
        name: newGroupName,
        symbol: newGroupSymbol,
        color: selectedColor
      });
      setEditingGroup(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingGroup(null);
  };
  
  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
    if (editingGroup?.id === groupId) {
      setEditingGroup(null);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-terminal-widget text-terminal-text">
        <DialogHeader>
          <DialogTitle>Управление группами виджетов</DialogTitle>
          <DialogDescription>
            Организуйте виджеты по группам для совместной работы с инструментами
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Create new group */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Создать новую группу</h3>
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="flex gap-1">
                  {colorOptions.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full ${selectedColor === color ? 'ring-2 ring-terminal-text' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Input 
                placeholder="Название группы" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-grow bg-terminal-accent/30 border-terminal-border"
              />
              <Input 
                placeholder="Тикер" 
                value={newGroupSymbol} 
                onChange={(e) => setNewGroupSymbol(e.target.value)}
                className="w-24 bg-terminal-accent/30 border-terminal-border"
              />
              <Button
                variant="secondary"
                onClick={handleCreateGroup}
                disabled={!newGroupName || !newGroupSymbol}
              >
                Создать
              </Button>
            </div>
          </div>
          
          {/* Group list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Существующие группы</h3>
            <div className="border rounded-md border-terminal-border">
              {widgetGroups.length === 0 ? (
                <div className="p-4 text-center text-terminal-muted text-sm">
                  Нет созданных групп
                </div>
              ) : (
                <div className="divide-y divide-terminal-border">
                  {widgetGroups.map(group => (
                    <div key={group.id} className="p-3 flex items-center justify-between">
                      {editingGroup?.id === group.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex gap-1">
                            {colorOptions.map(color => (
                              <button 
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-5 h-5 rounded-full ${selectedColor === color ? 'ring-2 ring-terminal-text' : ''}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <Input 
                            value={newGroupName} 
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="flex-grow bg-terminal-accent/30 border-terminal-border"
                          />
                          <Input 
                            value={newGroupSymbol} 
                            onChange={(e) => setNewGroupSymbol(e.target.value)}
                            className="w-24 bg-terminal-accent/30 border-terminal-border"
                          />
                          <button 
                            onClick={handleSaveEdit}
                            className="p-1 text-green-500 hover:bg-terminal-accent/30 rounded"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="p-1 text-terminal-negative hover:bg-terminal-accent/30 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Circle size={16} fill={group.color} color={group.color} />
                            <span>{group.name}</span>
                            <span className="text-xs text-terminal-muted">{group.symbol}</span>
                            <span className="text-xs px-2 py-0.5 bg-terminal-accent/30 rounded-full">
                              {getWidgetCount(group.id)} виджетов
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleStartEdit(group)}
                              className="p-1 text-terminal-muted hover:text-terminal-text hover:bg-terminal-accent/30 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteGroup(group.id)}
                              className="p-1 text-terminal-muted hover:text-terminal-negative hover:bg-terminal-accent/30 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupManagerDialog;
