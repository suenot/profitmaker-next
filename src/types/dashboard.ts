import { z } from 'zod';

// Схема позиции и размера виджета
export const WidgetPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number().optional().default(1),
});
export type WidgetPosition = z.infer<typeof WidgetPositionSchema>;

// Схема конфигурации виджета
export const WidgetConfigSchema = z.record(z.any()).optional();
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

// Схема виджета
export const WidgetSchema = z.object({
  id: z.string(), // uuid
  type: z.enum(['chart', 'portfolio', 'orderForm', 'transactionHistory', 'custom']),
  title: z.string(),
  position: WidgetPositionSchema,
  config: WidgetConfigSchema,
  isVisible: z.boolean().default(true),
  isMinimized: z.boolean().default(false),
});
export type Widget = z.infer<typeof WidgetSchema>;

// Схема layout dashboard'а
export const DashboardLayoutSchema = z.object({
  gridSize: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
  }),
  snapToGrid: z.boolean().default(true),
  gridStep: z.number().default(10),
});
export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

// Схема dashboard'а
export const DashboardSchema = z.object({
  id: z.string(), // uuid
  title: z.string(),
  description: z.string().optional(),
  widgets: z.array(WidgetSchema),
  layout: DashboardLayoutSchema,
  createdAt: z.string(), // ISO date
  updatedAt: z.string(), // ISO date
  isDefault: z.boolean().default(false),
});
export type Dashboard = z.infer<typeof DashboardSchema>;

// Схема состояния dashboardStore
export const DashboardStoreStateSchema = z.object({
  dashboards: z.array(DashboardSchema),
  activeDashboardId: z.string().optional(),
});
export type DashboardStoreState = z.infer<typeof DashboardStoreStateSchema>;

// Типы для создания новых сущностей (без id и dates)
export type CreateDashboardData = Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateWidgetData = Omit<Widget, 'id'>;
export type UpdateDashboardData = Partial<Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateWidgetData = Partial<Omit<Widget, 'id'>>; 