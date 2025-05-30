import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// Типы через zod
export const ExchangeAccountSchema = z.object({
  id: z.string(), // uuid
  exchange: z.string(), // например, 'binance', 'bybit'
  key: z.string(),
  privateKey: z.string(),
  avatarUrl: z.string().url().optional(),
});
export type ExchangeAccount = z.infer<typeof ExchangeAccountSchema>;

export const UserSchema = z.object({
  id: z.string(), // uuid
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  accounts: z.array(ExchangeAccountSchema),
});
export type User = z.infer<typeof UserSchema>;

export const UserStoreStateSchema = z.object({
  users: z.array(UserSchema),
  activeUserId: z.string().optional(),
});
export type UserStoreState = z.infer<typeof UserStoreStateSchema>;

// Вспомогательная функция для генерации uuid (v4, простая)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface UserStore extends UserStoreState {
  addUser: (name: string, avatarUrl?: string) => void;
  removeUser: (userId: string) => void;
  setActiveUser: (userId: string) => void;
  addAccount: (userId: string, account: Omit<ExchangeAccount, 'id'>) => void;
  removeAccount: (userId: string, accountId: string) => void;
  updateAccount: (userId: string, account: ExchangeAccount) => void;
  updateUser: (userId: string, data: Partial<Omit<User, 'id' | 'accounts'>>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    immer((set, get) => ({
      users: [],
      activeUserId: undefined,

      addUser: (name, avatarUrl) => {
        set((state) => {
          const id = uuidv4();
          const user: User = { id, name, avatarUrl, accounts: [] };
          state.users.push(user);
          state.activeUserId = id;
        });
      },

      removeUser: (userId) => {
        set((state) => {
          state.users = state.users.filter(u => u.id !== userId);
          if (state.activeUserId === userId) {
            state.activeUserId = state.users[0]?.id;
          }
        });
      },

      setActiveUser: (userId) => {
        set((state) => {
          if (state.users.some(u => u.id === userId)) {
            state.activeUserId = userId;
          }
        });
      },

      addAccount: (userId, account) => {
        set((state) => {
          const user = state.users.find(u => u.id === userId);
          if (user) {
            user.accounts.push({ ...account, id: uuidv4() });
          }
        });
      },

      removeAccount: (userId, accountId) => {
        set((state) => {
          const user = state.users.find(u => u.id === userId);
          if (user) {
            user.accounts = user.accounts.filter(a => a.id !== accountId);
          }
        });
      },

      updateAccount: (userId, account) => {
        set((state) => {
          const user = state.users.find(u => u.id === userId);
          if (user) {
            const idx = user.accounts.findIndex(a => a.id === account.id);
            if (idx !== -1) user.accounts[idx] = account;
          }
        });
      },

      updateUser: (userId, data) => {
        set((state) => {
          const user = state.users.find(u => u.id === userId);
          if (user) {
            if (data.name) user.name = data.name;
            if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
          }
        });
      },
    })),
    {
      name: 'user-store',
      partialize: (state) => ({ users: state.users, activeUserId: state.activeUserId }),
      // Валидация через zod при загрузке
      merge: (persisted, current) => {
        try {
          const parsed = UserStoreStateSchema.parse(persisted);
          return { ...current, ...parsed };
        } catch {
          return current;
        }
      },
    }
  )
); 