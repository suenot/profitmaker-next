import { z } from 'zod';

// Доступные цвета групп
export const GroupColors = [
  '#00BCD4', // cyan
  '#F44336', // red  
  '#9C27B0', // purple
  '#2196F3', // blue
  '#4CAF50', // green
  '#FFC107', // yellow
  '#FF9800', // orange
  '#E91E63', // pink
] as const;

export type GroupColor = typeof GroupColors[number];

// Схема группы
export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.enum(GroupColors),
  tradingPair: z.string().optional(), // торговая пара для отображения вместо цвета
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Group = z.infer<typeof GroupSchema>;

// Типы для создания и обновления групп
export type CreateGroupData = Omit<Group, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGroupData = Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>;

// Схема состояния groupStore
export const GroupStoreStateSchema = z.object({
  groups: z.array(GroupSchema),
  selectedGroupId: z.string().optional(),
});

export type GroupStoreState = z.infer<typeof GroupStoreStateSchema>; 