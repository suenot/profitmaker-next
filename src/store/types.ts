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
  OrderBookMethodSelection,
  Timeframe,
  MarketType,
  ChartUpdateListener,
  ChartUpdateEvent
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
    candles: Record<string, Record<string, Record<string, Record<string, Candle[]>>>>; // [exchange][market][symbol][timeframe] -> Candle[]
    trades: Record<string, Record<string, Record<string, Trade[]>>>;   // [exchange][market][symbol] -> Trade[]
    orderbook: Record<string, Record<string, Record<string, OrderBook>>>; // [exchange][market][symbol] -> OrderBook
  };
  
  // Event system для уведомления Chart widgets
  chartUpdateListeners: Record<string, ChartUpdateListener[]>; // [subscriptionKey] -> [listeners]
  
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
  subscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market?: MarketType) => Promise<ProviderOperationResult>;
  unsubscribe: (subscriberId: string, exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market?: MarketType) => void;
  
  // Получение данных из store
  getCandles: (exchange: string, symbol: string, timeframe?: Timeframe, market?: MarketType) => Candle[];
  getTrades: (exchange: string, symbol: string, market?: MarketType) => Trade[];
  getOrderBook: (exchange: string, symbol: string, market?: MarketType) => OrderBook | null;
  
  // REST инициализация данных для Chart widgets
  initializeChartData: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType) => Promise<Candle[]>;
  
  // Обновление данных в центральном store
  updateCandles: (exchange: string, symbol: string, candles: Candle[], timeframe?: Timeframe, market?: MarketType) => void;
  updateTrades: (exchange: string, symbol: string, trades: Trade[], market?: MarketType) => void;
  updateOrderBook: (exchange: string, symbol: string, orderbook: OrderBook, market?: MarketType) => void;
  
  // Утилиты
  getSubscriptionKey: (exchange: string, symbol: string, dataType: DataType, timeframe?: Timeframe, market?: MarketType) => string;
  getActiveSubscriptionsList: () => ActiveSubscription[];
  
  // Event system для Chart widgets
  addChartUpdateListener: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType, listener: ChartUpdateListener) => void;
  removeChartUpdateListener: (exchange: string, symbol: string, timeframe: Timeframe, market: MarketType, listener: ChartUpdateListener) => void;
  emitChartUpdateEvent: (event: ChartUpdateEvent) => void;
  
  // Внутренние функции управления потоками данных
  startDataFetching: (subscriptionKey: string) => Promise<void>;
  stopDataFetching: (subscriptionKey: string) => void;
  startWebSocketFetching: (exchange: string, symbol: string, dataType: DataType, provider: DataProvider, timeframe?: Timeframe, market?: MarketType) => Promise<void>;
  startRestFetching: (exchange: string, symbol: string, dataType: DataType, provider: DataProvider, timeframe?: Timeframe, market?: MarketType) => Promise<void>;
  
  // Интеллектуальный выбор CCXT методов
  selectOptimalOrderBookMethod: (exchange: string, exchangeInstance: any) => OrderBookMethodSelection;
  
  // Очистка
  cleanup: () => void;
}

// Основной тип store
export type DataProviderStore = DataProviderState & DataProviderActions; 