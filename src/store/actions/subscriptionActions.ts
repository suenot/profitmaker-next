import type { StateCreator } from 'zustand';
import type { DataProviderStore } from '../types';
import type { DataType, ProviderOperationResult, Timeframe, MarketType } from '../../types/dataProviders';

export interface SubscriptionActions {
  subscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market?: MarketType) => Promise<ProviderOperationResult>;
  unsubscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market?: MarketType) => void;
}

export const createSubscriptionActions: StateCreator<
  DataProviderStore,
  [['zustand/immer', never]],
  [],
  SubscriptionActions
> = (set, get) => ({
  // Управление дедуплицированными подписками
  subscribe: async (subscriberId: string, exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market: MarketType = 'spot'): Promise<ProviderOperationResult> => {
    const subscriptionKey = get().getSubscriptionKey(exchange, symbol, dataType, timeframe, market);
    const currentMethod = get().dataFetchSettings.method;
    
    try {
      let needsStart = false;
      let needsRestart = false;
      
      set(state => {
        // Ищем существующую подписку
        if (state.activeSubscriptions[subscriptionKey]) {
          // Увеличиваем счетчик подписчиков
          state.activeSubscriptions[subscriptionKey].subscriberCount++;
          console.log(`📈 Subscriber ${subscriberId} added to existing subscription: ${subscriptionKey} (count: ${state.activeSubscriptions[subscriptionKey].subscriberCount})`);
          
          // ВАЖНО: Проверяем соответствует ли метод подписки текущим настройкам
          if (state.activeSubscriptions[subscriptionKey].method !== currentMethod) {
            console.log(`🔄 Subscription ${subscriptionKey} method outdated (${state.activeSubscriptions[subscriptionKey].method} -> ${currentMethod})`);
            state.activeSubscriptions[subscriptionKey].method = currentMethod;
            needsRestart = true;
          }
        } else {
          // Создаем новую подписку с текущим методом
          state.activeSubscriptions[subscriptionKey] = {
            key: { exchange, symbol, dataType, timeframe, market },
            subscriberCount: 1,
            method: currentMethod,
            isFallback: false, // Изначально не fallback
            isActive: false,
            lastUpdate: 0
          };
          needsStart = true;
          console.log(`🆕 New subscription created: ${subscriptionKey} for subscriber ${subscriberId} (method: ${currentMethod})`);
        }
      });

      // Перезапускаем если метод изменился
      if (needsRestart) {
        console.log(`🔄 Restarting subscription ${subscriptionKey} due to method change`);
        get().stopDataFetching(subscriptionKey);
        await new Promise(resolve => setTimeout(resolve, 100));
        await get().startDataFetching(subscriptionKey);
      }
      // Запускаем получение данных если подписка новая
      else if (needsStart) {
        await get().startDataFetching(subscriptionKey);
      }

      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to create subscription ${subscriptionKey}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  unsubscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market: MarketType = 'spot') => {
    const subscriptionKey = get().getSubscriptionKey(exchange, symbol, dataType, timeframe, market);
    
    set(state => {
      if (state.activeSubscriptions[subscriptionKey]) {
        state.activeSubscriptions[subscriptionKey].subscriberCount--;
        console.log(`📉 Subscriber ${subscriberId} removed from subscription: ${subscriptionKey} (count: ${state.activeSubscriptions[subscriptionKey].subscriberCount})`);
        
        // Если подписчиков не осталось - останавливаем получение данных
        if (state.activeSubscriptions[subscriptionKey].subscriberCount <= 0) {
          get().stopDataFetching(subscriptionKey);
          delete state.activeSubscriptions[subscriptionKey];
          console.log(`🗑️ Subscription removed: ${subscriptionKey}`);
        }
      }
    });
  }
}); 