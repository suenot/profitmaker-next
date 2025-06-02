import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Group, CreateGroupData, UpdateGroupData, GroupStoreState, GroupColors, GroupColor } from '../types/groups';

interface GroupStoreActions {
  // Действия с группами
  createGroup: (data: CreateGroupData) => Group; // только для внутреннего использования
  updateGroup: (id: string, data: UpdateGroupData) => void;
  deleteGroup: (id: string) => void;
  
  // Выбор группы
  selectGroup: (groupId: string | undefined) => void;
  
  // Получение данных
  getGroupById: (id: string) => Group | undefined;
  setTradingPair: (groupId: string, tradingPair: string | undefined) => void;
  
  // Инициализация тестовых данных
  initializeDefaultGroups: () => void;
}

type GroupStore = GroupStoreState & GroupStoreActions;

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      groups: [],
      selectedGroupId: undefined,
      
      // Создание группы
      createGroup: (data: CreateGroupData) => {
        const newGroup: Group = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          groups: [...state.groups, newGroup]
        }));
        
        return newGroup;
      },
      
      // Обновление группы
      updateGroup: (id: string, data: UpdateGroupData) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === id
              ? { ...group, ...data, updatedAt: new Date().toISOString() }
              : group
          )
        }));
      },
      
      // Удаление группы
      deleteGroup: (id: string) => {
        set((state) => ({
          groups: state.groups.filter(group => group.id !== id),
          selectedGroupId: state.selectedGroupId === id ? undefined : state.selectedGroupId
        }));
      },
      
      // Выбор группы
      selectGroup: (groupId: string | undefined) => {
        set({ selectedGroupId: groupId });
      },
      
      // Получение группы по ID
      getGroupById: (id: string) => {
        return get().groups.find(group => group.id === id);
      },
      
      // Установка торговой пары для группы
      setTradingPair: (groupId: string, tradingPair: string | undefined) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId
              ? { ...group, tradingPair, updatedAt: new Date().toISOString() }
              : group
          )
        }));
      },
      
      // Инициализация тестовых данных
      initializeDefaultGroups: () => {
        const { groups } = get();
        if (groups.length === 0) {
          const defaultGroups: CreateGroupData[] = [
            { name: 'Cyan', color: '#00BCD4' },
            { name: 'Red', color: '#F44336' },
            { name: 'Purple', color: '#9C27B0' },
            { name: 'Blue', color: '#2196F3' },
            { name: 'Green', color: '#4CAF50' },
            { name: 'Yellow', color: '#FFC107' },
            { name: 'Orange', color: '#FF9800' },
            { name: 'Pink', color: '#E91E63' },
          ];
          
          defaultGroups.forEach(groupData => {
            get().createGroup(groupData);
          });
        }
      },
    }),
    {
      name: 'group-store',
      version: 1,
    }
  )
); 