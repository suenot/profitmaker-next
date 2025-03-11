
import { useState, useCallback } from 'react';
import { Widget } from '@/context/WidgetContext';

interface GuideLineType {
  position: number;
  orientation: 'horizontal' | 'vertical';
  length: number;
  start: number;
}

export const useAlignmentGuides = (
  widgets: Widget[],
  containerRef: React.RefObject<HTMLElement>,
  snapThreshold = 14
) => {
  const [guideLines, setGuideLines] = useState<GuideLineType[]>([]);
  
  // Calculate guide lines for a widget being dragged
  const calculateGuides = useCallback((
    currentWidgetId: string,
    currentRect: DOMRect,
    isResizing = false
  ) => {
    if (!containerRef.current) return [];
    
    const guides: GuideLineType[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Container boundaries
    const containerLeft = 0;
    const containerTop = 0;
    const containerRight = containerRect.width;
    const containerBottom = containerRect.height;
    
    // The current widget's edges
    const currentLeft = currentRect.left - containerRect.left;
    const currentRight = currentLeft + currentRect.width;
    const currentTop = currentRect.top - containerRect.top;
    const currentBottom = currentTop + currentRect.height;
    const currentCenterX = currentLeft + currentRect.width / 2;
    const currentCenterY = currentTop + currentRect.height / 2;
    
    // Add container boundary guides
    // Left edge
    if (Math.abs(currentLeft - containerLeft) <= snapThreshold) {
      guides.push({
        position: containerLeft,
        orientation: 'vertical',
        length: containerBottom,
        start: 0
      });
    }
    
    // Right edge
    if (Math.abs(currentRight - containerRight) <= snapThreshold) {
      guides.push({
        position: containerRight,
        orientation: 'vertical',
        length: containerBottom,
        start: 0
      });
    }
    
    // Top edge
    if (Math.abs(currentTop - containerTop) <= snapThreshold) {
      guides.push({
        position: containerTop,
        orientation: 'horizontal',
        length: containerRight,
        start: 0
      });
    }
    
    // Bottom edge
    if (Math.abs(currentBottom - containerBottom) <= snapThreshold) {
      guides.push({
        position: containerBottom,
        orientation: 'horizontal',
        length: containerRight,
        start: 0
      });
    }
    
    // For each other widget, check if any edges align
    widgets.forEach(widget => {
      if (widget.id === currentWidgetId) return;
      
      // Get the DOM element for this widget
      const widgetElement = document.getElementById(`widget-${widget.id}`);
      if (!widgetElement) return;
      
      const widgetRect = widgetElement.getBoundingClientRect();
      
      // Convert to container coordinates
      const widgetLeft = widget.position.x;
      const widgetRight = widget.position.x + widget.size.width;
      const widgetTop = widget.position.y;
      const widgetBottom = widget.position.y + widget.size.height;
      const widgetCenterX = widgetLeft + widget.size.width / 2;
      const widgetCenterY = widgetTop + widget.size.height / 2;
      
      // Check for alignment with other widget edges
      
      // Vertical alignments (left, center, right)
      // Left edge to left edge
      if (Math.abs(currentLeft - widgetLeft) <= snapThreshold) {
        guides.push({
          position: widgetLeft,
          orientation: 'vertical',
          length: Math.max(widgetBottom, currentBottom) - Math.min(widgetTop, currentTop),
          start: Math.min(widgetTop, currentTop)
        });
      }
      
      // Right edge to right edge
      if (Math.abs(currentRight - widgetRight) <= snapThreshold) {
        guides.push({
          position: widgetRight,
          orientation: 'vertical',
          length: Math.max(widgetBottom, currentBottom) - Math.min(widgetTop, currentTop),
          start: Math.min(widgetTop, currentTop)
        });
      }
      
      // Left edge to right edge
      if (Math.abs(currentLeft - widgetRight) <= snapThreshold) {
        guides.push({
          position: widgetRight,
          orientation: 'vertical',
          length: Math.max(widgetBottom, currentBottom) - Math.min(widgetTop, currentTop),
          start: Math.min(widgetTop, currentTop)
        });
      }
      
      // Right edge to left edge
      if (Math.abs(currentRight - widgetLeft) <= snapThreshold) {
        guides.push({
          position: widgetLeft,
          orientation: 'vertical',
          length: Math.max(widgetBottom, currentBottom) - Math.min(widgetTop, currentTop),
          start: Math.min(widgetTop, currentTop)
        });
      }
      
      // Center alignment
      if (Math.abs(currentCenterX - widgetCenterX) <= snapThreshold) {
        const centerPosition = widgetCenterX;
        guides.push({
          position: centerPosition,
          orientation: 'vertical',
          length: Math.max(widgetBottom, currentBottom) - Math.min(widgetTop, currentTop),
          start: Math.min(widgetTop, currentTop)
        });
      }
      
      // Horizontal alignments (top, middle, bottom)
      // Top edge to top edge
      if (Math.abs(currentTop - widgetTop) <= snapThreshold) {
        guides.push({
          position: widgetTop,
          orientation: 'horizontal',
          length: Math.max(widgetRight, currentRight) - Math.min(widgetLeft, currentLeft),
          start: Math.min(widgetLeft, currentLeft)
        });
      }
      
      // Bottom edge to bottom edge
      if (Math.abs(currentBottom - widgetBottom) <= snapThreshold) {
        guides.push({
          position: widgetBottom,
          orientation: 'horizontal',
          length: Math.max(widgetRight, currentRight) - Math.min(widgetLeft, currentLeft),
          start: Math.min(widgetLeft, currentLeft)
        });
      }
      
      // Top edge to bottom edge
      if (Math.abs(currentTop - widgetBottom) <= snapThreshold) {
        guides.push({
          position: widgetBottom,
          orientation: 'horizontal',
          length: Math.max(widgetRight, currentRight) - Math.min(widgetLeft, currentLeft),
          start: Math.min(widgetLeft, currentLeft)
        });
      }
      
      // Bottom edge to top edge
      if (Math.abs(currentBottom - widgetTop) <= snapThreshold) {
        guides.push({
          position: widgetTop,
          orientation: 'horizontal',
          length: Math.max(widgetRight, currentRight) - Math.min(widgetLeft, currentLeft),
          start: Math.min(widgetLeft, currentLeft)
        });
      }
      
      // Center alignment
      if (Math.abs(currentCenterY - widgetCenterY) <= snapThreshold) {
        const centerPosition = widgetCenterY;
        guides.push({
          position: centerPosition,
          orientation: 'horizontal',
          length: Math.max(widgetRight, currentRight) - Math.min(widgetLeft, currentLeft),
          start: Math.min(widgetLeft, currentLeft)
        });
      }
    });
    
    setGuideLines(guides);
    return guides;
  }, [widgets, containerRef, snapThreshold]);
  
  // Find the nearest guide for snapping
  const findNearestGuide = useCallback((
    position: number,
    guides: GuideLineType[],
    orientation: 'horizontal' | 'vertical'
  ) => {
    const relevantGuides = guides.filter(g => g.orientation === orientation);
    if (relevantGuides.length === 0) return null;
    
    let nearestGuide = null;
    let minDistance = snapThreshold + 1;
    
    relevantGuides.forEach(guide => {
      const distance = Math.abs(position - guide.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestGuide = guide;
      }
    });
    
    return nearestGuide;
  }, [snapThreshold]);
  
  // Clear guides
  const clearGuides = useCallback(() => {
    setGuideLines([]);
  }, []);
  
  return {
    guideLines,
    calculateGuides,
    findNearestGuide,
    clearGuides
  };
};

export type GuideLineType = {
  position: number;
  orientation: 'horizontal' | 'vertical';
  length: number;
  start: number;
};
