import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { useDataProviderStoreV2 } from '../../store/dataProviderStoreV2';
import { Trade } from '../../types/dataProviders';
import { Activity, Filter, ArrowUp, ArrowDown, DollarSign, Hash, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface TradesWidgetV2Props {
  dashboardId?: string;
  widgetId?: string;
  initialExchange?: string;
  initialSymbol?: string;
}

const TradesWidgetV2Inner: React.FC<TradesWidgetV2Props> = ({
  dashboardId = 'default',
  widgetId = 'trades-widget-v2',
  initialExchange = 'binance',
  initialSymbol = 'BTC/USDT'
}) => {
  const { 
    subscribe, 
    unsubscribe, 
    getTrades, 
    providers,
    activeProviderId,
    dataFetchSettings,
    getActiveSubscriptionsList
  } = useDataProviderStoreV2();

  // Состояние настроек
  const [exchange, setExchange] = useState(initialExchange);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Состояние фильтров
  const [filters, setFilters] = useState({
    side: 'all', // 'all', 'buy', 'sell'
    minPrice: '',
    maxPrice: '',
    minAmount: '',
    maxAmount: '',
    showLastN: '100'
  });

  // Состояние сортировки
  const [sortBy, setSortBy] = useState<'timestamp' | 'price' | 'amount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Состояние отображения
  const [autoScroll, setAutoScroll] = useState(true);

  // Получаем данные из store (автоматически обновляются)
  const rawTrades = getTrades(exchange, symbol);
  const activeSubscriptions = getActiveSubscriptionsList();
  
  // Проверяем есть ли активная подписка для текущих exchange/symbol
  const currentSubscriptionKey = `${exchange}:${symbol}:trades`;
  const currentSubscription = activeSubscriptions.find(sub => 
    sub.key.exchange === exchange && 
    sub.key.symbol === symbol && 
    sub.key.dataType === 'trades'
  );

  // Применяем фильтры и сортировку
  const processedTrades = useMemo(() => {
    let filtered = [...rawTrades];

    // Фильтр по стороне сделки
    if (filters.side !== 'all') {
      filtered = filtered.filter(trade => trade.side === filters.side);
    }

    // Фильтр по цене
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(trade => trade.price >= minPrice);
      }
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(trade => trade.price <= maxPrice);
      }
    }

    // Фильтр по объему
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter(trade => trade.amount >= minAmount);
      }
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        filtered = filtered.filter(trade => trade.amount <= maxAmount);
      }
    }

    // Сортировка
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Ограничиваем количество отображаемых сделок
    const limit = parseInt(filters.showLastN);
    if (!isNaN(limit) && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [rawTrades, filters, sortBy, sortOrder]);

  // Статистика по отфильтрованным данным
  const stats = useMemo(() => {
    if (processedTrades.length === 0) {
      return { totalAmount: 0, totalVolume: 0, avgPrice: 0, buyCount: 0, sellCount: 0 };
    }

    const totalAmount = processedTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const totalVolume = processedTrades.reduce((sum, trade) => sum + (trade.price * trade.amount), 0);
    const avgPrice = totalVolume / totalAmount;
    const buyCount = processedTrades.filter(trade => trade.side === 'buy').length;
    const sellCount = processedTrades.filter(trade => trade.side === 'sell').length;

    return { totalAmount, totalVolume, avgPrice, buyCount, sellCount };
  }, [processedTrades]);

  // Автоматическая подписка на данные (store сам управляет методом получения)
  useEffect(() => {
    if (isSubscribed && activeProviderId) {
      const subscriberId = `${dashboardId}-${widgetId}`;
      
      // Просто подписываемся - store сам решит использовать REST или WebSocket
      subscribe(subscriberId, exchange, symbol, 'trades');
      console.log(`📊 Виджет подписался на данные: ${exchange} ${symbol} (метод: ${dataFetchSettings.method})`);

      return () => {
        unsubscribe(subscriberId, exchange, symbol, 'trades');
        console.log(`📊 Виджет отписался от данных: ${exchange} ${symbol}`);
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
      console.log(`🚀 Запуск подписки на trades: ${exchange} ${symbol}`);
    } catch (error) {
      console.error('❌ Ошибка подписки на trades:', error);
      setIsSubscribed(false);
    }
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    console.log(`🛑 Остановка подписки на trades: ${exchange} ${symbol}`);
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(8).replace(/\.?0+$/, '');
  };

  const formatAmount = (amount: number): string => {
    return amount.toFixed(8).replace(/\.?0+$/, '');
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M';
    if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K';
    return volume.toFixed(2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Лента сделок {isSubscribed && <span className="text-green-500 text-sm">(🔴 LIVE)</span>}
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
                {activeProviderId ? 'Подписаться на сделки' : 'Нет активного провайдера'}
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
                <div>⏱️ Интервал обновления: <strong>{dataFetchSettings.restIntervals.trades}ms</strong></div>
              )}
              <div>👥 Подписчиков на эти данные: <strong>{currentSubscription.subscriberCount}</strong></div>
              {currentSubscription.lastUpdate > 0 && (
                <div>🕐 Последнее обновление: <strong>{new Date(currentSubscription.lastUpdate).toLocaleTimeString()}</strong></div>
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

        {/* Фильтры */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Фильтры</Label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Сторона</Label>
              <Select value={filters.side} onValueChange={(value) => setFilters(prev => ({ ...prev, side: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="buy">Покупка</SelectItem>
                  <SelectItem value="sell">Продажа</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Показать последние</Label>
              <Input
                type="number"
                value={filters.showLastN}
                onChange={(e) => setFilters(prev => ({ ...prev, showLastN: e.target.value }))}
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Мин. цена</Label>
              <Input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs">Макс. цена</Label>
              <Input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="Без ограничений"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Мин. объем</Label>
              <Input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs">Макс. объем</Label>
              <Input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                placeholder="Без ограничений"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Сортировка */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Сортировка</Label>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">По времени</SelectItem>
                <SelectItem value="price">По цене</SelectItem>
                <SelectItem value="amount">По объему</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto-scroll"
            checked={autoScroll}
            onCheckedChange={setAutoScroll}
          />
          <Label htmlFor="auto-scroll" className="text-sm">Автопрокрутка к новым сделкам</Label>
        </div>

        <Separator />

        {/* Статистика */}
        {processedTrades.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Статистика ({processedTrades.length} сделок)</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span>Всего объем:</span>
                </div>
                <div className="font-mono">{formatAmount(stats.totalAmount)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Общая сумма:</span>
                </div>
                <div className="font-mono">{formatVolume(stats.totalVolume)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Покупки:</span>
                </div>
                <div className="font-mono">{stats.buyCount}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>Продажи:</span>
                </div>
                <div className="font-mono">{stats.sellCount}</div>
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-blue-700">
                💰 Средняя цена: <span className="font-mono">{formatPrice(stats.avgPrice)}</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Список сделок */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Сделки</Label>
            <div className="text-xs text-gray-500">
              {rawTrades.length} всего / {processedTrades.length} отфильтровано
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {processedTrades.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                {isSubscribed ? 'Ожидание данных...' : 'Подпишитесь для получения данных о сделках'}
              </div>
            ) : (
              processedTrades.map((trade, index) => (
                <div
                  key={`${trade.id || index}-${trade.timestamp}`}
                  className={`flex items-center justify-between text-xs p-2 rounded ${
                    trade.side === 'buy' 
                      ? 'bg-green-50 border-l-2 border-green-500' 
                      : 'bg-red-50 border-l-2 border-red-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="font-mono text-gray-600">{formatTime(trade.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono font-medium">
                      {formatPrice(trade.price)} × {formatAmount(trade.amount)}
                    </div>
                    <div className="text-gray-500">
                      ≈ {formatVolume(trade.price * trade.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

export const TradesWidgetV2: React.FC<TradesWidgetV2Props> = (props) => {
  return (
    <ErrorBoundary>
      <TradesWidgetV2Inner {...props} />
    </ErrorBoundary>
  );
}; 