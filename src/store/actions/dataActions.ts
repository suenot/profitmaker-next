import type { StateCreator } from 'zustand';
import type { DataProviderStore } from '../types';
import type { DataType, DataFetchMethod, Candle, Trade, OrderBook, ActiveSubscription } from '../../types/dataProviders';

export interface DataActions {
  // Управление настройками получения данных
  setDataFetchMethod: (method: DataFetchMethod) => Promise<void>;
  setRestInterval: (dataType: DataType, interval: number) => void;
  
  // Получение данных из store
  getCandles: (exchange: string, symbol: string) => Candle[];
  getTrades: (exchange: string, symbol: string) => Trade[];
  getOrderBook: (exchange: string, symbol: string) => OrderBook | null;
  
  // Обновление данных в центральном store
  updateCandles: (exchange: string, symbol: string, candles: Candle[]) => void;
  updateTrades: (exchange: string, symbol: string, trades: Trade[]) => void;
  updateOrderBook: (exchange: string, symbol: string, orderbook: OrderBook) => void;
  
  // Утилиты
  getSubscriptionKey: (exchange: string, symbol: string, dataType: DataType) => string;
  getActiveSubscriptionsList: () => ActiveSubscription[];
}

export const createDataActions: StateCreator<
  DataProviderStore,
  [['zustand/immer', never]],
  [],
  DataActions
> = (set, get) => ({
  // Управление настройками получения данных
  setDataFetchMethod: async (method: DataFetchMethod) => {
    const oldMethod = get().dataFetchSettings.method;
    
    // Сначала обновляем настройки
    set(state => {
      state.dataFetchSettings.method = method;
    });
    
    console.log(`🔄 Data fetch method changed from ${oldMethod} to ${method}`);
    
    // При смене метода - перезапускаем все активные подписки
    if (oldMethod !== method) {
      const activeKeys = Object.keys(get().activeSubscriptions).filter(key => 
        get().activeSubscriptions[key].isActive
      );
      
      console.log(`🔄 Restarting ${activeKeys.length} active subscriptions with new method: ${method}`);
      
      // Останавливаем все активные подписки
      activeKeys.forEach(key => {
        console.log(`🛑 Stopping subscription ${key} for method change`);
        get().stopDataFetching(key);
      });
      
      // Обновляем метод в подписках
      set(state => {
        activeKeys.forEach(key => {
          if (state.activeSubscriptions[key]) {
            state.activeSubscriptions[key].method = method;
            console.log(`🔄 Updated method for subscription ${key} to ${method}`);
          }
        });
      });
      
      // Ждем немного для завершения остановки
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Запускаем подписки заново с новым методом
      for (const key of activeKeys) {
        const subscription = get().activeSubscriptions[key];
        if (subscription) {
          console.log(`🚀 Restarting subscription ${key} with method ${method}`);
          await get().startDataFetching(key);
        }
      }
      
      console.log(`✅ All subscriptions restarted with method: ${method}`);
    }
  },

  setRestInterval: (dataType: DataType, interval: number) => {
    set(state => {
      const oldInterval = state.dataFetchSettings.restIntervals[dataType];
      state.dataFetchSettings.restIntervals[dataType] = interval;
      console.log(`⏱️ REST interval for ${dataType} changed from ${oldInterval}ms to ${interval}ms`);
      
      // Перезапускаем REST подписки для этого типа данных
      Object.keys(state.activeSubscriptions).forEach(key => {
        const subscription = state.activeSubscriptions[key];
        if (subscription.key.dataType === dataType && subscription.method === 'rest' && subscription.isActive) {
          get().stopDataFetching(key);
          get().startDataFetching(key);
        }
      });
    });
  },

  // Получение данных из store
  getCandles: (exchange: string, symbol: string): Candle[] => {
    const state = get();
    return state.marketData.candles[exchange]?.[symbol] || [];
  },

  getTrades: (exchange: string, symbol: string): Trade[] => {
    const state = get();
    return state.marketData.trades[exchange]?.[symbol] || [];
  },

  getOrderBook: (exchange: string, symbol: string): OrderBook | null => {
    const state = get();
    return state.marketData.orderbook[exchange]?.[symbol] || null;
  },

  // Обновление данных в центральном store
  updateCandles: (exchange: string, symbol: string, candles: Candle[]) => {
    set(state => {
      if (!state.marketData.candles[exchange]) {
        state.marketData.candles[exchange] = {};
      }
      state.marketData.candles[exchange][symbol] = candles;
      
      // Обновляем timestamp последнего обновления
      const subscriptionKey = get().getSubscriptionKey(exchange, symbol, 'candles');
      if (state.activeSubscriptions[subscriptionKey]) {
        state.activeSubscriptions[subscriptionKey].lastUpdate = Date.now();
      }
    });
  },

  updateTrades: (exchange: string, symbol: string, trades: Trade[]) => {
    set(state => {
      if (!state.marketData.trades[exchange]) {
        state.marketData.trades[exchange] = {};
      }
      
      // Для trades добавляем новые сделки к существующим (максимум 1000)
      const existing = state.marketData.trades[exchange][symbol] || [];
      const combined = [...existing, ...trades];
      state.marketData.trades[exchange][symbol] = combined.slice(-1000); // Оставляем последние 1000
      
      // Обновляем timestamp последнего обновления
      const subscriptionKey = get().getSubscriptionKey(exchange, symbol, 'trades');
      if (state.activeSubscriptions[subscriptionKey]) {
        state.activeSubscriptions[subscriptionKey].lastUpdate = Date.now();
      }
    });
  },

  updateOrderBook: (exchange: string, symbol: string, orderbook: OrderBook) => {
    set(state => {
      if (!state.marketData.orderbook[exchange]) {
        state.marketData.orderbook[exchange] = {};
      }
      state.marketData.orderbook[exchange][symbol] = orderbook;
      
      // Обновляем timestamp последнего обновления
      const subscriptionKey = get().getSubscriptionKey(exchange, symbol, 'orderbook');
      if (state.activeSubscriptions[subscriptionKey]) {
        state.activeSubscriptions[subscriptionKey].lastUpdate = Date.now();
      }
    });
  },

  // Утилиты
  getSubscriptionKey: (exchange: string, symbol: string, dataType: DataType): string => {
    return `${exchange}:${symbol}:${dataType}`;
  },

  getActiveSubscriptionsList: (): ActiveSubscription[] => {
    return Object.values(get().activeSubscriptions);
  }
}); 