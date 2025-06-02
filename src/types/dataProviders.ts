// Типы данных для финансовых инструментов
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  timestamp: number;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  timestamp: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

// Типы подписок на данные
export type DataType = 'candles' | 'trades' | 'orderbook';

export interface DataSubscription {
  id: string;
  symbol: string; // Например: 'BTC/USDT'
  dataType: DataType;
  exchange: string;
  dashboardId: string;
  widgetId: string;
}

// Ключ для уникальной идентификации соединения
export interface ConnectionKey {
  exchange: string;
  symbol: string;
  dataType: DataType;
}

// Статус соединения
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ConnectionInfo {
  key: ConnectionKey;
  status: ConnectionStatus;
  subscriberCount: number;
  lastUpdate: number;
  error?: string;
}

// Базовый интерфейс для поставщика данных
export interface BaseDataProvider {
  id: string;
  name: string;
  type: DataProviderType;
  status: ConnectionStatus;
}

// Типы поставщиков данных
export type DataProviderType = 'ccxt-browser' | 'ccxt-server' | 'custom';

// Конфигурация для CCXT Browser
export interface CCXTBrowserConfig {
  exchangeId: string; // binance, bybit, etc.
  sandbox?: boolean;
  apiKey?: string;
  secret?: string;
  password?: string;
  uid?: string;
  options?: Record<string, any>;
}

// Конфигурация для CCXT Server
export interface CCXTServerConfig {
  serverUrl: string;
  privateKey: string;
  exchangeId: string;
  timeout?: number;
}

// Кастомная конфигурация для других провайдеров
export interface CustomProviderConfig {
  schema: Record<string, any>;
  endpoints: Record<string, string>;
  authentication?: Record<string, any>;
}

// Конкретные типы поставщиков
export interface CCXTBrowserProvider extends BaseDataProvider {
  type: 'ccxt-browser';
  config: CCXTBrowserConfig;
}

export interface CCXTServerProvider extends BaseDataProvider {
  type: 'ccxt-server';
  config: CCXTServerConfig;
}

export interface CustomProvider extends BaseDataProvider {
  type: 'custom';
  config: CustomProviderConfig;
}

// Объединенный тип поставщика
export type DataProvider = CCXTBrowserProvider | CCXTServerProvider | CustomProvider;

// Интерфейс для WebSocket соединения
export interface WebSocketConnection {
  key: string; // строковое представление ConnectionKey
  ws: WebSocket | null;
  status: ConnectionStatus;
  subscriptions: Set<string>; // ID подписок
  reconnectAttempts: number;
  lastPing: number;
  provider: DataProvider;
}

// Состояние данных по подпискам
export interface DataState<T> {
  data: T | null;
  lastUpdate: number;
  loading: boolean;
  error?: string;
}

// Обобщенный интерфейс для данных по подпискам
export interface SubscriptionData {
  candles: Record<string, DataState<Candle[]>>;
  trades: Record<string, DataState<Trade[]>>;
  orderbook: Record<string, DataState<OrderBook>>;
}

// Параметры для создания подписки
export interface CreateSubscriptionParams {
  symbol: string;
  dataType: DataType;
  exchange: string;
  dashboardId: string;
  widgetId: string;
  providerId: string;
}

// Результат операции с провайдером
export interface ProviderOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Добавляю новые типы в начало файла после существующих импортов и базовых типов
export type DataFetchMethod = 'rest' | 'websocket';

export interface DataFetchSettings {
  method: DataFetchMethod;
  restIntervals: {
    trades: number; // milliseconds
    candles: number; // milliseconds  
    orderbook: number; // milliseconds
  };
}

export interface SubscriptionKey {
  exchange: string;
  symbol: string;
  dataType: DataType;
}

export interface ActiveSubscription {
  key: SubscriptionKey;
  subscriberCount: number;
  method: DataFetchMethod;
  isFallback?: boolean; // true если REST используется как fallback от WebSocket
  isActive: boolean;
  lastUpdate: number;
  intervalId?: number; // для REST интервалов
  wsConnection?: WebSocket; // для WebSocket соединений
}

export interface RestCycleManager {
  intervalId: number;
  exchange: string;
  symbol: string;
  dataType: DataType;
  interval: number;
  lastFetch: number;
  subscriberIds: Set<string>;
} 