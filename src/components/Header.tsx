
import React from 'react';
import { Menu, Plus, ChevronDown, Wallet } from 'lucide-react';
import { useWidget } from '@/context/WidgetContext';
import { WidgetType } from '@/context/WidgetContext';

const Header: React.FC = () => {
  const { addWidget } = useWidget();
  
  const [accountBalance, setAccountBalance] = React.useState('$25,684.92');
  const [accountDelta, setAccountDelta] = React.useState({ value: '-$124.35', percentage: '-0.48%', isNegative: true });
  
  return (
    <header className="h-14 bg-terminal-widget border-b border-terminal-border flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80">
      <div className="flex items-center">
        <button className="p-2 rounded-md hover:bg-terminal-accent mr-2 transition-colors">
          <Menu size={18} />
        </button>
        
        <div className="flex items-center mr-8">
          <span className="font-medium text-sm">Trading Terminal</span>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <button className="text-sm text-terminal-text hover:text-white transition-colors">Dashboard</button>
          <button className="text-sm text-terminal-muted hover:text-white transition-colors">Trading</button>
          <button className="text-sm text-terminal-muted hover:text-white transition-colors">Portfolio</button>
          <button className="text-sm text-terminal-muted hover:text-white transition-colors">Markets</button>
          <button className="text-sm text-terminal-muted hover:text-white transition-colors">Orders</button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center px-4 py-1.5 rounded-md bg-terminal-accent/30">
          <Wallet size={16} className="mr-2 text-terminal-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{accountBalance}</span>
            <span className={`text-xs ${accountDelta.isNegative ? 'text-terminal-negative' : 'text-terminal-positive'}`}>
              {accountDelta.value} ({accountDelta.percentage})
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center px-3 py-1.5 rounded-md bg-terminal-accent hover:bg-terminal-accent/80 transition-colors"
            onClick={() => addWidget('chart' as WidgetType)}
          >
            <Plus size={16} className="mr-1" />
            <span className="text-sm">Add Widget</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
