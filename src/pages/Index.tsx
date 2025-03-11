
import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Widget from '@/components/Widget';
import WidgetMenu from '@/components/WidgetMenu';
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
      className="min-h-screen bg-terminal-bg text-terminal-text"
      onContextMenu={handleContextMenu}
      onClick={() => contextMenuPosition && setContextMenuPosition(null)}
    >
      <Header />
      
      <main className="pt-4 px-4 h-[calc(100vh-56px)]">
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
      
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-terminal-muted text-xs">
        <span>Right-click anywhere to add widgets</span>
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
