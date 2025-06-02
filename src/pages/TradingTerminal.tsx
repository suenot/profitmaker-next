import React, { useState, useCallback, useRef, useEffect } from 'react';
import Widget from '@/components/WidgetSimple';
import WidgetMenu from '@/components/WidgetMenu';
import TabNavigation from '@/components/TabNavigation';
import { useDashboardStore } from '@/store/dashboardStore';
import ChartWidget from '@/components/widgets/Chart';
import PortfolioWidget from '@/components/widgets/Portfolio';
import OrderFormWidget from '@/components/widgets/OrderForm';
import TransactionHistoryWidget from '@/components/widgets/TransactionHistory';
import { OrderBookWidget } from '@/components/widgets/OrderBookWidget';
import { OrderBookWidgetV2 } from '@/components/widgets/OrderBookWidgetV2';
import { TradesWidget } from '@/components/widgets/TradesWidget';
import { TradesWidgetV2 } from '@/components/widgets/TradesWidgetV2';
import { DataProviderSettingsWidget } from '@/components/widgets/DataProviderSettingsWidget';
import { DataProviderDemoWidget } from '@/components/widgets/DataProviderDemoWidget';
import { DataProviderSetupWidget } from '@/components/widgets/DataProviderSetupWidget';
import { DataProviderDebugWidget } from '@/components/widgets/DataProviderDebugWidget';
import AlignmentGuides from '@/components/AlignmentGuides';
import { GuideLineType } from '@/types/alignmentGuides';

const widgetComponents: Record<string, React.FC<any>> = {
  chart: ChartWidget,
  portfolio: PortfolioWidget,
  orderForm: OrderFormWidget,
  transactionHistory: TransactionHistoryWidget,
  custom: PortfolioWidget, // Placeholder
  orderbook: OrderBookWidget,
  orderbookV2: OrderBookWidgetV2,
  trades: TradesWidget,
  tradesV2: TradesWidgetV2,
  dataProviderSettings: DataProviderSettingsWidget,
  dataProviderDemo: DataProviderDemoWidget,
  dataProviderSetup: DataProviderSetupWidget,
  dataProviderDebug: DataProviderDebugWidget,
};

const TradingTerminal: React.FC = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Subscribe to dashboard store changes
  const activeDashboardId = useDashboardStore(s => s.activeDashboardId);
  const dashboards = useDashboardStore(s => s.dashboards);
  const removeWidget = useDashboardStore(s => s.removeWidget);
  
  // Get current active dashboard
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
  const widgets = activeDashboard?.widgets || [];
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [guideLines, setGuideLines] = useState<GuideLineType[]>([]);
  
  // Simple alignment guides without complex type dependencies
  const [calculateGuides, clearGuides] = [
    () => ([]), // Placeholder for calculateGuides
    () => {} // Placeholder for clearGuides
  ];
  
  const handleWidgetMove = useCallback((widgetId: string, rect: DOMRect) => {
    setActiveWidgetId(widgetId);
    // Placeholder for guides calculation
    setGuideLines([]);
    return { x: null, y: null };
  }, []);
  
  const handleWidgetResize = useCallback((widgetId: string, rect: DOMRect) => {
    setActiveWidgetId(widgetId);
    // Placeholder for guides calculation
    setGuideLines([]);
    return { x: null, y: null };
  }, []);
  
  const handleWidgetDragEnd = useCallback(() => {
    setActiveWidgetId(null);
    setGuideLines([]);
  }, []);
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Debug logging for dashboard changes
  React.useEffect(() => {
    console.log('TradingTerminal: Dashboard changed', {
      activeDashboardId,
      activeDashboard: activeDashboard?.title,
      widgetsCount: widgets.length,
      widgets: widgets.map(w => ({ id: w.id, title: w.title, position: w.position }))
    });
  }, [activeDashboardId, activeDashboard, widgets]);
  
  return (
    <div 
      className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col"
      onContextMenu={handleContextMenu}
      onClick={() => contextMenuPosition && setContextMenuPosition(null)}
    >
      <TabNavigation />
      
      <main 
        ref={mainContainerRef}
        className="flex-1 p-0 h-[calc(100vh-86px)] relative"
        style={{ marginTop: 0 }}
      >
        <AlignmentGuides guideLines={guideLines} />
        
        {widgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.type];
          
          return (
            <Widget
              key={widget.id}
              id={widget.id}
              title={widget.title} // deprecated
              defaultTitle={widget.defaultTitle}
              userTitle={widget.userTitle}
              position={{ x: widget.position.x, y: widget.position.y }}
              size={{ width: widget.position.width, height: widget.position.height }}
              zIndex={widget.position.zIndex || 1}
              isActive={true} // Dashboard widgets are always "active" in their context
              groupId={widget.groupId}
              widgetType={widget.type}
              onRemove={() => activeDashboard && removeWidget(activeDashboard.id, widget.id)}
            >
              <WidgetComponent />
            </Widget>
          );
        })}
      </main>
      
      {contextMenuPosition && (
        <WidgetMenu 
          position={contextMenuPosition} 
          onClose={() => setContextMenuPosition(null)} 
        />
      )}
      
      <div className="fixed bottom-2 right-2 flex items-center text-terminal-muted text-xs bg-terminal-accent/30 px-3 py-1 rounded-md">
        <span className="mr-2">{currentTime.toLocaleTimeString('ru-RU', { hour12: false })}</span>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal; 