import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { enableMapSet } from 'immer';

// CCXT загружается через CDN script tag - доступен как window.ccxt
declare global {
  interface Window {
    ccxt: any;
  }
}

// Получение CCXT из глобального объекта (CDN версия)
const getCCXT = () => {
  if (!window.ccxt) {
    console.error('CCXT не загружен! Проверьте подключение CDN script tag');
    return null;
  }
  return window.ccxt;
};

import {
  DataProvider,
  DataType,
  CCXTBrowserProvider,
  Candle,
  Trade,
  OrderBook,
  ConnectionStatus,
  ProviderOperationResult,
  DataFetchMethod,
  DataFetchSettings,
  SubscriptionKey,
  ActiveSubscription,
  RestCycleManager
} from '../types/dataProviders';

interface DataProviderStateV2 {
  // Поставщики данных
  providers: Record<string, DataProvider>;
  activeProviderId: string | null;
  
  // Настройки получения данных
  dataFetchSettings: DataFetchSettings;
  
  // Активные подписки с дедупликацией
  activeSubscriptions: Record<string, ActiveSubscription>;
  
  // REST циклы
  restCycles: Record<string, RestCycleManager>;
  
  // Централизованное хранилище данных
  marketData: {
    candles: Record<string, Record<string, Candle[]>>; // [exchange][symbol] -> Candle[]
    trades: Record<string, Record<string, Trade[]>>;   // [exchange][symbol] -> Trade[]
    orderbook: Record<string, Record<string, OrderBook>>; // [exchange][symbol] -> OrderBook
  };
  
  // Состояние
  loading: boolean;
  error: string | null;
}

interface DataProviderActionsV2 {
  // Управление поставщиками
  addProvider: (provider: DataProvider) => void;
  removeProvider: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
  
  // Управление настройками получения данных
  setDataFetchMethod: (method: DataFetchMethod) => Promise<void>;
  setRestInterval: (dataType: DataType, interval: number) => void;
  
  // Управление дедуплицированными подписками
  subscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType) => Promise<ProviderOperationResult>;
  unsubscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType) => void;
  
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
  
  // Внутренние функции управления потоками данных
  startDataFetching: (subscriptionKey: string) => Promise<void>;
  stopDataFetching: (subscriptionKey: string) => void;
  startWebSocketFetching: (exchange: string, symbol: string, dataType: DataType, provider: DataProvider) => Promise<void>;
  startRestFetching: (exchange: string, symbol: string, dataType: DataType, provider: DataProvider) => Promise<void>;
  
  // Очистка
  cleanup: () => void;
}

type DataProviderStoreV2 = DataProviderStateV2 & DataProviderActionsV2;

// Включаем поддержку Map и Set в Immer
enableMapSet();

