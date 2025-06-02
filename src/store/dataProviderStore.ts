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
  console.log('CCXT loaded from CDN, version:', window.ccxt.version);
  return window.ccxt;
};

import {
  DataProvider,
  DataSubscription,
  WebSocketConnection,
  ConnectionKey,
  ConnectionInfo,
  DataType,
  SubscriptionData,
  CreateSubscriptionParams,
  CCXTBrowserProvider,
  Candle,
  Trade,
  OrderBook,
  ConnectionStatus,
  ProviderOperationResult
} from '../types/dataProviders';

interface DataProviderState {
  // Поставщики данных
  providers: Record<string, DataProvider>;
  activeProviderId: string | null;
  
  // WebSocket соединения
  connections: Record<string, WebSocketConnection>;
  
  // Подписки
  subscriptions: Record<string, DataSubscription>;
  
  // Данные по подпискам
  data: SubscriptionData;
  
  // Статистика соединений
  connectionStats: Record<string, ConnectionInfo>;
  
  // Состояние
  loading: boolean;
  error: string | null;
}

interface DataProviderActions {
  // Управление поставщиками
  addProvider: (provider: DataProvider) => void;
  removeProvider: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
  updateProviderStatus: (providerId: string, status: ConnectionStatus) => void;
  
  // Управление подписками
  createSubscription: (params: CreateSubscriptionParams) => Promise<ProviderOperationResult>;
  removeSubscription: (subscriptionId: string) => void;
  
  // Управление соединениями
  createConnection: (key: ConnectionKey, provider: DataProvider) => void;
  closeConnection: (connectionKey: string) => void;
  updateConnectionStatus: (connectionKey: string, status: ConnectionStatus, error?: string) => void;
  
  // Обновление данных
  updateCandles: (symbol: string, exchange: string, candles: Candle[]) => void;
  updateTrades: (symbol: string, exchange: string, trades: Trade[]) => void;
  updateOrderBook: (symbol: string, exchange: string, orderbook: OrderBook) => void;
  
  // Утилиты
  getConnectionKey: (exchange: string, symbol: string, dataType: DataType) => string;
  getActiveSubscriptions: () => DataSubscription[];
  getConnectionsByProvider: (providerId: string) => WebSocketConnection[];
  
  // Инициализация и очистка
  initializeProvider: (providerId: string) => Promise<ProviderOperationResult>;
  initializeCCXTBrowserConnection: (connectionKey: string, key: ConnectionKey, provider: CCXTBrowserProvider) => void;
  cleanup: () => void;
}

type DataProviderStore = DataProviderState & DataProviderActions;

const RECONNECT_INTERVAL = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL = 30000;

// Включаем поддержку Map и Set в Immer
enableMapSet();

