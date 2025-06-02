import { useEffect, useCallback, useMemo } from 'react';
import { useDataProviderStore } from '../store/dataProviderStore';
import { 
  DataType, 
  Candle, 
  Trade, 
  OrderBook, 
  CreateSubscriptionParams,
  DataState
} from '../types/dataProviders';

// Хук для использования данных свечей
export const useCandles = (
  symbol: string,
  exchange: string,
  providerId?: string,
  dashboardId: string = 'default',
  widgetId: string = 'default'
) => {
  const {
    data,
    createSubscription,
    removeSubscription,
    providers,
    activeProviderId
  } = useDataProviderStore();

  const actualProviderId = providerId || activeProviderId;
  const dataKey = `${exchange}-${symbol}`;
  const candleData = data.candles[dataKey];

  const subscriptionId = useMemo(() => 
    actualProviderId ? `${actualProviderId}-${exchange}-${symbol}-candles-${dashboardId}-${widgetId}` : null,
    [actualProviderId, exchange, symbol, dashboardId, widgetId]
  );

  const subscribe = useCallback(async () => {
    if (!actualProviderId || !subscriptionId) return;
    
    try {
      const params: CreateSubscriptionParams = {
        symbol,
        dataType: 'candles',
        exchange,
        dashboardId,
        widgetId,
        providerId: actualProviderId
      };

      return await createSubscription(params);
    } catch (error) {
      console.error('🛡️ Безопасный перехват ошибки подписки на candles:', error);
      return { success: false, error: `Subscription error: ${error}` };
    }
  }, [actualProviderId, symbol, exchange, dashboardId, widgetId, subscriptionId, createSubscription]);

  const unsubscribe = useCallback(() => {
    if (subscriptionId) {
      removeSubscription(subscriptionId);
    }
  }, [subscriptionId, removeSubscription]);

  // Автоматическая подписка/отписка
  useEffect(() => {
    if (actualProviderId && subscriptionId) {
      subscribe();
      return () => unsubscribe();
    }
  }, [actualProviderId, subscriptionId]);

  return {
    data: candleData?.data || null,
    loading: candleData?.loading || false,
    error: candleData?.error || null,
    lastUpdate: candleData?.lastUpdate || 0,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscriptionId && !!candleData
  };
};

// Хук для использования данных сделок
export const useTrades = (
  symbol: string,
  exchange: string,
  providerId?: string,
  dashboardId: string = 'default',
  widgetId: string = 'default'
) => {
  const {
    data,
    createSubscription,
    removeSubscription,
    providers,
    activeProviderId
  } = useDataProviderStore();

  const actualProviderId = providerId || activeProviderId;
  const dataKey = `${exchange}-${symbol}`;
  const tradeData = data.trades[dataKey];

  const subscriptionId = useMemo(() => 
    actualProviderId ? `${actualProviderId}-${exchange}-${symbol}-trades-${dashboardId}-${widgetId}` : null,
    [actualProviderId, exchange, symbol, dashboardId, widgetId]
  );

  const subscribe = useCallback(async () => {
    if (!actualProviderId || !subscriptionId) return;
    
    const params: CreateSubscriptionParams = {
      symbol,
      dataType: 'trades',
      exchange,
      dashboardId,
      widgetId,
      providerId: actualProviderId
    };

    return await createSubscription(params);
  }, [actualProviderId, symbol, exchange, dashboardId, widgetId, subscriptionId, createSubscription]);

  const unsubscribe = useCallback(() => {
    if (subscriptionId) {
      removeSubscription(subscriptionId);
    }
  }, [subscriptionId, removeSubscription]);

  useEffect(() => {
    if (actualProviderId && subscriptionId) {
      subscribe();
      return () => unsubscribe();
    }
  }, [actualProviderId, subscriptionId]);

  return {
    data: tradeData?.data || null,
    loading: tradeData?.loading || false,
    error: tradeData?.error || null,
    lastUpdate: tradeData?.lastUpdate || 0,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscriptionId && !!tradeData
  };
};