export const useDataProviderStoreV2 = create<DataProviderStoreV2>()(
  subscribeWithSelector(
    immer((set, get) => {
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

      return {
        // Начальное состояние с провайдером по умолчанию
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
          candles: {},
          trades: {},
          orderbook: {}
        },
        loading: false,
        error: null,

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
      },

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

      // Управление дедуплицированными подписками
      subscribe: async (subscriberId: string, exchange: string, symbol: string, dataType: DataType): Promise<ProviderOperationResult> => {
        const subscriptionKey = get().getSubscriptionKey(exchange, symbol, dataType);
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
                key: { exchange, symbol, dataType },
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

      unsubscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType) => {
        const subscriptionKey = get().getSubscriptionKey(exchange, symbol, dataType);
        
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
      },

      // Внутренние функции управления потоками данных
      startDataFetching: async (subscriptionKey: string): Promise<void> => {
        const subscription = get().activeSubscriptions[subscriptionKey];
        if (!subscription || subscription.isActive) {
          return;
        }

        const { exchange, symbol, dataType } = subscription.key;
        const provider = get().providers[get().activeProviderId || ''];
        
        if (!provider) {
          console.error(`❌ No active provider for subscription ${subscriptionKey}`);
          return;
        }

        console.log(`🚀 Starting data fetching for ${subscriptionKey} using ${subscription.method} method`);

        set(state => {
          state.activeSubscriptions[subscriptionKey].isActive = true;
        });

        try {
          if (subscription.method === 'websocket') {
            await get().startWebSocketFetching(exchange, symbol, dataType, provider);
          } else {
            await get().startRestFetching(exchange, symbol, dataType, provider);
          }
        } catch (error) {
          console.error(`❌ Failed to start data fetching for ${subscriptionKey}:`, error);
          set(state => {
            state.activeSubscriptions[subscriptionKey].isActive = false;
          });
        }
      },

      stopDataFetching: (subscriptionKey: string) => {
        const subscription = get().activeSubscriptions[subscriptionKey];
        if (!subscription || !subscription.isActive) {
          return;
        }

        console.log(`🛑 Stopping data fetching for ${subscriptionKey}`);

        // Останавливаем WebSocket соединение
        if (subscription.wsConnection) {
          subscription.wsConnection.close();
          console.log(`🔌 WebSocket connection closed for ${subscriptionKey}`);
        }

        // Останавливаем REST цикл
        if (subscription.intervalId) {
          clearInterval(subscription.intervalId);
          console.log(`⏰ REST interval cleared for ${subscriptionKey}`);
        }

        set(state => {
          state.activeSubscriptions[subscriptionKey].isActive = false;
          delete state.activeSubscriptions[subscriptionKey].intervalId;
          delete state.activeSubscriptions[subscriptionKey].wsConnection;
        });
      },

      // Запуск WebSocket получения данных
      startWebSocketFetching: async (exchange: string, symbol: string, dataType: DataType, provider: DataProvider) => {
        if (provider.type !== 'ccxt-browser') {
          console.warn(`⚠️ WebSocket не поддерживается для провайдера типа ${provider.type}`);
          return;
        }

        const ccxtProvider = provider as CCXTBrowserProvider;
        const ccxt = getCCXT();
        if (!ccxt) return;

        try {
          const ExchangeClass = ccxt[exchange];
          if (!ExchangeClass) {
            throw new Error(`Exchange ${exchange} not found in CCXT`);
          }

          const exchangeInstance = new ExchangeClass(ccxtProvider.config);
          const subscriptionKey = get().getSubscriptionKey(exchange, symbol, dataType);

          // Проверяем поддержку WebSocket для типа данных
          let watchMethod: string;
          let hasSupport: boolean;

          switch (dataType) {
            case 'candles':
              watchMethod = 'watchOHLCV';
              hasSupport = exchangeInstance.has?.[watchMethod] || false;
              break;
            case 'trades':
              watchMethod = 'watchTrades';
              hasSupport = exchangeInstance.has?.[watchMethod] || false;
              break;
            case 'orderbook':
              watchMethod = 'watchOrderBook';
              hasSupport = exchangeInstance.has?.[watchMethod] || false;
              break;
            default:
              throw new Error(`Unsupported data type: ${dataType}`);
          }

          if (!hasSupport) {
            console.warn(`⚠️ Exchange ${exchange} does not support ${watchMethod}, falling back to REST`);
            console.log(`🔍 Debug info: exchangeInstance.has =`, exchangeInstance.has);
            console.log(`🔍 Debug info: exchangeInstance.has?.${watchMethod} =`, exchangeInstance.has?.[watchMethod]);
            console.log(`🔍 Debug info: Available methods:`, Object.keys(exchangeInstance.has || {}));
            
            // Автоматически переключаемся на REST с флагом fallback
            set(state => {
              if (state.activeSubscriptions[subscriptionKey]) {
                state.activeSubscriptions[subscriptionKey].method = 'rest';
                state.activeSubscriptions[subscriptionKey].isFallback = true; // ВАЖНО: Помечаем как fallback
              }
            });
            await get().startRestFetching(exchange, symbol, dataType, provider);
            return;
          }

          console.log(`📡 Starting WebSocket stream: ${exchange} ${symbol} ${dataType}`);

          // Запускаем WebSocket поток
          const startWebSocketStream = async () => {
            try {
              switch (dataType) {
                case 'candles':
                  const candles = await exchangeInstance.watchOHLCV(symbol, '1m');
                  get().updateCandles(exchange, symbol, candles);
                  break;
                case 'trades':
                  const trades = await exchangeInstance.watchTrades(symbol);
                  get().updateTrades(exchange, symbol, trades);
                  break;
                case 'orderbook':
                  const orderbook = await exchangeInstance.watchOrderBook(symbol);
                  get().updateOrderBook(exchange, symbol, orderbook);
                  break;
              }
            } catch (error) {
              console.error(`❌ WebSocket stream error for ${subscriptionKey}:`, error);
              // Не останавливаем подписку при ошибках - пытаемся переподключиться
              setTimeout(() => {
                const subscription = get().activeSubscriptions[subscriptionKey];
                if (subscription?.isActive) {
                  startWebSocketStream();
                }
              }, 5000);
            }
          };

          startWebSocketStream();

        } catch (error) {
          console.error(`❌ Failed to start WebSocket for ${exchange} ${symbol} ${dataType}:`, error);
          throw error;
        }
      },

      // Запуск REST получения данных
      startRestFetching: async (exchange: string, symbol: string, dataType: DataType, provider: DataProvider) => {
        if (provider.type !== 'ccxt-browser') {
          console.warn(`⚠️ REST не поддерживается для провайдера типа ${provider.type}`);
          return;
        }

        const ccxtProvider = provider as CCXTBrowserProvider;
        const ccxt = getCCXT();
        if (!ccxt) return;

        try {
          const ExchangeClass = ccxt[exchange];
          if (!ExchangeClass) {
            throw new Error(`Exchange ${exchange} not found in CCXT`);
          }

          const exchangeInstance = new ExchangeClass(ccxtProvider.config);
          const subscriptionKey = get().getSubscriptionKey(exchange, symbol, dataType);
          const interval = get().dataFetchSettings.restIntervals[dataType];

          console.log(`🔄 Starting REST polling: ${exchange} ${symbol} ${dataType} every ${interval}ms`);

          const fetchData = async () => {
            try {
              const subscription = get().activeSubscriptions[subscriptionKey];
              if (!subscription?.isActive) return;

              switch (dataType) {
                case 'candles':
                  const candles = await exchangeInstance.fetchOHLCV(symbol, '1m', undefined, 100);
                  if (candles && candles.length > 0) {
                    const formattedCandles = candles.map((c: any[]) => ({
                      timestamp: c[0],
                      open: c[1],
                      high: c[2],
                      low: c[3],
                      close: c[4],
                      volume: c[5]
                    }));
                    get().updateCandles(exchange, symbol, formattedCandles);
                  }
                  break;
                case 'trades':
                  const trades = await exchangeInstance.fetchTrades(symbol, undefined, 100);
                  if (trades && trades.length > 0) {
                    get().updateTrades(exchange, symbol, trades);
                  }
                  break;
                case 'orderbook':
                  const orderbook = await exchangeInstance.fetchOrderBook(symbol);
                  if (orderbook) {
                    get().updateOrderBook(exchange, symbol, orderbook);
                  }
                  break;
              }
            } catch (error) {
              console.error(`❌ REST fetch error for ${subscriptionKey}:`, error);
              // При ошибке продолжаем попытки через увеличенный интервал
            }
          };

          // Первый запрос сразу
          await fetchData();

                     // Запускаем интервал
           const intervalId = setInterval(fetchData, interval) as any;

           set(state => {
             if (state.activeSubscriptions[subscriptionKey]) {
               state.activeSubscriptions[subscriptionKey].intervalId = intervalId;
             }
           });

        } catch (error) {
          console.error(`❌ Failed to start REST polling for ${exchange} ${symbol} ${dataType}:`, error);
          throw error;
        }
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
      };
    })
  )
); 