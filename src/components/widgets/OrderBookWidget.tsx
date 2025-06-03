import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useDataProviderStoreV2 } from '../../store/dataProviderStoreV2';
import { OrderBook, OrderBookEntry } from '../../types/dataProviders';
import { BookOpen, TrendingUp, TrendingDown, DollarSign, BarChart } from 'lucide-react';

interface OrderBookWidgetV2Props {
  dashboardId?: string;
  widgetId?: string;
  initialExchange?: string;
  initialSymbol?: string;
}

const OrderBookWidgetV2Inner: React.FC<OrderBookWidgetV2Props> = ({
  dashboardId = 'default',
  widgetId = 'orderbook-widget-v2',
  initialExchange = 'binance',
  initialSymbol = 'BTC/USDT'
}) => {
  const { 
    subscribe, 
    unsubscribe, 
    getOrderBook, 
    providers,
    activeProviderId,
    dataFetchSettings,
    getActiveSubscriptionsList
  } = useDataProviderStoreV2();

  // Состояние настроек
  const [exchange, setExchange] = useState(initialExchange);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Настройки отображения
  const [displayDepth, setDisplayDepth] = useState(10);
  const [showCumulative, setShowCumulative] = useState(true);
  const [priceDecimals, setPriceDecimals] = useState(2);
  const [amountDecimals, setAmountDecimals] = useState(4);

  // Получаем данные из store (автоматически обновляются)
  const rawOrderBook = getOrderBook(exchange, symbol);
  const activeSubscriptions = getActiveSubscriptionsList();
  
  // Проверяем есть ли активная подписка для текущих exchange/symbol
  const currentSubscriptionKey = `${exchange}:${symbol}:orderbook`;
  const currentSubscription = activeSubscriptions.find(sub => 
    sub.key.exchange === exchange && 
    sub.key.symbol === symbol && 
    sub.key.dataType === 'orderbook'
  );

  // Обработка и форматирование данных orderbook
  const processedOrderBook = useMemo(() => {
    if (!rawOrderBook) return null;

    try {
      // Проверяем, что данные в правильном формате
      if (!rawOrderBook.bids || !rawOrderBook.asks || 
          !Array.isArray(rawOrderBook.bids) || !Array.isArray(rawOrderBook.asks)) {
        console.warn('❌ Invalid orderbook data format:', rawOrderBook);
        return null;
      }

      // Логируем формат первой записи для отладки
      if (rawOrderBook.bids.length > 0) {
        const firstBid = rawOrderBook.bids[0];
        console.log(`📊 OrderBook format sample - bid:`, {
          isArray: Array.isArray(firstBid),
          type: typeof firstBid,
          value: firstBid
        });
      }

      const formatEntry = (entry: OrderBookEntry | [number, number]) => {
        // Обрабатываем формат массива [price, amount] от CCXT Pro
        if (Array.isArray(entry)) {
          const [price, amount] = entry;
          if (typeof price !== 'number' || typeof amount !== 'number') {
            console.warn('❌ Invalid orderbook array entry:', entry);
            return null;
          }
          return {
            price,
            amount,
            total: price * amount
          };
        }
        
        // Обрабатываем формат объекта {price, amount}
        if (!entry || typeof entry.price !== 'number' || typeof entry.amount !== 'number') {
          console.warn('❌ Invalid orderbook object entry:', entry);
          return null;
        }
        return {
          price: entry.price,
          amount: entry.amount,
          total: entry.price * entry.amount
        };
      };

      // Берем только нужную глубину и фильтруем null значения
      const bids = (rawOrderBook.bids as (OrderBookEntry | [number, number])[]).slice(0, displayDepth).map(formatEntry).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
      const asks = (rawOrderBook.asks as (OrderBookEntry | [number, number])[]).slice(0, displayDepth).map(formatEntry).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    // Добавляем кумулятивные объемы если нужно
    if (showCumulative) {
      let bidsCumulative = 0;
      let asksCumulative = 0;

      bids.forEach(bid => {
        bidsCumulative += bid.amount;
        (bid as any).cumulative = bidsCumulative;
      });

      asks.forEach(ask => {
        asksCumulative += ask.amount;
        (ask as any).cumulative = asksCumulative;
      });
    }

      return {
        bids,
        asks,
        timestamp: rawOrderBook.timestamp,
        spread: asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : 0,
        spreadPercent: asks.length > 0 && bids.length > 0 
          ? ((asks[0].price - bids[0].price) / bids[0].price) * 100 
          : 0
      };
    } catch (error) {
      console.error('❌ Error processing orderbook data:', error);
      return null;
    }
  }, [rawOrderBook, displayDepth, showCumulative]);

  // Статистика
  const stats = useMemo(() => {
    if (!processedOrderBook) {
      return { 
        bidVolume: 0, 
        askVolume: 0, 
        bidCount: 0, 
        askCount: 0,
        totalVolume: 0,
        bestBid: 0,
        bestAsk: 0
      };
    }

    const bidVolume = processedOrderBook.bids.reduce((sum, bid) => sum + bid.total, 0);
    const askVolume = processedOrderBook.asks.reduce((sum, ask) => sum + ask.total, 0);
    const bestBid = processedOrderBook.bids.length > 0 ? processedOrderBook.bids[0].price : 0;
    const bestAsk = processedOrderBook.asks.length > 0 ? processedOrderBook.asks[0].price : 0;

    return { 
      bidVolume, 
      askVolume, 
      bidCount: processedOrderBook.bids.length,
      askCount: processedOrderBook.asks.length,
      totalVolume: bidVolume + askVolume,
      bestBid,
      bestAsk
    };
  }, [processedOrderBook]);

  // Автоматическая подписка на данные (store сам управляет методом получения)
  useEffect(() => {
    if (isSubscribed && activeProviderId) {
      const subscriberId = `${dashboardId}-${widgetId}`;
      
      // Просто подписываемся - store сам решит использовать REST или WebSocket
      subscribe(subscriberId, exchange, symbol, 'orderbook');
      console.log(`📊 OrderBook виджет подписался на данные: ${exchange} ${symbol} (метод: ${dataFetchSettings.method})`);

      return () => {
        unsubscribe(subscriberId, exchange, symbol, 'orderbook');
        console.log(`📊 OrderBook виджет отписался от данных: ${exchange} ${symbol}`);
      };
    }
  }, [isSubscribed, exchange, symbol, activeProviderId, subscribe, unsubscribe, dashboardId, widgetId, dataFetchSettings.method]);

  const handleSubscribe = async () => {
    if (!activeProviderId) {
      console.error('❌ Нет активного провайдера');
      return;
    }

    try {
      setIsSubscribed(true);
      console.log(`🚀 Запуск подписки на orderbook: ${exchange} ${symbol}`);
    } catch (error) {
      console.error('❌ Ошибка подписки на orderbook:', error);
      setIsSubscribed(false);
    }
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    console.log(`🛑 Остановка подписки на orderbook: ${exchange} ${symbol}`);
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(priceDecimals);
  };

  const formatAmount = (amount: number): string => {
    return amount.toFixed(amountDecimals);
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M';
    if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K';
    return volume.toFixed(2);
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Книга заказов {isSubscribed && <span className="text-green-500 text-sm">(🔴 LIVE)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Настройки подключения */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm">Биржа</Label>
              <Input
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                placeholder="binance"
                disabled={isSubscribed}
              />
            </div>
            <div>
              <Label className="text-sm">Торговая пара</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTC/USDT"
                disabled={isSubscribed}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSubscribed ? (
              <Button onClick={handleSubscribe} className="flex-1" disabled={!activeProviderId}>
                {activeProviderId ? 'Подписаться на orderbook' : 'Нет активного провайдера'}
              </Button>
            ) : (
              <Button onClick={handleUnsubscribe} variant="destructive" className="flex-1">
                Отписаться
              </Button>
            )}
          </div>

          {isSubscribed && currentSubscription && (
            <div className={`text-xs p-2 rounded space-y-1 ${
              currentSubscription.isFallback 
                ? 'text-orange-700 bg-orange-50 border border-orange-200' 
                : 'text-gray-500 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <span>
                  📡 Метод получения: <strong>
                    {currentSubscription.method === 'websocket' 
                      ? 'WebSocket (реальное время)' 
                      : currentSubscription.isFallback 
                        ? '🔄 REST (fallback от WebSocket)'
                        : 'REST (интервальный)'
                    }
                  </strong>
                </span>
                <span className={`w-2 h-2 rounded-full ${currentSubscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </div>
              
              {currentSubscription.isFallback && (
                <div className="text-orange-600 bg-orange-100 p-1 rounded text-xs">
                  ⚠️ WebSocket недоступен для этой биржи/пары, используется REST как резервный метод
                </div>
              )}
              
              {currentSubscription.method === 'rest' && (
                <div>⏱️ Интервал обновления: <strong>{dataFetchSettings.restIntervals.orderbook}ms</strong></div>
              )}
              <div>👥 Подписчиков на эти данные: <strong>{currentSubscription.subscriberCount}</strong></div>
              {currentSubscription.lastUpdate > 0 && (
                <div>🕐 Последнее обновление: <strong>{formatTime(currentSubscription.lastUpdate)}</strong></div>
              )}

              {/* Отображаем используемый CCXT метод */}
              {currentSubscription.ccxtMethod && (
                <div className="text-xs bg-blue-100 p-1 rounded">
                  🔧 CCXT метод: <strong>{currentSubscription.ccxtMethod}</strong>
                  {currentSubscription.ccxtMethod === 'watchOrderBookForSymbols' && ' (⚡ diff обновления)'}
                  {currentSubscription.ccxtMethod === 'watchOrderBook' && ' (📋 полные снепшоты)'}
                  {currentSubscription.ccxtMethod === 'fetchOrderBook' && ' (🔄 REST запросы)'}
                </div>
              )}
            </div>
          )}
          
          {isSubscribed && !currentSubscription && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ Подписка создается... Ожидайте подключения.
            </div>
          )}
        </div>

        <Separator />

        {/* Настройки отображения */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Настройки отображения</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Глубина</Label>
              <Select value={displayDepth.toString()} onValueChange={(value) => setDisplayDepth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 уровней</SelectItem>
                  <SelectItem value="10">10 уровней</SelectItem>
                  <SelectItem value="20">20 уровней</SelectItem>
                  <SelectItem value="50">50 уровней</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Знаков цены</Label>
              <Select value={priceDecimals.toString()} onValueChange={(value) => setPriceDecimals(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Знаков объема</Label>
              <Select value={amountDecimals.toString()} onValueChange={(value) => setAmountDecimals(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="show-cumulative"
                checked={showCumulative}
                onChange={(e) => setShowCumulative(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show-cumulative" className="text-xs">Накопительный объем</Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Статистика */}
        {processedOrderBook && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Статистика</Label>
            
            {/* Спред */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs text-gray-600 mb-1">Спред</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{formatPrice(processedOrderBook.spread)}</span>
                <span className="text-xs text-gray-500">
                  {processedOrderBook.spreadPercent.toFixed(4)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded">
                <div className="flex items-center gap-1 text-green-700">
                  <TrendingUp className="h-3 w-3" />
                  <span>Заявки на покупку</span>
                </div>
                <div className="font-mono">{stats.bidCount} уровней</div>
                <div className="font-mono text-green-600">{formatVolume(stats.bidVolume)}</div>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="flex items-center gap-1 text-red-700">
                  <TrendingDown className="h-3 w-3" />
                  <span>Заявки на продажу</span>
                </div>
                <div className="font-mono">{stats.askCount} уровней</div>
                <div className="font-mono text-red-600">{formatVolume(stats.askVolume)}</div>
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center gap-1 text-blue-700 text-xs mb-1">
                <BarChart className="h-3 w-3" />
                <span>Лучшие цены</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Bid: {formatPrice(stats.bestBid)}</span>
                <span className="text-red-600">Ask: {formatPrice(stats.bestAsk)}</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* OrderBook */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Книга заказов</Label>
          
          {!processedOrderBook ? (
            <div className="text-center text-gray-400 py-4">
              {isSubscribed ? 'Ожидание данных...' : 'Подпишитесь для получения данных orderbook'}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Заголовки */}
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 px-2">
                <div>Цена</div>
                <div className="text-right">Объем</div>
                <div className="text-right">{showCumulative ? 'Накопл.' : 'Сумма'}</div>
              </div>

              {/* Asks (продажи) - сверху */}
              <div className="max-h-32 overflow-y-auto">
                {processedOrderBook.asks.slice().reverse().map((ask, index) => (
                  <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-xs p-1 bg-red-50 border-l-2 border-red-500">
                    <div className="font-mono text-red-600">{formatPrice(ask.price)}</div>
                    <div className="font-mono text-right">{formatAmount(ask.amount)}</div>
                    <div className="font-mono text-right text-gray-600">
                      {showCumulative ? formatAmount((ask as any).cumulative || 0) : formatVolume(ask.total)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Спред */}
              <div className="bg-gray-100 p-2 text-center">
                <div className="text-xs text-gray-600">Спред: {formatPrice(processedOrderBook.spread)}</div>
                <div className="text-xs text-gray-500">({processedOrderBook.spreadPercent.toFixed(4)}%)</div>
              </div>

              {/* Bids (покупки) - снизу */}
              <div className="max-h-32 overflow-y-auto">
                {processedOrderBook.bids.map((bid, index) => (
                  <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-xs p-1 bg-green-50 border-l-2 border-green-500">
                    <div className="font-mono text-green-600">{formatPrice(bid.price)}</div>
                    <div className="font-mono text-right">{formatAmount(bid.amount)}</div>
                    <div className="font-mono text-right text-gray-600">
                      {showCumulative ? formatAmount((bid as any).cumulative || 0) : formatVolume(bid.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isSubscribed && (
          <div className="text-xs text-gray-400 text-center pt-2 border-t">
            💡 Виджет автоматически дедуплицирует подписки - если несколько виджетов запрашивают те же данные, создается только одно соединение.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const OrderBookWidgetV2: React.FC<OrderBookWidgetV2Props> = (props) => {
  return (
    <ErrorBoundary>
      <OrderBookWidgetV2Inner {...props} />
    </ErrorBoundary>
  );
}; 