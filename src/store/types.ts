import type {
  DataProvider,
  DataType,
  DataFetchSettings,
  ActiveSubscription,
  RestCycleManager,
  Candle,
  Trade,
  OrderBook,
  ProviderOperationResult,
  DataFetchMethod,
  OrderBookMethodSelection
} from '../types/dataProviders';

// Интерфейс состояния store
export interface DataProviderState {
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

// Интерфейс действий store
export interface DataProviderActions {
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
  
  // Интеллектуальный выбор CCXT методов
  selectOptimalOrderBookMethod: (exchange: string, exchangeInstance: any) => OrderBookMethodSelection;
  
  // Очистка
  cleanup: () => void;
}

// Основной тип store
export type DataProviderStore = DataProviderState & DataProviderActions; 