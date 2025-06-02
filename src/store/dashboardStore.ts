import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import {
  Dashboard,
  DashboardStoreState,
  DashboardStoreStateSchema,
  CreateDashboardData,
  CreateWidgetData,
  UpdateDashboardData,
  UpdateWidgetData,
  Widget,
} from '@/types/dashboard';

// Вспомогательная функция для генерации uuid (v4, простая)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Функция для создания timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Функция для создания дефолтного dashboard'а
function createDefaultDashboard(): Dashboard {
  const now = getCurrentTimestamp();
  return {
    id: uuidv4(),
    title: 'Main Dashboard',
    description: 'Default trading dashboard',
    widgets: [
      {
        id: uuidv4(),
        type: 'portfolio',
        title: 'Инвестиционный счёт', // deprecated
        defaultTitle: 'Инвестиционный счёт',
        userTitle: undefined,
        position: { x: 20, y: 80, width: 800, height: 350, zIndex: 1 },
        config: {},
        isVisible: true,
        isMinimized: false,
      },
      {
        id: uuidv4(),
        type: 'orderForm',
        title: 'Заявка', // deprecated
        defaultTitle: 'Заявка',
        userTitle: undefined,
        position: { x: 840, y: 80, width: 350, height: 550, zIndex: 2 },
        config: {},
        isVisible: true,
        isMinimized: false,
      },
      {
        id: uuidv4(),
        type: 'chart',
        title: 'Деньги не спят: график', // deprecated
        defaultTitle: 'Деньги не спят: график',
        userTitle: undefined,
        position: { x: 20, y: 450, width: 650, height: 330, zIndex: 3 },
        config: {},
        isVisible: true,
        isMinimized: false,
      },
      {
        id: uuidv4(),
        type: 'transactionHistory',
        title: 'Деньги не спят: История операций', // deprecated
        defaultTitle: 'Деньги не спят: История операций',
        userTitle: undefined,
        position: { x: 690, y: 450, width: 400, height: 330, zIndex: 4 },
        config: {},
        isVisible: true,
        isMinimized: false,
      },
    ],
    layout: {
      gridSize: { width: 1920, height: 1080 },
      snapToGrid: true,
      gridStep: 10,
    },
    createdAt: now,
    updatedAt: now,
    isDefault: true,
  };
}

interface DashboardStore extends DashboardStoreState {
  // Dashboard operations
  addDashboard: (data: CreateDashboardData) => string;
  removeDashboard: (dashboardId: string) => void;
  updateDashboard: (dashboardId: string, data: UpdateDashboardData) => void;
  setActiveDashboard: (dashboardId: string) => void;
  duplicateDashboard: (dashboardId: string) => string;
  
  // Widget operations
  addWidget: (dashboardId: string, widget: CreateWidgetData) => string;
  removeWidget: (dashboardId: string, widgetId: string) => void;
  updateWidget: (dashboardId: string, widgetId: string, data: UpdateWidgetData) => void;
  moveWidget: (dashboardId: string, widgetId: string, x: number, y: number) => void;
  resizeWidget: (dashboardId: string, widgetId: string, width: number, height: number) => void;
  bringWidgetToFront: (dashboardId: string, widgetId: string) => void;
  toggleWidgetVisibility: (dashboardId: string, widgetId: string) => void;
  toggleWidgetMinimized: (dashboardId: string, widgetId: string) => void;
  updateWidgetTitle: (dashboardId: string, widgetId: string, userTitle: string) => void;
  
