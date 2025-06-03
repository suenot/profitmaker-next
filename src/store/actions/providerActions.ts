import type { StateCreator } from 'zustand';
import type { DataProvider } from '../../types/dataProviders';
import type { DataProviderStore } from '../types';

export interface ProviderActions {
  addProvider: (provider: DataProvider) => void;
  removeProvider: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
}

export const createProviderActions: StateCreator<
  DataProviderStore,
  [['zustand/immer', never]],
  [],
  ProviderActions
> = (set, get) => ({
  // Управление поставщиками
  addProvider: (provider: DataProvider) => {
    set(state => {
      state.providers[provider.id] = provider;
      if (!state.activeProviderId) {
        state.activeProviderId = provider.id;
      }
      console.log(`🔌 Provider added: ${provider.id}`);
    });
  },

  removeProvider: (providerId: string) => {
    set(state => {
      // Останавливаем все подписки провайдера
      Object.keys(state.activeSubscriptions).forEach(key => {
        const subscription = state.activeSubscriptions[key];
        if (subscription.key.exchange === providerId) {
          get().stopDataFetching(key);
          delete state.activeSubscriptions[key];
        }
      });
      
      delete state.providers[providerId];
      
      if (state.activeProviderId === providerId) {
        const remainingProviders = Object.keys(state.providers);
        state.activeProviderId = remainingProviders.length > 0 ? remainingProviders[0] : null;
      }
      console.log(`🔌 Provider removed: ${providerId}`);
    });
  },

  setActiveProvider: (providerId: string) => {
    set(state => {
      if (state.providers[providerId]) {
        state.activeProviderId = providerId;
        console.log(`🎯 Active provider set to: ${providerId}`);
      }
    });
  }
}); 