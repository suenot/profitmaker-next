import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTrades, useDataProviders } from '../../hooks/useDataProvider';
import { formatPrice, formatVolume, formatTimestamp } from '../../utils/formatters';
import { Trade } from '../../types/dataProviders';
import { 
  ArrowUpDown, 
  Activity, 
  Clock, 
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Settings,
  Filter,
  Volume2
} from 'lucide-react';

interface TradesWidgetProps {
  dashboardId?: string;
  widgetId?: string;
  initialSymbol?: string;
  initialExchange?: string;
  maxTrades?: number;
  showSettings?: boolean;
  showFilters?: boolean;
}

type TradeFilter = 'all' | 'buy' | 'sell';
type SortOrder = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'volume-asc' | 'volume-desc';

const TradesWidgetInner: React.FC<TradesWidgetProps> = ({
  dashboardId = 'default',
  widgetId = 'trades-widget',
  initialSymbol = 'BTC/USDT',
  initialExchange = 'binance',
  maxTrades = 50,
  showSettings = true,
  showFilters = true
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [exchange, setExchange] = useState(initialExchange);
  const [limit, setLimit] = useState(maxTrades);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Фильтры
  const [sideFilter, setSideFilter] = useState<TradeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minVolume, setMinVolume] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);

  const { activeProvider } = useDataProviders();

  const trades = useTrades(
    symbol, 
    exchange, 
    undefined, 
    dashboardId, 
    widgetId
  );

  // Фильтрация и сортировка сделок
  const filteredAndSortedTrades = useMemo(() => {
    if (!trades.data) return [];

    let filtered = [...trades.data];

    // Фильтр по стороне сделки
    if (sideFilter !== 'all') {
      filtered = filtered.filter(trade => trade.side === sideFilter);
    }

    // Фильтр по цене
    if (minPrice) {
      const minPriceNum = parseFloat(minPrice);
      if (!isNaN(minPriceNum)) {
        filtered = filtered.filter(trade => trade.price >= minPriceNum);
      }
    }
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      if (!isNaN(maxPriceNum)) {
        filtered = filtered.filter(trade => trade.price <= maxPriceNum);
      }
    }

    // Фильтр по объему
    if (minVolume) {
      const minVolumeNum = parseFloat(minVolume);
      if (!isNaN(minVolumeNum)) {
        filtered = filtered.filter(trade => trade.amount >= minVolumeNum);
      }
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'volume-asc':
          return a.amount - b.amount;
        case 'volume-desc':
          return b.amount - a.amount;
        default:
          return b.timestamp - a.timestamp;
      }
    });

    // Ограничиваем количество
    return filtered.slice(0, limit);
  }, [trades.data, sideFilter, sortOrder, minPrice, maxPrice, minVolume, limit]);

  // Статистика по отфильтрованным сделкам
  const stats = useMemo(() => {
    if (!filteredAndSortedTrades.length) {
      return { buyCount: 0, sellCount: 0, totalVolume: 0, avgPrice: 0 };
    }

    const buyTrades = filteredAndSortedTrades.filter(t => t.side === 'buy');
    const sellTrades = filteredAndSortedTrades.filter(t => t.side === 'sell');
    const totalVolume = filteredAndSortedTrades.reduce((sum, t) => sum + t.amount, 0);
    const totalValue = filteredAndSortedTrades.reduce((sum, t) => sum + (t.price * t.amount), 0);
    const avgPrice = totalVolume > 0 ? totalValue / totalVolume : 0;

    return {
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      totalVolume,
      avgPrice
    };
  }, [filteredAndSortedTrades]);

  const getConnectionStatusIcon = () => {
    if (trades.loading) return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
    if (trades.isSubscribed) return <Wifi className="h-4 w-4 text-green-500" />;
    return <WifiOff className="h-4 w-4 text-gray-500" />;
  };

  const clearFilters = () => {
    setSideFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setMinVolume('');
    setSortOrder('newest');
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getConnectionStatusIcon()}
            <ArrowUpDown className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Лента сделок</h2>
          </div>
          <Badge variant="outline">{symbol}</Badge>
          <Badge variant="secondary">{exchange}</Badge>
          <Badge variant="outline" className="text-xs">
            {filteredAndSortedTrades.length} сделок
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {activeProvider && (
            <Badge variant="outline" className="text-xs">
              {activeProvider.name}
            </Badge>
          )}
          {showFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
          {showSettings && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Панель настроек */}
      {showSettingsPanel && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Торговая пара</Label>
                <Input
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="BTC/USDT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange">Биржа</Label>
                <Input
                  id="exchange"
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  placeholder="binance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Максимум сделок</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                  min={10}
                  max={500}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
              <Label htmlFor="auto-scroll">Автопрокрутка к новым сделкам</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Панель фильтров */}
      {showFiltersPanel && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="side-filter">Сторона</Label>
                  <Select value={sideFilter} onValueChange={(value: TradeFilter) => setSideFilter(value)}>
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
                <div className="space-y-2">
                  <Label htmlFor="sort-order">Сортировка</Label>
                  <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Сначала новые</SelectItem>
                      <SelectItem value="oldest">Сначала старые</SelectItem>
                      <SelectItem value="price-asc">Цена ↑</SelectItem>
                      <SelectItem value="price-desc">Цена ↓</SelectItem>
                      <SelectItem value="volume-asc">Объем ↑</SelectItem>
                      <SelectItem value="volume-desc">Объем ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-price">Мин. цена</Label>
                  <Input
                    id="min-price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-price">Макс. цена</Label>
                  <Input
                    id="max-price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label htmlFor="min-volume">Мин. объем</Label>
                  <Input
                    id="min-volume"
                    type="number"
                    value={minVolume}
                    onChange={(e) => setMinVolume(e.target.value)}
                    placeholder="0"
                    className="w-32"
                  />
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистика */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">{stats.buyCount}</p>
              <p className="text-xs text-muted-foreground">Покупок</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">{stats.sellCount}</p>
              <p className="text-xs text-muted-foreground">Продаж</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{formatVolume(stats.totalVolume)}</p>
              <p className="text-xs text-muted-foreground">Общий объем</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatPrice(stats.avgPrice)}</p>
              <p className="text-xs text-muted-foreground">Средняя цена</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Лента сделок */}
      <Card>
        <CardContent className="p-0">
          {trades.loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground p-8">
              <Activity className="h-4 w-4 animate-spin" />
              Загрузка сделок...
            </div>
          ) : trades.error ? (
            <div className="text-red-500 text-sm p-4 text-center">{trades.error}</div>
          ) : filteredAndSortedTrades.length > 0 ? (
            <div className="space-y-0">
              {/* Заголовок таблицы */}
              <div className="grid grid-cols-5 gap-2 p-3 bg-muted text-xs font-medium text-muted-foreground border-b">
                <div>Время</div>
                <div>Сторона</div>
                <div>Цена</div>
                <div>Объем</div>
                <div>Сумма</div>
              </div>

              {/* Список сделок */}
              <div className="max-h-96 overflow-y-auto">
                {filteredAndSortedTrades.map((trade, index) => (
                  <div key={trade.id || index} className="grid grid-cols-5 gap-2 p-2 hover:bg-muted text-xs border-b border-muted">
                    <div className="text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div>
                      <Badge 
                        variant={trade.side === 'buy' ? 'default' : 'destructive'} 
                        className="text-xs px-2 py-0"
                      >
                        {trade.side === 'buy' ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            BUY
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            SELL
                          </div>
                        )}
                      </Badge>
                    </div>
                    <div className={`font-medium ${
                      trade.side === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPrice(trade.price)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatVolume(trade.amount)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatPrice(trade.price * trade.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Информация об обновлении */}
              <div className="flex items-center justify-between p-3 bg-muted border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Обновлено: {formatTimestamp(trades.lastUpdate)}
                </div>
                <div className="flex items-center gap-4">
                  <span>Показано: {filteredAndSortedTrades.length}</span>
                  <span>Всего: {trades.data?.length || 0}</span>
                  {autoScroll && (
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Автопрокрутка
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              {trades.data?.length === 0 ? 'Нет данных о сделках' : 'Нет сделок, соответствующих фильтрам'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const TradesWidget: React.FC<TradesWidgetProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="Ошибка виджета сделок" showDetails={false}>
      <TradesWidgetInner {...props} />
    </ErrorBoundary>
  );
}; 