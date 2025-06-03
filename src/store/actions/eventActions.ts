import { StateCreator } from 'zustand';
import { DataProviderStore } from '../types';
import { ChartUpdateListener, ChartUpdateEvent, Timeframe, MarketType } from '../../types/dataProviders';

// Actions для event system Chart widgets
export interface EventActions {
  addChartUpdateListener: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType, listener: ChartUpdateListener) => void;
  removeChartUpdateListener: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType, listener: ChartUpdateListener) => void;
  emitChartUpdateEvent: (event: ChartUpdateEvent) => void;
}

export const createEventActions: StateCreator<
  DataProviderStore,
  [['zustand/immer', never]],
  [],
  EventActions
> = (set, get) => ({
  addChartUpdateListener: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType, listener: ChartUpdateListener) => {
    const subscriptionKey = get().getSubscriptionKey(exchange, symbol, 'candles', timeframe, market);
    
    set(state => {
      if (!state.chartUpdateListeners[subscriptionKey]) {
        state.chartUpdateListeners[subscriptionKey] = [];
      }
      
      // Добавляем listener если его еще нет
      if (!state.chartUpdateListeners[subscriptionKey].includes(listener)) {
        state.chartUpdateListeners[subscriptionKey].push(listener);
        console.log(`📺 [EventSystem] Added chart listener for ${subscriptionKey}, total listeners: ${state.chartUpdateListeners[subscriptionKey].length}`);
      }
    });
  },

  removeChartUpdateListener: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType, listener: ChartUpdateListener) => {
    const subscriptionKey = get().getSubscriptionKey(exchange, symbol, 'candles', timeframe, market);
    
    set(state => {
      if (state.chartUpdateListeners[subscriptionKey]) {
        const index = state.chartUpdateListeners[subscriptionKey].indexOf(listener);
        if (index > -1) {
          state.chartUpdateListeners[subscriptionKey].splice(index, 1);
          console.log(`📺 [EventSystem] Removed chart listener for ${subscriptionKey}, remaining listeners: ${state.chartUpdateListeners[subscriptionKey].length}`);
          
          // Удаляем массив если он пустой
          if (state.chartUpdateListeners[subscriptionKey].length === 0) {
            delete state.chartUpdateListeners[subscriptionKey];
          }
        }
      }
    });
  },

  emitChartUpdateEvent: (event: ChartUpdateEvent) => {
    const subscriptionKey = get().getSubscriptionKey(event.exchange, event.symbol, 'candles', event.timeframe, event.market);
    const listeners = get().chartUpdateListeners[subscriptionKey] || [];
    
    if (listeners.length > 0) {
      console.log(`📺 [EventSystem] Emitting ${event.type} event for ${subscriptionKey} to ${listeners.length} listeners:`, {
        event: event.type,
        subscriptionKey,
        listenerCount: listeners.length,
        data: event.data
      });
      
      // Вызываем всех слушателей асинхронно чтобы не блокировать store
      setTimeout(() => {
        listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`❌ [EventSystem] Error in chart update listener:`, error);
          }
        });
      }, 0);
    }
  }
}); 