import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { enableMapSet } from 'immer';

import type { DataProviderStore, DataProviderState } from './types';
import type { CCXTBrowserProvider } from '../types/dataProviders';

// Actions imports
import { createProviderActions } from './actions/providerActions';
import { createSubscriptionActions } from './actions/subscriptionActions';
import { createDataActions } from './actions/dataActions';
import { createFetchingActions } from './actions/fetchingActions';
import { createCCXTActions } from './actions/ccxtActions';
import { createEventActions } from './actions/eventActions';

// Включаем поддержку Map и Set в Immer
enableMapSet();

export const useDataProviderStore = create<DataProviderStore>()(
  subscribeWithSelector(
    immer((set, get, store) => {
      // Создаем провайдер по умолчанию
      const defaultProvider: CCXTBrowserProvider = {
        id: 'binance-default',
        type: 'ccxt-browser',
        name: 'Binance (Default)',
        status: 'connected',
        config: {
          exchangeId: 'binance',
          sandbox: false
        }
      };

      // Начальное состояние
      const initialState: DataProviderState = {
        providers: {
          [defaultProvider.id]: defaultProvider
        },
        activeProviderId: defaultProvider.id,
        dataFetchSettings: {
          method: 'websocket',
          restIntervals: {
            trades: 1000,   // 1 секунда
            candles: 5000,  // 5 секунд
            orderbook: 500  // 0.5 секунды
          }
        },
        activeSubscriptions: {},
        restCycles: {},
        marketData: {
          candles: {}, // [exchange][market][symbol][timeframe] -> Candle[]
          trades: {},  // [exchange][market][symbol] -> Trade[]
          orderbook: {} // [exchange][market][symbol] -> OrderBook
        },
        chartUpdateListeners: {}, // Event system для Chart widgets
        loading: false,
        error: null
      };

      return {
        ...initialState,
        ...createProviderActions(set, get, store),
        ...createSubscriptionActions(set, get, store),
        ...createDataActions(set, get, store),
        ...createFetchingActions(set, get, store),
        ...createCCXTActions(set, get, store),
        ...createEventActions(set, get, store)
      };
    })
  )
); 