// Хук для использования данных книги заказов
export const useOrderBook = (
  symbol: string,
  exchange: string,
  providerId?: string,
  dashboardId: string = 'default',
  widgetId: string = 'default'
) => {
  const {
    data,
    createSubscription,
    removeSubscription,
    providers,
    activeProviderId
  } = useDataProviderStore();

  const actualProviderId = providerId || activeProviderId;
  const dataKey = `${exchange}-${symbol}`;
  const orderBookData = data.orderbook[dataKey];

  const subscriptionId = useMemo(() => 
    actualProviderId ? `${actualProviderId}-${exchange}-${symbol}-orderbook-${dashboardId}-${widgetId}` : null,
    [actualProviderId, exchange, symbol, dashboardId, widgetId]
  );

  const subscribe = useCallback(async () => {
    if (!actualProviderId || !subscriptionId) return;
    
    const params: CreateSubscriptionParams = {
      symbol,
      dataType: 'orderbook',
      exchange,
      dashboardId,
      widgetId,
      providerId: actualProviderId
    };

    return await createSubscription(params);
  }, [actualProviderId, symbol, exchange, dashboardId, widgetId, subscriptionId, createSubscription]);

  const unsubscribe = useCallback(() => {
    if (subscriptionId) {
      removeSubscription(subscriptionId);
    }
  }, [subscriptionId, removeSubscription]);

  useEffect(() => {
    if (actualProviderId && subscriptionId) {
      subscribe();
      return () => unsubscribe();
    }
  }, [actualProviderId, subscriptionId]);

  return {
    data: orderBookData?.data || null,
    loading: orderBookData?.loading || false,
    error: orderBookData?.error || null,
    lastUpdate: orderBookData?.lastUpdate || 0,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscriptionId && !!orderBookData
  };
};

// Комбинированный хук для использования всех типов данных
export const useMarketData = (
  symbol: string,
  exchange: string,
  dataTypes: DataType[],
  providerId?: string,
  dashboardId: string = 'default',
  widgetId: string = 'default'
) => {
  const candles = useCandles(
    symbol, 
    exchange, 
    providerId, 
    dashboardId, 
    dataTypes.includes('candles') ? `${widgetId}-candles` : ''
  );
  
  const trades = useTrades(
    symbol, 
    exchange, 
    providerId, 
    dashboardId, 
    dataTypes.includes('trades') ? `${widgetId}-trades` : ''
  );
  
  const orderbook = useOrderBook(
    symbol, 
    exchange, 
    providerId, 
    dashboardId, 
    dataTypes.includes('orderbook') ? `${widgetId}-orderbook` : ''
  );

  const loading = (dataTypes.includes('candles') && candles.loading) ||
                  (dataTypes.includes('trades') && trades.loading) ||
                  (dataTypes.includes('orderbook') && orderbook.loading);

  const error = candles.error || trades.error || orderbook.error;

  const lastUpdate = Math.max(
    dataTypes.includes('candles') ? candles.lastUpdate : 0,
    dataTypes.includes('trades') ? trades.lastUpdate : 0,
    dataTypes.includes('orderbook') ? orderbook.lastUpdate : 0
  );

  return {
    candles: dataTypes.includes('candles') ? candles : null,
    trades: dataTypes.includes('trades') ? trades : null,
    orderbook: dataTypes.includes('orderbook') ? orderbook : null,
    loading,
    error,
    lastUpdate
  };
};

// Хук для получения списка поставщиков
export const useDataProviders = () => {
  const {
    providers,
    activeProviderId,
    setActiveProvider,
    addProvider,
    removeProvider,
    initializeProvider,
    loading
  } = useDataProviderStore();

  const providerList = useMemo(() => Object.values(providers), [providers]);
  const activeProvider = activeProviderId ? providers[activeProviderId] : null;

  return {
    providers: providerList,
    activeProvider,
    activeProviderId,
    setActiveProvider,
    addProvider,
    removeProvider,
    initializeProvider,
    loading
  };
};

// Хук для получения информации о соединениях
export const useConnectionStats = () => {
  const {
    connectionStats,
    connections,
    subscriptions,
    getActiveSubscriptions,
    closeConnection
  } = useDataProviderStore();

  const stats = useMemo(() => {
    const connectionList = Object.values(connectionStats);
    const subscriptionList = getActiveSubscriptions();
    
    return {
      total: connectionList.length,
      connected: connectionList.filter(c => c.status === 'connected').length,
      connecting: connectionList.filter(c => c.status === 'connecting').length,
      error: connectionList.filter(c => c.status === 'error').length,
      disconnected: connectionList.filter(c => c.status === 'disconnected').length,
      totalSubscriptions: subscriptionList.length,
      connections: connectionList,
      subscriptions: subscriptionList
    };
  }, [connectionStats, getActiveSubscriptions]);

  return {
    ...stats,
    closeConnection
  };
};

// Хук для проверки доступности биржи
export const useExchangeSupport = (exchangeId: string) => {
  const { providers } = useDataProviderStore();
  
  return useMemo(() => {
    const supportingProviders = Object.values(providers).filter(provider => {
      if (provider.type === 'ccxt-browser' || provider.type === 'ccxt-server') {
        return provider.config.exchangeId === exchangeId;
      }
      return false;
    });

    return {
      isSupported: supportingProviders.length > 0,
      providers: supportingProviders,
      count: supportingProviders.length
    };
  }, [providers, exchangeId]);
}; 