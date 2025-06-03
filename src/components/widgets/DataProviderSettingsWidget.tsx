import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { useDataProviderStore } from '../../store/dataProviderStore';
import { DataFetchMethod, DataType } from '../../types/dataProviders';
import { Settings, Wifi, WifiOff, Clock, Activity, BarChart, Database } from 'lucide-react';

const DataProviderSettingsWidgetInner: React.FC = () => {
  const { 
    dataFetchSettings, 
    setDataFetchMethod, 
    setRestInterval,
    getActiveSubscriptionsList
  } = useDataProviderStore();

  const [tradesInterval, setTradesInterval] = useState(dataFetchSettings.restIntervals.trades.toString());
  const [candlesInterval, setCandlesInterval] = useState(dataFetchSettings.restIntervals.candles.toString());
  const [orderbookInterval, setOrderbookInterval] = useState(dataFetchSettings.restIntervals.orderbook.toString());

  const activeSubscriptions = getActiveSubscriptionsList();

  const handleMethodChange = async (method: DataFetchMethod) => {
    console.log(`🔄 Changing data fetch method to: ${method}...`);
    await setDataFetchMethod(method);
    console.log(`✅ Data fetch method successfully changed to: ${method}`);
  };

  const handleIntervalChange = (dataType: DataType, value: string) => {
    const interval = parseInt(value);
    if (!isNaN(interval) && interval > 0) {
      setRestInterval(dataType, interval);
      console.log(`⏱️ ${dataType} interval set to ${interval}ms`);
    }
  };

  const handleTradesIntervalSubmit = () => {
    handleIntervalChange('trades', tradesInterval);
  };

  const handleCandlesIntervalSubmit = () => {
    handleIntervalChange('candles', candlesInterval);
  };

  const handleOrderbookIntervalSubmit = () => {
    handleIntervalChange('orderbook', orderbookInterval);
  };

  const formatInterval = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${ms / 1000}s`;
    return `${ms / 60000}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Настройки получения данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Выбор метода получения данных */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Метод получения данных</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="websocket-mode"
                checked={dataFetchSettings.method === 'websocket'}
                onCheckedChange={(checked) => handleMethodChange(checked ? 'websocket' : 'rest')}
              />
              <Label htmlFor="websocket-mode" className="flex items-center gap-2">
                {dataFetchSettings.method === 'websocket' ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    WebSocket (реальное время)
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-orange-500" />
                    REST (интервальные запросы)
                  </>
                )}
              </Label>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {dataFetchSettings.method === 'websocket' 
              ? 'Получение данных в реальном времени через WebSocket соединения. Автоматически переключится на REST если WebSocket не поддерживается.'
              : 'Получение данных через REST API с настраиваемыми интервалами. Подходит для отладки и бирж без поддержки WebSocket.'
            }
          </div>
        </div>

        <Separator />

        {/* Настройки интервалов REST (отображается только при выборе REST) */}
        {dataFetchSettings.method === 'rest' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label className="text-sm font-medium">Интервалы REST запросов</Label>
            </div>

            {/* Trades interval */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <Label className="text-sm">Сделки (Trades)</Label>
                <span className="text-xs text-gray-500">
                  Текущий: {formatInterval(dataFetchSettings.restIntervals.trades)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Интервал в миллисекундах"
                  value={tradesInterval}
                  onChange={(e) => setTradesInterval(e.target.value)}
                  className="flex-1"
                  min="100"
                  step="100"
                />
                <Button onClick={handleTradesIntervalSubmit} size="sm">
                  Применить
                </Button>
              </div>
            </div>

            {/* Candles interval */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-green-500" />
                <Label className="text-sm">Свечи (Candles)</Label>
                <span className="text-xs text-gray-500">
                  Текущий: {formatInterval(dataFetchSettings.restIntervals.candles)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Интервал в миллисекундах"
                  value={candlesInterval}
                  onChange={(e) => setCandlesInterval(e.target.value)}
                  className="flex-1"
                  min="100"
                  step="100"
                />
                <Button onClick={handleCandlesIntervalSubmit} size="sm">
                  Применить
                </Button>
              </div>
            </div>

            {/* OrderBook interval */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-500" />
                <Label className="text-sm">Книга заказов (OrderBook)</Label>
                <span className="text-xs text-gray-500">
                  Текущий: {formatInterval(dataFetchSettings.restIntervals.orderbook)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Интервал в миллисекундах"
                  value={orderbookInterval}
                  onChange={(e) => setOrderbookInterval(e.target.value)}
                  className="flex-1"
                  min="100"
                  step="100"
                />
                <Button onClick={handleOrderbookIntervalSubmit} size="sm">
                  Применить
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
              💡 <strong>Рекомендации:</strong> Trades 500-1000ms, Candles 5000ms, OrderBook 200-500ms. 
              Слишком частые запросы могут привести к превышению лимитов API.
            </div>
          </div>
        )}

        <Separator />

        {/* Информация об активных подписках */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Активные подписки</Label>
          <div className="text-sm text-gray-600">
            Всего активных подписок: <span className="font-mono">{activeSubscriptions.length}</span>
          </div>
          
          {activeSubscriptions.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {activeSubscriptions.map((subscription, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="font-mono">
                      {subscription.key.exchange}:{subscription.key.symbol}:{subscription.key.dataType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {subscription.method === 'websocket' ? '📡' : '🔄'} {subscription.method}
                    </span>
                    <span className="font-mono text-blue-600">
                      {subscription.subscriberCount} подписчик{subscription.subscriberCount !== 1 ? 'ов' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSubscriptions.length === 0 && (
            <div className="text-sm text-gray-400 italic">
              Нет активных подписок. Добавьте виджеты данных для создания подписок.
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 pt-2 border-t">
          💡 Подписки автоматически дедуплицируются - если несколько виджетов запрашивают одни и те же данные, создается только одно соединение.
        </div>
      </CardContent>
    </Card>
  );
};

export const DataProviderSettingsWidget: React.FC = () => {
  return (
    <ErrorBoundary>
      <DataProviderSettingsWidgetInner />
    </ErrorBoundary>
  );
}; 