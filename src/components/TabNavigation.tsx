import React, { useState } from 'react';
import { Plus, Bell, Sun, Moon, User, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useUserStore } from '@/store/userStore';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import UserDrawer from './UserDrawer';

const TabNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  const tabs = [
    { id: 'tab-1', icon: <User size={14} />, label: 'Васи (И)', closable: true },
    { id: 'tab-2', label: 'Вкладка', closable: false },
    { id: 'tab-3', label: 'Сделки инсайдеров', closable: false },
    { id: 'tab-4', label: 'Вкладка', closable: false },
    { id: 'tab-5', label: 'Вкладка', closable: false },
    { id: 'tab-6', label: 'Вкладка', closable: false },
    { id: 'tab-7', label: 'Подбор акций', closable: false },
    { id: 'tab-8', label: 'Вкладка', closable: false },
  ];

  // Получаем активного пользователя
  const activeUserId = useUserStore(s => s.activeUserId);
  const users = useUserStore(s => s.users);
  const activeUser = users.find(u => u.id === activeUserId);

  const handleThemeClick = (e: React.MouseEvent) => {
    if (e.altKey) {
      setIsThemeSheetOpen(true);
    } else {
      toggleTheme();
    }
  };

  return (
    <div className="flex flex-col h-auto bg-terminal-bg border-b border-terminal-border mb-0 pb-0">
      <div className="flex items-center justify-between h-12 px-2">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`flex items-center px-4 h-full cursor-pointer border-r border-terminal-border whitespace-nowrap ${
                activeTab === index ? 'bg-terminal-accent/20 text-terminal-text' : 'text-terminal-muted hover:bg-terminal-accent/10'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              <span className="text-sm">{tab.label}</span>
              {tab.closable && (
                <button className="ml-2 p-0.5 rounded-full hover:bg-terminal-accent/50">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button className="flex items-center justify-center w-10 h-full text-terminal-muted hover:bg-terminal-accent/20">
            <Plus size={18} />
          </button>
        </div>
        {/* Блок с тремя иконками */}
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors">
            <Bell size={18} className="text-terminal-muted" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors"
            onClick={handleThemeClick}
            title="Click - toggle theme, Option+Click - theme settings"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-terminal-muted" />
            ) : (
              <Moon size={18} className="text-terminal-muted" />
            )}
          </button>
          <button className="p-2 rounded-full hover:bg-terminal-accent/50 transition-colors" onClick={() => setIsUserDrawerOpen(true)}>
            {activeUser ? (
              <Avatar className="w-7 h-7">
                {activeUser.avatarUrl ? (
                  <AvatarImage src={activeUser.avatarUrl} alt={activeUser.email} />
                ) : (
                  <AvatarFallback>{activeUser.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
            ) : (
              <User size={18} className="text-terminal-muted" />
            )}
          </button>
        </div>
      </div>
      <UserDrawer open={isUserDrawerOpen} onOpenChange={setIsUserDrawerOpen} />
    </div>
  );
};

export default TabNavigation;
