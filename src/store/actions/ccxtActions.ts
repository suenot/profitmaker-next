import type { StateCreator } from 'zustand';
import type { DataProviderStore } from '../types';
import type { OrderBookMethodSelection, CCXTMethodCapabilities } from '../../types/dataProviders';

export interface CCXTActions {
  selectOptimalOrderBookMethod: (exchange: string, exchangeInstance: any) => OrderBookMethodSelection;
  cleanup: () => void;
}

export const createCCXTActions: StateCreator<
  DataProviderStore,
  [['zustand/immer', never]],
  [],
  CCXTActions
> = (set, get) => ({
  // Интеллектуальный выбор CCXT методов
  selectOptimalOrderBookMethod: (exchange: string, exchangeInstance: any): OrderBookMethodSelection => {
    console.log(`🔍 Анализ возможностей ${exchange} для выбора оптимального orderbook метода...`);
    
    // Проверяем доступные возможности биржи
    const capabilities: CCXTMethodCapabilities = {
      watchOrderBookForSymbols: !!exchangeInstance.has?.['watchOrderBookForSymbols'],
      watchOrderBook: !!exchangeInstance.has?.['watchOrderBook'],
      fetchOrderBook: !!exchangeInstance.has?.['fetchOrderBook']
    };

    console.log(`📊 ${exchange} возможности:`, capabilities);

    // Приоритет 1: watchOrderBookForSymbols (diff обновления, наиболее эффективно)
    if (capabilities.watchOrderBookForSymbols) {
      return {
        selectedMethod: 'watchOrderBookForSymbols',
        reason: 'Оптимальный выбор: поддерживает diff обновления для множества пар',
        capabilities,
        isOptimal: true
      };
    }

    // Приоритет 2: watchOrderBook (полный orderbook, стандартная эффективность)
    if (capabilities.watchOrderBook) {
      return {
        selectedMethod: 'watchOrderBook',
        reason: 'Стандартный WebSocket: полные снепшоты orderbook',
        capabilities,
        isOptimal: true
      };
    }

    // Fallback: fetchOrderBook (REST запросы)
    return {
      selectedMethod: 'fetchOrderBook',
      reason: 'Fallback: REST запросы, WebSocket методы не поддерживаются',
      capabilities,
      isOptimal: false
    };
  },

  // Очистка
  cleanup: () => {
    const subscriptions = get().activeSubscriptions;
    Object.keys(subscriptions).forEach(key => {
      get().stopDataFetching(key);
    });

    set(state => {
      state.activeSubscriptions = {};
      state.restCycles = {};
      state.marketData = {
        candles: {},
        trades: {},
        orderbook: {}
      };
    });

    console.log(`🧹 Data provider store cleaned up`);
  }
}); 