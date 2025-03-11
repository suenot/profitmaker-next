
import React, { useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, MoreHorizontal, Settings } from 'lucide-react';
import { useWidgetDrag } from '@/hooks/useWidgetDrag';
import { useWidget } from '@/context/WidgetContext';
import { cn } from '@/lib/utils';

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
  const { updateWidgetPosition, updateWidgetSize, activateWidget } = useWidget();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = React.useState(false);
  const previousSizeRef = useRef(size);
  const previousPositionRef = useRef(position);

  // Get viewport bounds
  const bounds = {
    left: 0,
    top: 100, // Leave space for header and tabs
    right: window.innerWidth,
    bottom: window.innerHeight
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

  return (
    <div
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
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></div>
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
    </div>
  );
};

export default Widget;
