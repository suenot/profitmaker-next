
import React from 'react';
import { ChevronDown, Wallet, Bell, User, Sun, Moon, Menu, Plus, LayoutGrid } from 'lucide-react';
import { useWidget } from '@/context/WidgetContext';
import { WidgetType } from '@/context/WidgetContext';

const Header: React.FC = () => {
  const { addWidget } = useWidget();
  
  const [accountBalance, setAccountBalance] = React.useState('2 059,62 ₽');
  const [accountDelta, setAccountDelta] = React.useState({ value: '-1,24 ₽', percentage: '(0,06%)', isNegative: true });
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  
  return (
    <header className="h-14 bg-terminal-widget border-b border-terminal-border flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80">
      <div className="flex items-center">
        <button className="flex items-center p-2 rounded-md hover:bg-terminal-accent mr-2 transition-colors">
          <span className="font-medium text-sm mr-2">Брокерский счёт</span>
          <ChevronDown size={16} />
        </button>
        
        <div className="flex items-center space-x-4 text-sm">
          <span className="font-medium">{accountBalance}</span>
          
          <span className="text-terminal-negative">
            Сегодня {accountDelta.value} {accountDelta.percentage}
          </span>
          
          <span className="text-terminal-muted">
            Непокрыто 0,00 ₽
          </span>
          
          <button className="px-3 py-1 rounded-md bg-terminal-accent/40 text-terminal-text hover:bg-terminal-accent/60 transition-colors">
            Пополнить
          </button>
          
          <span className="px-3 py-1 rounded-md bg-blue-600/30 text-blue-400 ml-2">
            WAVES
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors">
          <Bell size={18} className="text-terminal-muted" />
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? (
            <Sun size={18} className="text-terminal-muted" />
          ) : (
            <Moon size={18} className="text-terminal-muted" />
          )}
        </button>
        
        <button className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors">
          <User size={18} className="text-terminal-muted" />
        </button>
      </div>
    </header>
  );
};

export default Header;
