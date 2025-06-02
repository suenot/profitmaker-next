import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useDataProviderStoreV2 } from '../../store/dataProviderStoreV2';
import { ConnectionStatus } from '../../types/dataProviders';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Clock, 
  Users,
  Activity,
  Trash2,
  RefreshCw,
  RotateCcw,
  Database,
  PlayCircle,
  Settings
} from 'lucide-react';

const getStatusIcon = (status: ConnectionStatus) => {
  switch (status) {
    case 'connected':
      return <Wifi className="h-4 w-4 text-green-500" />;
    case 'connecting':
      return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
    case 'disconnected':
      return <WifiOff className="h-4 w-4 text-gray-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <WifiOff className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: ConnectionStatus) => {
  const variants = {
    connected: 'default',
    connecting: 'secondary',
    disconnected: 'outline',
    error: 'destructive'
  } as const;

  return (
    <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

const formatTimestamp = (timestamp: number) => {
  if (timestamp === 0) return 'Никогда';
  return new Date(timestamp).toLocaleTimeString();
};

const formatDuration = (timestamp: number) => {
  if (timestamp === 0) return 'N/A';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}ч ${minutes % 60}м`;
  if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
  return `${seconds}с`;
};

export const DataProviderDebugWidget: React.FC = () => {
  const {
    providers,
    activeProviderId,
    dataFetchSettings,
    getActiveSubscriptionsList,
    removeProvider,
    setActiveProvider,
    cleanup
  } = useDataProviderStoreV2();

  const activeSubscriptions = getActiveSubscriptionsList();
  const providerList = Object.values(providers);
  
  // Разделяем подписки по методам
  const webSocketSubscriptions = activeSubscriptions.filter(sub => sub.method === 'websocket');
  const restSubscriptions = activeSubscriptions.filter(sub => sub.method === 'rest');

  const handleRemoveProvider = (providerId: string) => {
    removeProvider(providerId);
  };

  const handleSetActiveProvider = (providerId: string) => {
    setActiveProvider(providerId);
  };

  const handleCleanup = () => {
    cleanup();
  };

  return (
    <div className="space-y-4 p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Отладка поставщиков данных</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {activeSubscriptions.filter(s => s.isActive).length} активных
          </Badge>
          <Button size="sm" variant="outline" onClick={handleCleanup}>
            <Trash2 className="h-3 w-3 mr-1" />
            Очистить все
          </Button>
        </div>
      </div>

      {/* Общие настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Текущие настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Метод получения:</span>
              <Badge variant={dataFetchSettings.method === 'websocket' ? 'default' : 'secondary'}>
                {dataFetchSettings.method === 'websocket' ? '📡 WebSocket' : '🔄 REST'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Активный провайдер:</span>
              <span className="font-mono">{activeProviderId || 'Не выбран'}</span>
            </div>
          </div>
          
          {dataFetchSettings.method === 'rest' && (
            <div className="border-t pt-3">
              <div className="text-xs text-gray-600 mb-2">Интервалы REST запросов:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium">Trades</div>
                  <div className="font-mono">{dataFetchSettings.restIntervals.trades}ms</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium">Candles</div>
                  <div className="font-mono">{dataFetchSettings.restIntervals.candles}ms</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-medium">OrderBook</div>
                  <div className="font-mono">{dataFetchSettings.restIntervals.orderbook}ms</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Поставщики данных */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Поставщики данных ({providerList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {providerList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет настроенных поставщиков данных
            </p>
          ) : (
            providerList.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(provider.status)}
                    <div>
                      <p className="font-medium text-sm">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.type}</p>
                    </div>
                  </div>
                  {provider.id === activeProviderId && (
                    <Badge variant="secondary" className="text-xs">Активный</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.status)}
                  {provider.id !== activeProviderId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetActiveProvider(provider.id)}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Активировать
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveProvider(provider.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* WebSocket подписки */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WebSocket подписки ({webSocketSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {webSocketSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет активных WebSocket подписок
            </p>
          ) : (
            webSocketSubscriptions.map((subscription, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <p className="font-medium text-sm">
                      {subscription.key.exchange} • {subscription.key.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.key.dataType} • Обновлено: {formatTimestamp(subscription.lastUpdate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {subscription.subscriberCount}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(subscription.lastUpdate)}
                  </div>
                  <Badge variant={subscription.isActive ? 'default' : 'outline'}>
                    {subscription.isActive ? '🟢 Активен' : '🔴 Неактивен'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* REST циклы */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            REST циклы опроса ({restSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {restSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет активных REST циклов
            </p>
          ) : (
            restSubscriptions.map((subscription, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                subscription.isFallback 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${subscription.isActive ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {subscription.key.exchange} • {subscription.key.symbol}
                      </p>
                      {subscription.isFallback && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                          🔄 Fallback
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subscription.key.dataType} • Интервал: {dataFetchSettings.restIntervals[subscription.key.dataType]}ms
                    </p>
                    {subscription.isFallback && (
                      <p className="text-xs text-orange-600">
                        WebSocket недоступен, используется REST
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Последний запрос: {formatTimestamp(subscription.lastUpdate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {subscription.subscriberCount}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(subscription.lastUpdate)}
                  </div>
                  <Badge variant={subscription.isActive ? 'secondary' : 'outline'}>
                    {subscription.isActive ? '🔄 Опрашивается' : '⏸️ Остановлен'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Общая статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Всего подписок:</span>
                <span className="font-mono">{activeSubscriptions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Активных:</span>
                <span className="font-mono text-green-600">{activeSubscriptions.filter(s => s.isActive).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WebSocket:</span>
                <span className="font-mono text-blue-600">{webSocketSubscriptions.length}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">REST циклы:</span>
                <span className="font-mono text-orange-600">{restSubscriptions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Провайдеров:</span>
                <span className="font-mono">{providerList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Подписчиков:</span>
                <span className="font-mono">{activeSubscriptions.reduce((sum, s) => sum + s.subscriberCount, 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 