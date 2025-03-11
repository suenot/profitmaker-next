
import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface UseDraggableOptions {
  initialPosition: Position;
  initialSize: Size;
  onPositionChange?: (position: Position) => void;
  onSizeChange?: (size: Size) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  minWidth?: number;
  minHeight?: number;
  bounds?: { left: number; top: number; right: number; bottom: number };
}

export const useWidgetDrag = ({
  initialPosition,
  initialSize,
  onPositionChange,
  onSizeChange,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
  minWidth = 200,
  minHeight = 150,
  bounds,
}: UseDraggableOptions) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const elementStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeStartSize = useRef<{ width: number; height: number } | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);

  // Set up refs to track mouse position for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStartPos.current && elementStartPos.current) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        
        let newX = elementStartPos.current.x + deltaX;
        let newY = elementStartPos.current.y + deltaY;
        
        // Apply bounds if specified
        if (bounds) {
          newX = Math.max(bounds.left, Math.min(newX, bounds.right - size.width));
          newY = Math.max(bounds.top, Math.min(newY, bounds.bottom - size.height));
        }
        
        setPosition({ x: newX, y: newY });
        onPositionChange?.({ x: newX, y: newY });
      }
      
      if (isResizing && resizeStartSize.current && resizeStartPos.current) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        
        const newWidth = Math.max(minWidth, resizeStartSize.current.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStartSize.current.height + deltaY);
        
        // Check if the new size would exceed bounds
        if (bounds) {
          const rightBoundary = bounds.right - position.x;
          const bottomBoundary = bounds.bottom - position.y;
          
          const boundedWidth = Math.min(newWidth, rightBoundary);
          const boundedHeight = Math.min(newHeight, bottomBoundary);
          
          setSize({ width: boundedWidth, height: boundedHeight });
          onSizeChange?.({ width: boundedWidth, height: boundedHeight });
        } else {
          setSize({ width: newWidth, height: newHeight });
          onSizeChange?.({ width: newWidth, height: newHeight });
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.();
      }
      
      if (isResizing) {
        setIsResizing(false);
        onResizeEnd?.();
      }
      
      dragStartPos.current = null;
      elementStartPos.current = null;
      resizeStartSize.current = null;
      resizeStartPos.current = null;
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging, 
    isResizing, 
    onDragEnd, 
    onPositionChange, 
    onResizeEnd, 
    onSizeChange, 
    bounds, 
    minHeight, 
    minWidth, 
    position.x, 
    position.y, 
    size.width, 
    size.height
  ]);
  
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...position };
    onDragStart?.();
  };
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { ...size };
    onResizeStart?.();
  };
  
  return {
    position,
    size,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
    setPosition,
    setSize,
  };
};