export const useDataProviderStore = create<DataProviderStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Начальное состояние
      providers: {},
      activeProviderId: null,
      connections: {},
      subscriptions: {},
      data: {
        candles: {},
        trades: {},
        orderbook: {}
      },
      connectionStats: {},
      loading: false,
      error: null,

      // Управление поставщиками
      addProvider: (provider: DataProvider) => {
        set(state => {
          state.providers[provider.id] = provider;
          if (!state.activeProviderId) {
            state.activeProviderId = provider.id;
          }
        });
      },

      removeProvider: (providerId: string) => {
        set(state => {
          // Закрываем все соединения провайдера
          Object.keys(state.connections).forEach(key => {
            if (state.connections[key].provider.id === providerId) {
              const ws = state.connections[key].ws;
              if (ws) {
                ws.close();
              }
              delete state.connections[key];
              delete state.connectionStats[key];
            }
          });
          
          // Удаляем подписки провайдера
          Object.keys(state.subscriptions).forEach(subId => {
            if (state.subscriptions[subId].exchange === providerId) {
              delete state.subscriptions[subId];
            }
          });
          
          delete state.providers[providerId];
          
          if (state.activeProviderId === providerId) {
            const remainingProviders = Object.keys(state.providers);
            state.activeProviderId = remainingProviders.length > 0 ? remainingProviders[0] : null;
          }
        });
      },

      setActiveProvider: (providerId: string) => {
        set(state => {
          if (state.providers[providerId]) {
            state.activeProviderId = providerId;
          }
        });
      },

      updateProviderStatus: (providerId: string, status: ConnectionStatus) => {
        set(state => {
          if (state.providers[providerId]) {
            state.providers[providerId].status = status;
          }
        });
      },

      // Управление подписками
      createSubscription: async (params: CreateSubscriptionParams): Promise<ProviderOperationResult> => {
        const { symbol, dataType, exchange, dashboardId, widgetId, providerId } = params;
        
        const provider = get().providers[providerId];
        if (!provider) {
          return { success: false, error: `Provider ${providerId} not found` };
        }

        const subscriptionId = `${providerId}-${exchange}-${symbol}-${dataType}-${dashboardId}-${widgetId}`;
        const connectionKey = get().getConnectionKey(exchange, symbol, dataType);

        try {
          set(state => {
            // Создаем подписку
            state.subscriptions[subscriptionId] = {
              id: subscriptionId,
              symbol,
              dataType,
              exchange,
              dashboardId,
              widgetId
            };

            // Инициализируем данные если нужно
            const dataKey = `${exchange}-${symbol}`;
            if (dataType === 'candles' && !state.data.candles[dataKey]) {
              state.data.candles[dataKey] = { data: null, lastUpdate: 0, loading: true };
            }
            if (dataType === 'trades' && !state.data.trades[dataKey]) {
              state.data.trades[dataKey] = { data: null, lastUpdate: 0, loading: true };
            }
            if (dataType === 'orderbook' && !state.data.orderbook[dataKey]) {
              state.data.orderbook[dataKey] = { data: null, lastUpdate: 0, loading: true };
            }
          });

          // Создаем соединение если нужно
          if (!get().connections[connectionKey]) {
            get().createConnection({ exchange, symbol, dataType }, provider);
          } else {
            // Добавляем подписку к существующему соединению
            set(state => {
              state.connections[connectionKey].subscriptions.add(subscriptionId);
              if (state.connectionStats[connectionKey]) {
                state.connectionStats[connectionKey].subscriberCount = state.connections[connectionKey].subscriptions.size;
              }
            });
          }

          return { success: true, data: { subscriptionId } };
        } catch (error) {
          return { success: false, error: `Failed to create subscription: ${error}` };
        }
      },

      removeSubscription: (subscriptionId: string) => {
        set(state => {
          const subscription = state.subscriptions[subscriptionId];
          if (!subscription) return;

          const connectionKey = get().getConnectionKey(subscription.exchange, subscription.symbol, subscription.dataType);
          
          // Удаляем подписку из соединения
          if (state.connections[connectionKey]) {
            state.connections[connectionKey].subscriptions.delete(subscriptionId);
            
            // Если больше нет подписчиков, закрываем соединение
            if (state.connections[connectionKey].subscriptions.size === 0) {
              const ws = state.connections[connectionKey].ws;
              if (ws) {
                ws.close();
              }
              delete state.connections[connectionKey];
              delete state.connectionStats[connectionKey];
            } else {
              // Обновляем статистику
              if (state.connectionStats[connectionKey]) {
                state.connectionStats[connectionKey].subscriberCount = state.connections[connectionKey].subscriptions.size;
              }
            }
          }
          
          delete state.subscriptions[subscriptionId];
        });
      },

      // Управление соединениями
      createConnection: (key: ConnectionKey, provider: DataProvider) => {
        const connectionKey = get().getConnectionKey(key.exchange, key.symbol, key.dataType);
        
        set(state => {
          state.connections[connectionKey] = {
            key: connectionKey,
            ws: null,
            status: 'connecting',
            subscriptions: new Set(),
            reconnectAttempts: 0,
            lastPing: Date.now(),
            provider
          };
          
          state.connectionStats[connectionKey] = {
            key,
            status: 'connecting',
            subscriberCount: 0,
            lastUpdate: Date.now()
          };
        });

        // Создаем WebSocket соединение для CCXT Browser
        if (provider.type === 'ccxt-browser') {
          get().initializeCCXTBrowserConnection(connectionKey, key, provider as CCXTBrowserProvider);
        }
      },

      closeConnection: (connectionKey: string) => {
        set(state => {
          const connection = state.connections[connectionKey];
          if (connection?.ws) {
            connection.ws.close();
          }
          delete state.connections[connectionKey];
          delete state.connectionStats[connectionKey];
        });
      },

      updateConnectionStatus: (connectionKey: string, status: ConnectionStatus, error?: string) => {
        set(state => {
          if (state.connections[connectionKey]) {
            state.connections[connectionKey].status = status;
          }
          if (state.connectionStats[connectionKey]) {
            state.connectionStats[connectionKey].status = status;
            state.connectionStats[connectionKey].lastUpdate = Date.now();
            if (error) {
              state.connectionStats[connectionKey].error = error;
            }
          }
        });
      },

      // Обновление данных
      updateCandles: (symbol: string, exchange: string, candles: Candle[]) => {
        set(state => {
          const key = `${exchange}-${symbol}`;
          if (state.data.candles[key]) {
            state.data.candles[key] = {
              data: candles,
              lastUpdate: Date.now(),
              loading: false
            };
          }
        });
      },

      updateTrades: (symbol: string, exchange: string, trades: Trade[]) => {
        set(state => {
          const key = `${exchange}-${symbol}`;
          if (state.data.trades[key]) {
            state.data.trades[key] = {
              data: trades,
              lastUpdate: Date.now(),
              loading: false
            };
          }
        });
      },

      updateOrderBook: (symbol: string, exchange: string, orderbook: OrderBook) => {
        set(state => {
          const key = `${exchange}-${symbol}`;
          if (state.data.orderbook[key]) {
            state.data.orderbook[key] = {
              data: orderbook,
              lastUpdate: Date.now(),
              loading: false
            };
          }
        });
      },

      // Утилиты
      getConnectionKey: (exchange: string, symbol: string, dataType: DataType): string => {
        return `${exchange}-${symbol}-${dataType}`;
      },

      getActiveSubscriptions: (): DataSubscription[] => {
        return Object.values(get().subscriptions);
      },

      getConnectionsByProvider: (providerId: string): WebSocketConnection[] => {
        return Object.values(get().connections).filter(conn => conn.provider.id === providerId);
      },

      // Инициализация CCXT Browser соединения
      initializeCCXTBrowserConnection: async (connectionKey: string, key: ConnectionKey, provider: CCXTBrowserProvider) => {
        try {
          const ccxtLib = getCCXT();
          if (!ccxtLib) {
            get().updateConnectionStatus(connectionKey, 'error', 'CCXT library not available');
            return;
          }

          const ExchangeClass = ccxtLib[provider.config.exchangeId];
          if (!ExchangeClass) {
            get().updateConnectionStatus(connectionKey, 'error', `Exchange ${provider.config.exchangeId} not supported`);
            return;
          }

          const exchange = new ExchangeClass({
            ...provider.config,
            enableRateLimit: true,
            rateLimit: 1000,
            sandbox: provider.config.sandbox || false
          });

          // Проверяем поддержку WebSocket для конкретного типа данных
          const hasWebSocketSupport = 
            (key.dataType === 'candles' && exchange.has?.watchOHLCV) ||
            (key.dataType === 'trades' && exchange.has?.watchTrades) ||
            (key.dataType === 'orderbook' && exchange.has?.watchOrderBook);
            
          if (!hasWebSocketSupport) {
            get().updateConnectionStatus(connectionKey, 'error', 
              `Exchange does not support WebSocket streaming for ${key.dataType}`);
            return;
          }

          // Создаем WebSocket соединение
          const startStreaming = async () => {
            try {
              get().updateConnectionStatus(connectionKey, 'connecting');
              
              if (key.dataType === 'candles' && exchange.has.watchOHLCV) {
                const ohlcvStream = await exchange.watchOHLCV(key.symbol, '1m');
                get().updateConnectionStatus(connectionKey, 'connected');
                
                // Обрабатываем поток данных свечей
                console.log('OHLCV stream started for', key.symbol, ohlcvStream);
                if (ohlcvStream && Array.isArray(ohlcvStream)) {
                  const candles = ohlcvStream.map(ohlcv => ({
                    timestamp: ohlcv[0],
                    open: ohlcv[1],
                    high: ohlcv[2], 
                    low: ohlcv[3],
                    close: ohlcv[4],
                    volume: ohlcv[5]
                  }));
                  get().updateCandles(key.symbol, key.exchange, candles);
                }
              }
              
              if (key.dataType === 'trades' && exchange.has.watchTrades) {
                const tradesStream = await exchange.watchTrades(key.symbol);
                get().updateConnectionStatus(connectionKey, 'connected');
                
                // Обрабатываем поток сделок
                console.log('Trades stream started for', key.symbol, tradesStream);
                if (tradesStream && Array.isArray(tradesStream)) {
                  const trades = tradesStream.map(trade => ({
                    id: trade.id,
                    timestamp: trade.timestamp,
                    price: trade.price,
                    amount: trade.amount,
                    side: trade.side
                  }));
                  get().updateTrades(key.symbol, key.exchange, trades);
                }
              }
              
              if (key.dataType === 'orderbook' && exchange.has.watchOrderBook) {
                const orderbookStream = await exchange.watchOrderBook(key.symbol);
                get().updateConnectionStatus(connectionKey, 'connected');
                
                // Обрабатываем поток книги заказов
                console.log('OrderBook stream started for', key.symbol, orderbookStream);
                if (orderbookStream) {
                  const orderbook = {
                    bids: orderbookStream.bids || [],
                    asks: orderbookStream.asks || [],
                    timestamp: orderbookStream.timestamp || Date.now()
                  };
                  get().updateOrderBook(key.symbol, key.exchange, orderbook);
                }
              }
              
            } catch (error) {
              console.error('Failed to start streaming:', error);
              get().updateConnectionStatus(connectionKey, 'error', `Streaming error: ${error}`);
              
              // Попытка переподключения
              setTimeout(() => {
                const connection = get().connections[connectionKey];
                if (connection && connection.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                  set(state => {
                    state.connections[connectionKey].reconnectAttempts++;
                  });
                  startStreaming();
                }
              }, RECONNECT_INTERVAL);
            }
          };

          startStreaming();
          
        } catch (error) {
          console.error('Failed to initialize CCXT connection:', error);
          get().updateConnectionStatus(connectionKey, 'error', `Initialization error: ${error}`);
        }
      },

      // Инициализация провайдера
      initializeProvider: async (providerId: string): Promise<ProviderOperationResult> => {
        const provider = get().providers[providerId];
        if (!provider) {
          return { success: false, error: `Provider ${providerId} not found` };
        }

        try {
          set(state => { state.loading = true; });
          
          // Тестируем соединение в зависимости от типа провайдера
          if (provider.type === 'ccxt-browser') {
            const ccxtProvider = provider as CCXTBrowserProvider;
            const ccxtLib = getCCXT();
            
            if (!ccxtLib) {
              throw new Error('CCXT library not available');
            }

            const ExchangeClass = ccxtLib[ccxtProvider.config.exchangeId];
            if (!ExchangeClass) {
              throw new Error(`Exchange ${ccxtProvider.config.exchangeId} not supported`);
            }

            const exchange = new ExchangeClass({
              ...ccxtProvider.config,
              sandbox: ccxtProvider.config.sandbox || false
            });
            
            // Загружаем рынки для проверки соединения
            const markets = await exchange.loadMarkets();
            
            get().updateProviderStatus(providerId, 'connected');
            return { 
              success: true, 
              data: { 
                markets: Object.keys(markets),
                exchangeInfo: {
                  id: exchange.id,
                  name: exchange.name,
                  version: exchange.version,
                  has: exchange.has
                }
              } 
            };
          }
          
          return { success: false, error: 'Provider type not implemented yet' };
          
        } catch (error) {
          console.error('Provider initialization failed:', error);
          get().updateProviderStatus(providerId, 'error');
          return { success: false, error: `Initialization failed: ${error}` };
        } finally {
          set(state => { 
            state.loading = false; 
            state.error = null;
          });
        }
      },

      // Очистка ресурсов
      cleanup: () => {
        set(state => {
          // Закрываем все WebSocket соединения
          Object.values(state.connections).forEach(connection => {
            if (connection.ws) {
              connection.ws.close();
            }
          });
          
          // Очищаем состояние
          state.connections = {};
          state.subscriptions = {};
          state.connectionStats = {};
          state.data = {
            candles: {},
            trades: {},
            orderbook: {}
          };
        });
      }
    }))
  )
); 