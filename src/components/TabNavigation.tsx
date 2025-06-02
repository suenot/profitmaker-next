import React, { useState, useEffect } from 'react';
import { Plus, Bell, Sun, Moon, User, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useUserStore } from '@/store/userStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import UserDrawer from './UserDrawer';

const TabNavigation: React.FC = () => {
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  // Dashboard store
  const dashboards = useDashboardStore(s => s.dashboards);
  const activeDashboardId = useDashboardStore(s => s.activeDashboardId);
  const setActiveDashboard = useDashboardStore(s => s.setActiveDashboard);
  const addDashboard = useDashboardStore(s => s.addDashboard);
  const removeDashboard = useDashboardStore(s => s.removeDashboard);
  const initializeWithDefault = useDashboardStore(s => s.initializeWithDefault);

  // Инициализация дефолтного dashboard при первом запуске
  useEffect(() => {
    initializeWithDefault();
  }, [initializeWithDefault]);

  // Sync URL with active dashboard
  useEffect(() => {
    if (activeDashboardId) {
      window.location.hash = `#dashboard/${activeDashboardId}`;
    }
  }, [activeDashboardId]);

  // Listen to URL changes and update active dashboard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#dashboard\/(.+)$/);
      if (match && match[1] && match[1] !== activeDashboardId) {
        const dashboardId = match[1];
        const dashboard = dashboards.find(d => d.id === dashboardId);
        if (dashboard) {
          setActiveDashboard(dashboardId);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeDashboardId, dashboards, setActiveDashboard]);

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

  // Обработчики для dashboard tabs
  const handleAddDashboard = () => {
    const newId = addDashboard({
      title: `Dashboard ${dashboards.length + 1}`,
      description: 'New dashboard',
      widgets: [],
      layout: {
        gridSize: { width: 1920, height: 1080 },
        snapToGrid: true,
        gridStep: 10,
      },
      isDefault: false,
    });
    console.log('TabNavigation: Created new dashboard', newId);
  };

  const handleRemoveDashboard = (dashboardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dashboards.length > 1) {
      removeDashboard(dashboardId);
    }
  };

  return (
    <div className="flex flex-col h-auto bg-terminal-bg border-b border-terminal-border mb-0 pb-0">
      <div className="flex items-center justify-between h-12 px-2">
        <div className="flex overflow-x-auto hide-scrollbar">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`flex items-center px-4 h-full cursor-pointer border-r border-terminal-border whitespace-nowrap ${
                activeDashboardId === dashboard.id ? 'bg-terminal-accent/20 text-terminal-text' : 'text-terminal-muted hover:bg-terminal-accent/10'
              }`}
              onClick={() => {
                console.log('TabNavigation: Switching to dashboard', dashboard.id, dashboard.title);
                setActiveDashboard(dashboard.id);
              }}
            >
              <span className="text-sm">{dashboard.title}</span>
              {dashboards.length > 1 && (
                <button 
                  className="ml-2 p-0.5 rounded-full hover:bg-terminal-accent/50"
                  onClick={(e) => handleRemoveDashboard(dashboard.id, e)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button 
            className="flex items-center justify-center w-10 h-full text-terminal-muted hover:bg-terminal-accent/20"
            onClick={handleAddDashboard}
          >
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
