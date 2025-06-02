
import React, { useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Settings, Plus, Circle } from 'lucide-react';
import { useWidgetDrag } from '@/hooks/useWidgetDrag';
import { useDashboardStore } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
  onRemove: () => void;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  children,
  position,
  size,
  zIndex,
  isActive,
  onRemove
}) => {
  const { 
    updateWidgetPosition, 
    updateWidgetSize, 
    activateWidget, 
    getGroupColor, 
    widgets
  } = useWidget();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const previousSizeRef = useRef(size);
  const previousPositionRef = useRef(position);
  
  const widget = widgets.find(w => w.id === id);
  const groupId = widget?.groupId;
  const groupColor = getGroupColor(groupId);

  // Get viewport bounds
  const bounds = {
    left: 0,
    top: 0, // Leave space for header and tabs
    right: window.innerWidth,
    bottom: window.innerHeight
  };

  // Function to handle widget snapping during movement
  const handleWidgetSnap = (widgetId: string, rect: DOMRect) => {
    const result = { x: null as number | null, y: null as number | null };
    const snapThreshold = 14;

    // Get coordinates of the current widget being moved
    const widgetLeft = rect.left;
    const widgetRight = rect.left + rect.width;
    const widgetTop = rect.top;
    const widgetBottom = rect.top + rect.height;
    const widgetCenterX = widgetLeft + rect.width / 2;
    const widgetCenterY = widgetTop + rect.height / 2;

    // Check if close to container boundaries
    if (Math.abs(rect.left) <= snapThreshold) {
      result.x = 0; // Snap to left edge of container
    } else if (Math.abs(bounds.right - widgetRight) <= snapThreshold) {
      result.x = bounds.right - rect.width; // Snap to right edge
    }

    if (Math.abs(rect.top - bounds.top) <= snapThreshold) {
      result.y = bounds.top; // Snap to top edge
    } else if (Math.abs(bounds.bottom - widgetBottom) <= snapThreshold) {
      result.y = bounds.bottom - rect.height; // Snap to bottom edge
    }

    // Check alignment with other widgets
    widgets.forEach(otherWidget => {
      if (otherWidget.id === widgetId) return; // Skip the current widget

      const otherLeft = otherWidget.position.x;
      const otherRight = otherWidget.position.x + otherWidget.size.width;
      const otherTop = otherWidget.position.y;
      const otherBottom = otherWidget.position.y + otherWidget.size.height;
      const otherCenterX = otherLeft + otherWidget.size.width / 2;
      const otherCenterY = otherTop + otherWidget.size.height / 2;

      // Horizontal alignment checks
      if (Math.abs(widgetLeft - otherLeft) <= snapThreshold) {
        result.x = otherLeft; // Align left edges
      } else if (Math.abs(widgetRight - otherRight) <= snapThreshold) {
        result.x = otherRight - rect.width; // Align right edges
      } else if (Math.abs(widgetLeft - otherRight) <= snapThreshold) {
        result.x = otherRight; // Snap right-to-left
      } else if (Math.abs(widgetRight - otherLeft) <= snapThreshold) {
        result.x = otherLeft - rect.width; // Snap left-to-right
      } else if (Math.abs(widgetCenterX - otherCenterX) <= snapThreshold) {
        result.x = otherCenterX - rect.width / 2; // Align centers horizontally
      }

      // Vertical alignment checks
      if (Math.abs(widgetTop - otherTop) <= snapThreshold) {
        result.y = otherTop; // Align top edges
      } else if (Math.abs(widgetBottom - otherBottom) <= snapThreshold) {
        result.y = otherBottom - rect.height; // Align bottom edges
      } else if (Math.abs(widgetTop - otherBottom) <= snapThreshold) {
        result.y = otherBottom; // Snap bottom-to-top
      } else if (Math.abs(widgetBottom - otherTop) <= snapThreshold) {
        result.y = otherTop - rect.height; // Snap top-to-bottom
      } else if (Math.abs(widgetCenterY - otherCenterY) <= snapThreshold) {
        result.y = otherCenterY - rect.height / 2; // Align centers vertically
      }
    });

    return result;
  };

  // Similar function for resize snapping
  const handleWidgetResizeSnap = (widgetId: string, rect: DOMRect) => {
    const result = { x: null as number | null, y: null as number | null };
    const snapThreshold = 14;

    const widgetRight = rect.left + rect.width;
    const widgetBottom = rect.top + rect.height;

    // Check if close to container boundaries
    if (Math.abs(bounds.right - widgetRight) <= snapThreshold) {
      result.x = bounds.right; // Snap right edge to container
    }

    if (Math.abs(bounds.bottom - widgetBottom) <= snapThreshold) {
      result.y = bounds.bottom; // Snap bottom edge to container
    }

    // Check alignment with other widgets
    widgets.forEach(otherWidget => {
      if (otherWidget.id === widgetId) return; // Skip the current widget

      const otherLeft = otherWidget.position.x;
      const otherRight = otherWidget.position.x + otherWidget.size.width;
      const otherTop = otherWidget.position.y;
      const otherBottom = otherWidget.position.y + otherWidget.size.height;

      // Right edge alignment
      if (Math.abs(widgetRight - otherLeft) <= snapThreshold) {
        result.x = otherLeft; // Snap to left edge of other widget
      } else if (Math.abs(widgetRight - otherRight) <= snapThreshold) {
        result.x = otherRight; // Align with right edge of other widget
      }

      // Bottom edge alignment
      if (Math.abs(widgetBottom - otherTop) <= snapThreshold) {
        result.y = otherTop; // Snap to top edge of other widget
      } else if (Math.abs(widgetBottom - otherBottom) <= snapThreshold) {
        result.y = otherBottom; // Align with bottom edge of other widget
      }
    });

    return result;
  };

  const {
    position: currentPosition,
    size: currentSize,
    handleDragStart,
    handleResizeStart,
  } = useWidgetDrag({
    initialPosition: position,
    initialSize: size,
    onPositionChange: (newPosition) => {
      updateWidgetPosition(id, newPosition);
    },
    onSizeChange: (newSize) => {
      updateWidgetSize(id, newSize);
    },
    onWidgetMove: handleWidgetSnap,
    onWidgetResize: handleWidgetResizeSnap,
    widgetId: id,
    minWidth: 250,
    minHeight: 150,
    bounds,
  });

  // Handle maximize/minimize
  const toggleMaximize = () => {
    if (!isMaximized) {
      // Save current size and position before maximizing
      previousSizeRef.current = { width: currentSize.width, height: currentSize.height };
      previousPositionRef.current = { x: currentPosition.x, y: currentPosition.y };
      
      // Maximize to viewport
      const maxSize = { 
        width: bounds.right - bounds.left - 40,
        height: bounds.bottom - bounds.top - 40
      };
      const maxPosition = { 
        x: bounds.left + 20, 
        y: bounds.top + 20 
      };
      
      updateWidgetSize(id, maxSize);
      updateWidgetPosition(id, maxPosition);
    } else {
      // Restore previous size and position
      updateWidgetSize(id, previousSizeRef.current);
      updateWidgetPosition(id, previousPositionRef.current);
    }
    
    setIsMaximized(!isMaximized);
  };

  // Activate widget on click
  const handleWidgetClick = () => {
    if (!isActive) {
      activateWidget(id);
    }
  };
  
  // Toggle group menu
  const handleGroupIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGroupMenu(!showGroupMenu);
  };
  
  // Close group menu when clicking outside
  const handleCloseGroupMenu = () => {
    setShowGroupMenu(false);
  };

  return (
    <div
      id={`widget-${id}`}
      ref={widgetRef}
      className={cn(
        "widget-container animate-fade-in border border-terminal-border",
        isActive && "ring-1 ring-blue-500"
      )}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        zIndex,
      }}
      onClick={handleWidgetClick}
    >
      <div 
        className="widget-header h-10 px-3 py-2 bg-terminal-accent/60 flex items-center justify-between cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleGroupIndicatorClick}
                  className="mr-2 p-0.5 rounded-full hover:bg-terminal-accent/50 transition-colors"
                >
                  {groupId ? (
                    <Circle size={16} fill={groupColor} color={groupColor} />
                  ) : (
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border border-terminal-muted text-terminal-muted">
                      <Plus size={12} />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {groupId 
                  ? 'Просмотреть настройки группы' 
                  : 'Добавить виджет в группу'
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <h3 className="text-xs font-medium truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            className="p-1 rounded-sm hover:bg-terminal-widget/50 transition-colors"
            onClick={() => {}}
          >
            <Settings size={14} className="text-terminal-muted" />
          </button>
          <button 
            className="p-1 rounded-sm hover:bg-terminal-widget/50 transition-colors"
            onClick={toggleMaximize}
          >
            {isMaximized ? <Minimize2 size={14} className="text-terminal-muted" /> : <Maximize2 size={14} className="text-terminal-muted" />}
          </button>
          <button 
            className="p-1 rounded-sm hover:bg-terminal-widget/50 text-terminal-text transition-colors hover:text-terminal-negative"
            onClick={onRemove}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-3 h-[calc(100%-40px)] overflow-auto bg-terminal-bg">
        {children}
      </div>
      
      {/* Resize handle */}
      <div 
        className="widget-resize-handle"
        onMouseDown={handleResizeStart}
      />
      
      {/* Group menu */}
      {showGroupMenu && (
        <GroupMenu
          widgetId={id}
          position={{ x: 0, y: 40 }}
          onClose={handleCloseGroupMenu}
        />
      )}
    </div>
  );
};

export default Widget;
