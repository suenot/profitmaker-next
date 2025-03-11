
import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Widget from '@/components/Widget';
import WidgetMenu from '@/components/WidgetMenu';
import TabNavigation from '@/components/TabNavigation';
import { WidgetProvider, useWidget } from '@/context/WidgetContext';
import ChartWidget from '@/components/widgets/Chart';
import PortfolioWidget from '@/components/widgets/Portfolio';
import OrderFormWidget from '@/components/widgets/OrderForm';
import TransactionHistoryWidget from '@/components/widgets/TransactionHistory';

// Widget content mapping
const widgetComponents: Record<string, React.FC<any>> = {
  chart: ChartWidget,
  portfolio: PortfolioWidget,
  orderForm: OrderFormWidget,
  transactions: TransactionHistoryWidget,
  watchlist: PortfolioWidget, // Placeholder
  news: TransactionHistoryWidget, // Placeholder
  calendar: ChartWidget, // Placeholder
  positions: OrderFormWidget // Placeholder
};

const TradingTerminal: React.FC = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const { widgets, removeWidget } = useWidget();
  
  // Handle right-click to open widget menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, []);
  
  return (
    <div 
      className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col"
      onContextMenu={handleContextMenu}
      onClick={() => contextMenuPosition && setContextMenuPosition(null)}
    >
      <Header />
      <TabNavigation />
      
      <main className="flex-1 pt-2 px-2 h-[calc(100vh-104px)]">
        {widgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.type];
          
          return (
            <Widget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              position={widget.position}
              size={widget.size}
              zIndex={widget.zIndex}
              isActive={widget.isActive}
              onRemove={() => removeWidget(widget.id)}
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
        <span className="mr-2">22:54:42</span>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span>Онлайн</span>
        </div>
      </div>
    </div>
  );
};

const Index = () => (
  <WidgetProvider>
    <TradingTerminal />
  </WidgetProvider>
);

export default Index;
