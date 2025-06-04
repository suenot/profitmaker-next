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
  if (timestamp === 0) return 'Never';
  return new Date(timestamp).toLocaleTimeString();
};

const formatDuration = (timestamp: number) => {
  if (timestamp === 0) return 'N/A';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
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
  } = useDataProviderStore();

  const activeSubscriptions = getActiveSubscriptionsList();
  const providerList = Object.values(providers);
  
  // Separate subscriptions by methods
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Data Providers Debug</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {activeSubscriptions.filter(s => s.isActive).length} active
          </Badge>
          <Button size="sm" variant="outline" onClick={handleCleanup}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      </div>

      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Current settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fetch method:</span>
              <Badge variant={dataFetchSettings.method === 'websocket' ? 'default' : 'secondary'}>
                {dataFetchSettings.method === 'websocket' ? '📡 WebSocket' : '🔄 REST'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active provider:</span>
              <span className="font-mono">{activeProviderId || 'Not selected'}</span>
            </div>
          </div>
          
          {dataFetchSettings.method === 'rest' && (
            <div className="border-t pt-3">
              <div className="text-xs text-gray-600 mb-2">REST request intervals:</div>
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

      {/* Data providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data providers ({providerList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {providerList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No configured data providers
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
                    <Badge variant="secondary" className="text-xs">Active</Badge>
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
                      Activate
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

      {/* WebSocket subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WebSocket subscriptions ({webSocketSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {webSocketSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active WebSocket subscriptions
            </p>
          ) : (
            webSocketSubscriptions.map((subscription, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <p className="font-medium text-sm">
                      {subscription.key.exchange} • {subscription.key.market || 'spot'} • {subscription.key.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.key.dataType}{subscription.key.timeframe ? ` • ${subscription.key.timeframe}` : ''} • Updated: {formatTimestamp(subscription.lastUpdate)}
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
                    {subscription.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* REST polling cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            REST polling cycles ({restSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {restSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active REST cycles
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
                        {subscription.key.exchange} • {subscription.key.market || 'spot'} • {subscription.key.symbol}
                      </p>
                      {subscription.isFallback && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                          🔄 Fallback
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subscription.key.dataType}{subscription.key.timeframe ? ` • ${subscription.key.timeframe}` : ''} • Interval: {dataFetchSettings.restIntervals[subscription.key.dataType]}ms
                    </p>
                    {subscription.isFallback && (
                      <p className="text-xs text-orange-600">
                        WebSocket unavailable, using REST
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Last request: {formatTimestamp(subscription.lastUpdate)}
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
                    {subscription.isActive ? '🔄 Polling' : '⏸️ Stopped'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">General statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total subscriptions:</span>
                <span className="font-mono">{activeSubscriptions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-mono text-green-600">{activeSubscriptions.filter(s => s.isActive).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WebSocket:</span>
                <span className="font-mono text-blue-600">{webSocketSubscriptions.length}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">REST cycles:</span>
                <span className="font-mono text-orange-600">{restSubscriptions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Providers:</span>
                <span className="font-mono">{providerList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscribers:</span>
                <span className="font-mono">{activeSubscriptions.reduce((sum, s) => sum + s.subscriberCount, 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 