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
  
  // State for renaming dashboards
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Dashboard store
  const dashboards = useDashboardStore(s => s.dashboards);
  const activeDashboardId = useDashboardStore(s => s.activeDashboardId);
  const setActiveDashboard = useDashboardStore(s => s.setActiveDashboard);
  const addDashboard = useDashboardStore(s => s.addDashboard);
  const removeDashboard = useDashboardStore(s => s.removeDashboard);
  const updateDashboard = useDashboardStore(s => s.updateDashboard);
  const initializeWithDefault = useDashboardStore(s => s.initializeWithDefault);

  // Initialize default dashboard on first launch
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

  // Get active user
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

  // Handlers for dashboard tabs
  const handleAddDashboard = () => {
    const newId = addDashboard({
      title: 'Dashboard',
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

  // Handlers for renaming dashboards
  const handleDashboardDoubleClick = (dashboard: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDashboardId(dashboard.id);
    setEditingTitle(dashboard.title);
  };

  const handleTitleSave = () => {
    if (editingDashboardId && editingTitle.trim()) {
      updateDashboard(editingDashboardId, { title: editingTitle.trim() });
    }
    setEditingDashboardId(null);
    setEditingTitle('');
  };

  const handleTitleCancel = () => {
    setEditingDashboardId(null);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
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
                if (editingDashboardId !== dashboard.id) {
                  console.log('TabNavigation: Switching to dashboard', dashboard.id, dashboard.title);
                  setActiveDashboard(dashboard.id);
                }
              }}
            >
              {editingDashboardId === dashboard.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="text-sm bg-transparent border-none outline-none w-full min-w-[80px] max-w-[200px]"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="text-sm select-none"
                  onDoubleClick={(e) => handleDashboardDoubleClick(dashboard, e)}
                >
                  {dashboard.title}
                </span>
              )}
              {dashboards.length > 1 && editingDashboardId !== dashboard.id && (
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
        {/* Block with three icons */}
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
