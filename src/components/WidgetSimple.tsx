import React, { useRef, useState, useCallback } from 'react';
import { X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';

interface WidgetSimpleProps {
  id: string;
  title: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
  onRemove: () => void;
}

const SNAP_DISTANCE = 8; // Расстояние для прилипания в пикселях
const HEADER_HEIGHT = 0; // Высота header + tabs navigation в пикселях

const WidgetSimple: React.FC<WidgetSimpleProps> = ({
  id,
  title,
  children,
  position,
  size,
  zIndex,
  isActive,
  onRemove
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [preMaximizeState, setPreMaximizeState] = useState<{
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);
  
  // Local state for real-time updates during drag/resize
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentSize, setCurrentSize] = useState(size);
  
  const moveWidget = useDashboardStore(s => s.moveWidget);
  const resizeWidget = useDashboardStore(s => s.resizeWidget);
  const activeDashboardId = useDashboardStore(s => s.activeDashboardId);
  const dashboards = useDashboardStore(s => s.dashboards);

  // Get other widgets for snapping
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
  const otherWidgets = activeDashboard?.widgets.filter(w => w.id !== id) || [];

  // Update local state when props change (from store)
  React.useEffect(() => {
    setCurrentPosition(position);
  }, [position.x, position.y]);

  React.useEffect(() => {
    setCurrentSize(size);
  }, [size.width, size.height]);

  // Handle maximize/minimize toggle
  const handleMaximizeToggle = useCallback(() => {
    if (isMaximized) {
      // Restore previous state
      if (preMaximizeState) {
        setCurrentPosition(preMaximizeState.position);
        setCurrentSize(preMaximizeState.size);
        if (activeDashboardId) {
          moveWidget(activeDashboardId, id, preMaximizeState.position.x, preMaximizeState.position.y);
          resizeWidget(activeDashboardId, id, preMaximizeState.size.width, preMaximizeState.size.height);
        }
      }
      setPreMaximizeState(null);
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      setPreMaximizeState({
        position: currentPosition,
        size: currentSize
      });
      setIsMaximized(true);
    }
  }, [isMaximized, preMaximizeState, currentPosition, currentSize, activeDashboardId, moveWidget, resizeWidget, id]);

  // Snapping logic
  const applySnapping = useCallback((x: number, y: number, width: number, height: number) => {
    let snappedX = x;
    let snappedY = y;

    // Snap to viewport edges
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Left edge
    if (Math.abs(x) < SNAP_DISTANCE) {
      snappedX = 0;
    }
    // Right edge
    if (Math.abs(x + width - viewportWidth) < SNAP_DISTANCE) {
      snappedX = viewportWidth - width;
    }
    // Top edge (accounting for header height)
    if (Math.abs(y - HEADER_HEIGHT) < SNAP_DISTANCE) {
      snappedY = HEADER_HEIGHT;
    }
    // Bottom edge
    if (Math.abs(y + height - viewportHeight) < SNAP_DISTANCE) {
      snappedY = viewportHeight - height;
    }

    // Snap to other widgets
    otherWidgets.forEach(widget => {
      const wPos = widget.position;
      
      // Snap to left/right edges of other widgets
      if (Math.abs(x - wPos.x) < SNAP_DISTANCE) {
        snappedX = wPos.x;
      }
      if (Math.abs(x - (wPos.x + wPos.width)) < SNAP_DISTANCE) {
        snappedX = wPos.x + wPos.width;
      }
      if (Math.abs((x + width) - wPos.x) < SNAP_DISTANCE) {
        snappedX = wPos.x - width;
      }
      if (Math.abs((x + width) - (wPos.x + wPos.width)) < SNAP_DISTANCE) {
        snappedX = wPos.x + wPos.width - width;
      }

      // Snap to top/bottom edges of other widgets
      if (Math.abs(y - wPos.y) < SNAP_DISTANCE) {
        snappedY = wPos.y;
      }
      if (Math.abs(y - (wPos.y + wPos.height)) < SNAP_DISTANCE) {
        snappedY = wPos.y + wPos.height;
      }
      if (Math.abs((y + height) - wPos.y) < SNAP_DISTANCE) {
        snappedY = wPos.y - height;
      }
      if (Math.abs((y + height) - (wPos.y + wPos.height)) < SNAP_DISTANCE) {
        snappedY = wPos.y + wPos.height - height;
      }
    });

    return { x: snappedX, y: snappedY };
  }, [otherWidgets]);

  // Handle drag with useCallback to prevent recreation
  const handleDrag = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Исправленная логика: вычисляем позицию относительно изначального клика
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Применяем границы экрана
      newX = Math.max(0, Math.min(newX, window.innerWidth - currentSize.width));
      newY = Math.max(HEADER_HEIGHT, Math.min(newY, window.innerHeight - currentSize.height));
      
      // Применяем snapping
      const snapped = applySnapping(newX, newY, currentSize.width, currentSize.height);
      
      // Update local state immediately for smooth visual feedback
      setCurrentPosition({ x: snapped.x, y: snapped.y });
    }
  }, [isDragging, dragOffset.x, dragOffset.y, currentSize.width, currentSize.height, applySnapping]);

  // Handle drag end with useCallback
  const handleDragEnd = useCallback(() => {
    if (isDragging && activeDashboardId) {
      console.log('WidgetSimple: Drag end', {
        widgetId: id,
        dashboardId: activeDashboardId,
        newPosition: currentPosition
      });
      // Save final position to store
      moveWidget(activeDashboardId, id, currentPosition.x, currentPosition.y);
    }
    setIsDragging(false);
  }, [isDragging, activeDashboardId, moveWidget, id, currentPosition]);

  // Handle resize with useCallback
  const handleResize = useCallback((e: MouseEvent) => {
    if (isResizing && widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      let newWidth = Math.max(250, e.clientX - rect.left);
      let newHeight = Math.max(150, e.clientY - rect.top);
      
      // Snapping for resize (to other widgets and viewport)
      const rightEdge = currentPosition.x + newWidth;
      const bottomEdge = currentPosition.y + newHeight;
      
      // Snap width to viewport edge
      if (Math.abs(rightEdge - window.innerWidth) < SNAP_DISTANCE) {
        newWidth = window.innerWidth - currentPosition.x;
      }
      
      // Snap height to viewport edge
      if (Math.abs(bottomEdge - window.innerHeight) < SNAP_DISTANCE) {
        newHeight = window.innerHeight - currentPosition.y;
      }
      
      // Snap to other widgets edges
      otherWidgets.forEach(widget => {
        const wPos = widget.position;
        
        // Snap width to other widget's left edge
        if (Math.abs(rightEdge - wPos.x) < SNAP_DISTANCE) {
          newWidth = wPos.x - currentPosition.x;
        }
        // Snap width to other widget's right edge
        if (Math.abs(rightEdge - (wPos.x + wPos.width)) < SNAP_DISTANCE) {
          newWidth = (wPos.x + wPos.width) - currentPosition.x;
        }
        
        // Snap height to other widget's top edge
        if (Math.abs(bottomEdge - wPos.y) < SNAP_DISTANCE) {
          newHeight = wPos.y - currentPosition.y;
        }
        // Snap height to other widget's bottom edge
        if (Math.abs(bottomEdge - (wPos.y + wPos.height)) < SNAP_DISTANCE) {
          newHeight = (wPos.y + wPos.height) - currentPosition.y;
        }
      });
      
      // Update local state immediately for smooth visual feedback
      setCurrentSize({ width: newWidth, height: newHeight });
    }
  }, [isResizing, currentPosition.x, currentPosition.y, otherWidgets]);

  // Handle resize end with useCallback
  const handleResizeEnd = useCallback(() => {
    if (isResizing && activeDashboardId) {
      console.log('WidgetSimple: Resize end', {
        widgetId: id,
        dashboardId: activeDashboardId,
        newSize: currentSize
      });
      // Save final size to store
      resizeWidget(activeDashboardId, id, currentSize.width, currentSize.height);
    }
    setIsResizing(false);
  }, [isResizing, activeDashboardId, resizeWidget, id, currentSize]);

  // Handle drag start - ИСПРАВЛЕННАЯ ЛОГИКА
  const handleDragStart = (e: React.MouseEvent) => {
    // Сохраняем offset относительно текущей позиции виджета в viewport
    setDragOffset({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y
    });
    setIsDragging(true);
    console.log('WidgetSimple: Drag start', { 
      widgetId: id, 
      dashboardId: activeDashboardId,
      clickPos: { x: e.clientX, y: e.clientY },
      widgetPos: currentPosition,
      offset: { x: e.clientX - currentPosition.x, y: e.clientY - currentPosition.y }
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    console.log('WidgetSimple: Resize start', { widgetId: id, dashboardId: activeDashboardId });
  };

  // Mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  // Mouse event listeners for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  return (
    <div
      ref={widgetRef}
      className={cn(
        "widget-container animate-fade-in border border-terminal-border",
        isActive && "ring-1 ring-blue-500",
        isMaximized && "border-0"
      )}
      style={{
        left: isMaximized ? 0 : `${currentPosition.x}px`,
        top: isMaximized ? 0 : `${currentPosition.y}px`,
        width: isMaximized ? '100vw' : `${currentSize.width}px`,
        height: isMaximized ? '100vh' : `${currentSize.height}px`,
        zIndex: isMaximized ? 10001 : zIndex,
        position: isMaximized ? 'fixed' : 'absolute',
      }}
    >
      <div 
        className={cn(
          "widget-header h-10 px-3 py-2 bg-terminal-accent/60 flex items-center justify-between",
          !isMaximized && "cursor-move"
        )}
        onMouseDown={!isMaximized ? handleDragStart : undefined}
      >
        <div className="flex items-center">
          <h3 className="text-xs font-medium truncate text-terminal-text">{title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            className="p-1 rounded-sm hover:bg-terminal-widget/50 transition-colors"
            onClick={() => {}}
          >
            <Settings size={14} className="text-terminal-muted hover:text-terminal-text transition-colors" />
          </button>
          <button 
            className="p-1 rounded-sm hover:bg-terminal-widget/50 transition-colors"
            onClick={handleMaximizeToggle}
          >
            {isMaximized ? (
              <Minimize2 size={14} className="text-terminal-muted hover:text-terminal-text transition-colors" />
            ) : (
              <Maximize2 size={14} className="text-terminal-muted hover:text-terminal-text transition-colors" />
            )}
          </button>
          <button 
            className="p-1 rounded-sm hover:bg-terminal-widget/50 text-terminal-muted hover:text-terminal-negative transition-colors"
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
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-50 transition-opacity"
          style={{
            background: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '4px 4px',
            backgroundPosition: 'bottom right',
            color: 'hsl(var(--terminal-muted))'
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default WidgetSimple; 