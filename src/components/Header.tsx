import React, { useState } from 'react';
import { ChevronDown, Wallet, Bell, User, Sun, Moon, Menu, Plus, LayoutGrid } from 'lucide-react';
import { useWidget } from '@/context/WidgetContext';
import { useTheme } from '@/hooks/useTheme';
import { WidgetType } from '@/context/WidgetContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ThemeSettings from '@/components/ThemeSettings';
import UserDrawer from './UserDrawer';

const Header: React.FC = () => {
  const { addWidget } = useWidget();
  const { theme, toggleTheme } = useTheme();
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  
  const [accountBalance, setAccountBalance] = React.useState('2 059,62 ₽');
  const [accountDelta, setAccountDelta] = React.useState({ value: '-1,24 ₽', percentage: '(0,06%)', isNegative: true });
  
  const handleThemeClick = (e: React.MouseEvent) => {
    if (e.altKey) {
      // Option+Click opens theme settings
      setIsThemeSheetOpen(true);
    } else {
      // Regular click toggles theme
      toggleTheme();
    }
  };
  
  return (
    <>
      <header className="h-14 bg-terminal-widget border-b border-terminal-border flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80 mb-0">
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
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors">
            <Bell size={18} className="text-terminal-muted" />
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors"
            onClick={handleThemeClick}
            title="Клик - переключить тему, Option+клик - настройки тем"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-terminal-muted" />
            ) : (
              <Moon size={18} className="text-terminal-muted" />
            )}
          </button>
          
          <button className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors" onClick={() => setIsUserDrawerOpen(true)}>
            <User size={18} className="text-terminal-muted" />
          </button>
        </div>
      </header>

      <Sheet open={isThemeSheetOpen} onOpenChange={setIsThemeSheetOpen}>
        <SheetContent side="right" className="w-[400px] bg-terminal-widget border-terminal-border">
          <SheetHeader>
            <SheetTitle className="text-terminal-text">Настройки темы</SheetTitle>
          </SheetHeader>
          <ThemeSettings />
        </SheetContent>
      </Sheet>

      <UserDrawer open={isUserDrawerOpen} onOpenChange={setIsUserDrawerOpen} />
    </>
  );
};

export default Header;