  // Utility methods
  getActiveDashboard: () => Dashboard | undefined;
  getDashboardById: (dashboardId: string) => Dashboard | undefined;
  getWidgetById: (dashboardId: string, widgetId: string) => Widget | undefined;
  initializeWithDefault: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    immer((set, get) => ({
      dashboards: [],
      activeDashboardId: undefined,

      addDashboard: (data) => {
        const id = uuidv4();
        const now = getCurrentTimestamp();
        
        set((state) => {
          const dashboard: Dashboard = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now,
          };
          state.dashboards.push(dashboard);
          state.activeDashboardId = id;
        });
        
        return id;
      },

      removeDashboard: (dashboardId) => {
        set((state) => {
          const index = state.dashboards.findIndex(d => d.id === dashboardId);
          if (index === -1) return;
          
          state.dashboards.splice(index, 1);
          
          // Если удаляем активный dashboard, выбираем другой
          if (state.activeDashboardId === dashboardId) {
            state.activeDashboardId = state.dashboards[0]?.id;
          }
        });
      },

      updateDashboard: (dashboardId, data) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          Object.assign(dashboard, data, { updatedAt: getCurrentTimestamp() });
        });
      },

      setActiveDashboard: (dashboardId) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (dashboard) {
            console.log('DashboardStore: Setting active dashboard', {
              from: state.activeDashboardId,
              to: dashboardId,
              title: dashboard.title,
              widgetsCount: dashboard.widgets.length
            });
            state.activeDashboardId = dashboardId;
          } else {
            console.warn('DashboardStore: Dashboard not found', dashboardId);
          }
        });
      },

      duplicateDashboard: (dashboardId) => {
        const newId = uuidv4();
        const now = getCurrentTimestamp();
        
        set((state) => {
          const originalDashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!originalDashboard) return;
          
          const duplicatedDashboard: Dashboard = {
            ...originalDashboard,
            id: newId,
            title: `${originalDashboard.title} (Copy)`,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
            widgets: originalDashboard.widgets.map(widget => ({
              ...widget,
              id: uuidv4(),
            })),
          };
          
          state.dashboards.push(duplicatedDashboard);
          state.activeDashboardId = newId;
        });
        
        return newId;
      },

      addWidget: (dashboardId, widgetData) => {
        const widgetId = uuidv4();
        
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          // Ensure new widget has proper z-index (higher than all existing widgets)
          let zIndex = widgetData.position.zIndex;
          if (!zIndex || zIndex <= 0) {
            const maxZIndex = dashboard.widgets.length > 0 
              ? Math.max(...dashboard.widgets.map(w => w.position.zIndex || 1))
              : 1;
            zIndex = maxZIndex + 1;
          }
          
          const widget: Widget = {
            ...widgetData,
            id: widgetId,
            position: {
              ...widgetData.position,
              zIndex
            }
          };
          
          dashboard.widgets.push(widget);
          dashboard.updatedAt = getCurrentTimestamp();
        });
        
        return widgetId;
      },

      removeWidget: (dashboardId, widgetId) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const index = dashboard.widgets.findIndex(w => w.id === widgetId);
          if (index !== -1) {
            dashboard.widgets.splice(index, 1);
            dashboard.updatedAt = getCurrentTimestamp();
          }
        });
      },

      updateWidget: (dashboardId, widgetId, data) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          Object.assign(widget, data);
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      moveWidget: (dashboardId, widgetId, x, y) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          widget.position.x = x;
          widget.position.y = y;
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      resizeWidget: (dashboardId, widgetId, width, height) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          widget.position.width = width;
          widget.position.height = height;
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      bringWidgetToFront: (dashboardId, widgetId) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          // Найти максимальный z-index среди всех виджетов
          const maxZIndex = Math.max(...dashboard.widgets.map(w => w.position.zIndex || 1));
          
          // Установить z-index текущего виджета выше максимального
          widget.position.zIndex = maxZIndex + 1;
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      toggleWidgetVisibility: (dashboardId, widgetId) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          widget.isVisible = !widget.isVisible;
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      toggleWidgetMinimized: (dashboardId, widgetId) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          widget.isMinimized = !widget.isMinimized;
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      updateWidgetTitle: (dashboardId, widgetId, userTitle) => {
        set((state) => {
          const dashboard = state.dashboards.find(d => d.id === dashboardId);
          if (!dashboard) return;
          
          const widget = dashboard.widgets.find(w => w.id === widgetId);
          if (!widget) return;
          
          // Если пустая строка, очищаем userTitle, иначе устанавливаем
          widget.userTitle = userTitle.trim() === '' ? undefined : userTitle.trim();
          dashboard.updatedAt = getCurrentTimestamp();
        });
      },

      // Utility methods
      getActiveDashboard: () => {
        const state = get();
        return state.dashboards.find(d => d.id === state.activeDashboardId);
      },

      getDashboardById: (dashboardId) => {
        const state = get();
        return state.dashboards.find(d => d.id === dashboardId);
      },

      getWidgetById: (dashboardId, widgetId) => {
        const state = get();
        const dashboard = state.dashboards.find(d => d.id === dashboardId);
        return dashboard?.widgets.find(w => w.id === widgetId);
      },

      initializeWithDefault: () => {
        set((state) => {
          if (state.dashboards.length === 0) {
            const defaultDashboard = createDefaultDashboard();
            console.log('DashboardStore: Creating default dashboard', {
              id: defaultDashboard.id,
              title: defaultDashboard.title,
              widgetsCount: defaultDashboard.widgets.length
            });
            state.dashboards.push(defaultDashboard);
            state.activeDashboardId = defaultDashboard.id;
          }
        });
      },
    })),
    {
      name: 'dashboard-store',
      partialize: (state) => ({ 
        dashboards: state.dashboards, 
        activeDashboardId: state.activeDashboardId 
      }),
      // Валидация через zod при загрузке
      merge: (persisted, current) => {
        try {
          const parsed = DashboardStoreStateSchema.parse(persisted);
          return { ...current, ...parsed };
        } catch {
          return current;
        }
      },
      // После загрузки из localStorage инициализируем дефолтный dashboard если нужно
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeWithDefault();
        }
      },
    }
  )
); 