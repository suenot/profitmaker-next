import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useDataProviderStore } from '../../store/dataProviderStore';
import { ConnectionStatus } from '../../types/dataProviders';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Clock, 
  Users,
  Activity,
  Trash2,
  RefreshCw
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
  return new Date(timestamp).toLocaleTimeString();
};

const formatDuration = (timestamp: number) => {
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
    connections,
    connectionStats,
    subscriptions,
    activeProviderId,
    closeConnection,
    removeProvider,
    initializeProvider,
    getActiveSubscriptions
  } = useDataProviderStore();

  const activeSubscriptions = getActiveSubscriptions();
  const connectionList = Object.values(connectionStats);
  const providerList = Object.values(providers);

  const handleCloseConnection = (connectionKey: string) => {
    closeConnection(connectionKey);
  };

  const handleRemoveProvider = (providerId: string) => {
    removeProvider(providerId);
  };

  const handleReinitializeProvider = async (providerId: string) => {
    await initializeProvider(providerId);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Отладка поставщиков данных</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {connectionList.filter(c => c.status === 'connected').length} активных
        </Badge>
      </div>

      {/* Поставщики данных */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReinitializeProvider(provider.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
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

      {/* WebSocket соединения */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            WebSocket соединения ({connectionList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectionList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет активных соединений
            </p>
          ) : (
            connectionList.map((connection) => (
              <div key={connection.key.exchange + '-' + connection.key.symbol + '-' + connection.key.dataType} 
                   className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <p className="font-medium text-sm">
                      {connection.key.exchange} • {connection.key.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {connection.key.dataType} • Обновлено: {formatTimestamp(connection.lastUpdate)}
                    </p>
                    {connection.error && (
                      <p className="text-xs text-red-500">{connection.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {connection.subscriberCount}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(connection.lastUpdate)}
                  </div>
                  {getStatusBadge(connection.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCloseConnection(
                      connection.key.exchange + '-' + connection.key.symbol + '-' + connection.key.dataType
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Активные подписки */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            Активные подписки ({activeSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет активных подписок
            </p>
          ) : (
            activeSubscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-2 border rounded text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {subscription.dataType}
                  </Badge>
                  <span>{subscription.exchange}</span>
                  <span>•</span>
                  <span className="font-medium">{subscription.symbol}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Dashboard: {subscription.dashboardId}</span>
                  <span>•</span>
                  <span>Widget: {subscription.widgetId}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {connectionList.filter(c => c.status === 'connected').length}
              </p>
              <p className="text-xs text-muted-foreground">Подключено</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {connectionList.filter(c => c.status === 'connecting').length}
              </p>
              <p className="text-xs text-muted-foreground">Подключается</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {connectionList.filter(c => c.status === 'error').length}
              </p>
              <p className="text-xs text-muted-foreground">Ошибки</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {activeSubscriptions.length}
              </p>
              <p className="text-xs text-muted-foreground">Подписок</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 