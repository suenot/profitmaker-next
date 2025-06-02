import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useOrderBook, useDataProviders } from '../../hooks/useDataProvider';
import { formatPrice, formatVolume, formatTimestamp, formatSpread } from '../../utils/formatters';
import { 
  BookOpen, 
  Activity, 
  Clock, 
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Settings,
  BarChart3
} from 'lucide-react';

interface OrderBookWidgetProps {
  dashboardId?: string;
  widgetId?: string;
  initialSymbol?: string;
  initialExchange?: string;
  maxDepth?: number;
  showSpread?: boolean;
  showSettings?: boolean;
}

export const OrderBookWidget: React.FC<OrderBookWidgetProps> = ({
  dashboardId = 'default',
  widgetId = 'orderbook-widget',
  initialSymbol = 'BTC/USDT',
  initialExchange = 'binance',
  maxDepth = 10,
  showSpread = true,
  showSettings = true
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [exchange, setExchange] = useState(initialExchange);
  const [depth, setDepth] = useState(maxDepth);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const { activeProvider } = useDataProviders();

  const orderbook = useOrderBook(
    symbol, 
    exchange, 
    undefined, 
    dashboardId, 
    widgetId
  );

  // Получаем лучшие bid/ask и рассчитываем спред
  const bestBid = orderbook.data?.bids[0];
  const bestAsk = orderbook.data?.asks[0];
  const spread = bestBid && bestAsk ? bestAsk.price - bestBid.price : 0;
  const spreadPercent = bestBid && bestAsk ? (spread / bestBid.price) * 100 : 0;

  // Ограничиваем глубину книги заказов
  const bidsToShow = orderbook.data?.bids.slice(0, depth) || [];
  const asksToShow = orderbook.data?.asks.slice(0, depth) || [];

  // Рассчитываем совокупные объемы
  const bidsWithCumulative = bidsToShow.map((bid, index) => {
    const cumulative = bidsToShow.slice(0, index + 1).reduce((sum, b) => sum + b.amount, 0);
    return { ...bid, cumulative };
  });

  const asksWithCumulative = asksToShow.map((ask, index) => {
    const cumulative = asksToShow.slice(0, index + 1).reduce((sum, a) => sum + a.amount, 0);
    return { ...ask, cumulative };
  });

  const getConnectionStatusIcon = () => {
    if (orderbook.loading) return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
    if (orderbook.isSubscribed) return <Wifi className="h-4 w-4 text-green-500" />;
    return <WifiOff className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getConnectionStatusIcon()}
            <BookOpen className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Книга заказов</h2>
          </div>
          <Badge variant="outline">{symbol}</Badge>
          <Badge variant="secondary">{exchange}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {activeProvider && (
            <Badge variant="outline" className="text-xs">
              {activeProvider.name}
            </Badge>
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
                <Label htmlFor="depth">Глубина</Label>
                <Input
                  id="depth"
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(parseInt(e.target.value) || 10)}
                  min={5}
                  max={50}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Основная книга заказов */}
      <Card>
        <CardContent className="p-0">
          {orderbook.loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground p-8">
              <Activity className="h-4 w-4 animate-spin" />
              Загрузка книги заказов...
            </div>
          ) : orderbook.error ? (
            <div className="text-red-500 text-sm p-4 text-center">{orderbook.error}</div>
          ) : orderbook.data ? (
            <div className="space-y-0">
              {/* Заголовок таблицы */}
              <div className="grid grid-cols-6 gap-2 p-3 bg-muted text-xs font-medium text-muted-foreground border-b">
                <div className="col-span-2">Цена</div>
                <div>Объем</div>
                <div>Накопл.</div>
                <div className="col-span-2 text-right">Общий объем</div>
              </div>

              {/* Заявки на продажу (asks) - сверху вниз */}
              <div className="space-y-0">
                {asksWithCumulative.reverse().map((ask, index) => (
                  <div key={`ask-${index}`} className="grid grid-cols-6 gap-2 p-2 hover:bg-red-50 text-xs">
                    <div className="col-span-2 font-medium text-red-600">
                      {formatPrice(ask.price)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatVolume(ask.amount)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatVolume(ask.cumulative)}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      {formatPrice(ask.price * ask.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Спред */}
              {showSpread && bestBid && bestAsk && (
                <div className="bg-muted p-3 border-y">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-medium">Спред:</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{formatPrice(spread)}</span>
                      <span className="text-muted-foreground">
                        ({spreadPercent.toFixed(3)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Заявки на покупку (bids) - сверху вниз */}
              <div className="space-y-0">
                {bidsWithCumulative.map((bid, index) => (
                  <div key={`bid-${index}`} className="grid grid-cols-6 gap-2 p-2 hover:bg-green-50 text-xs">
                    <div className="col-span-2 font-medium text-green-600">
                      {formatPrice(bid.price)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatVolume(bid.amount)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatVolume(bid.cumulative)}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      {formatPrice(bid.price * bid.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Информация об обновлении */}
              <div className="flex items-center justify-between p-3 bg-muted border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Обновлено: {formatTimestamp(orderbook.lastUpdate)}
                </div>
                <div className="flex items-center gap-4">
                  <span>Заявок: {bidsToShow.length + asksToShow.length}</span>
                  <span>Лучший bid: {bestBid ? formatPrice(bestBid.price) : '--'}</span>
                  <span>Лучший ask: {bestAsk ? formatPrice(bestAsk.price) : '--'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Нет данных книги заказов
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 