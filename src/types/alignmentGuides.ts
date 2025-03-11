
import { Widget } from '@/context/WidgetContext';

export interface GuideLineType {
  position: number;
  orientation: 'horizontal' | 'vertical';
  length: number;
  start: number;
}

export interface CalculateGuidesOptions {
  widgets: Widget[];
  containerRef: React.RefObject<HTMLElement>;
  snapThreshold: number;
  containerRect: DOMRect;
  currentWidgetId: string;
  currentRect: DOMRect;
}
