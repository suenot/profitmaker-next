import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useDataProviderStore } from '../../store/dataProviderStore';
import { 
  DataProviderType, 
  CCXTBrowserProvider, 
  CCXTServerProvider,
  CCXTBrowserConfig,
  CCXTServerConfig
} from '../../types/dataProviders';
import { Plus, Settings, TestTube, Loader2 } from 'lucide-react';

// CCXT загружается через CDN script tag - доступен как window.ccxt
declare global {
  interface Window {
    ccxt: any;
  }
}

// Интерфейс для информации о бирже
interface ExchangeInfo {
  id: string;
  name: string;
  has: any;
}

// Безопасный fallback список бирж
const getFallbackExchanges = (): ExchangeInfo[] => {
  return [
    { id: 'binance', name: 'Binance', has: {} },
    { id: 'bybit', name: 'Bybit', has: {} },
    { id: 'okx', name: 'OKX', has: {} },
    { id: 'kucoin', name: 'KuCoin', has: {} },
    { id: 'coinbase', name: 'Coinbase Pro', has: {} },
    { id: 'huobi', name: 'Huobi', has: {} },
    { id: 'kraken', name: 'Kraken', has: {} },
    { id: 'bitfinex', name: 'Bitfinex', has: {} },
    { id: 'gateio', name: 'Gate.io', has: {} },
    { id: 'mexc', name: 'MEXC', has: {} }
  ];
};

// Тестирование CCXT напрямую (CDN версия)
const testCCXTDirectly = () => {
  try {
    console.log('🧪 CCXT DIRECT TEST (CDN версия):');
    if (!window.ccxt) {
      console.error('❌ CCXT не загружен! Проверьте подключение CDN script tag');
      return;
    }
    console.log('📦 CCXT version:', window.ccxt.version);
    console.log('🏭 CCXT object keys:', Object.keys(window.ccxt).slice(0, 20));
    
    const exchanges = window.ccxt.exchanges;
    console.log('🔍 window.ccxt.exchanges type:', typeof exchanges);
    console.log('🔍 Is Array?:', Array.isArray(exchanges));
    
    if (Array.isArray(exchanges)) {
      console.log('📊 Exchange count (array):', exchanges.length);
      console.log('🔤 First 10:', exchanges.slice(0, 10));
    } else if (exchanges && typeof exchanges === 'object') {
      const exchangeKeys = Object.keys(exchanges);
      console.log('📊 Exchange count (object keys):', exchangeKeys.length);
      console.log('🔤 First 10 keys:', exchangeKeys.slice(0, 10));
    } else {
      console.log('❌ exchanges is not array or object:', exchanges);
    }
  } catch (error) {
    console.error('❌ CCXT direct test failed:', error);
  }
};

// Безопасная загрузка списка бирж из CCXT с полной обработкой ошибок
const loadCCXTExchanges = (): Promise<ExchangeInfo[]> => {
  return new Promise((resolve) => {
    try {
      const exchanges: ExchangeInfo[] = [];
      
      // Проверяем доступность CCXT с детальным логированием
      if (!window?.ccxt) {
        console.warn('⚠️ CCXT не загружен через CDN, используем fallback список');
        resolve(getFallbackExchanges());
        return;
      }
      
      // Проверяем тип window.ccxt.exchanges  
      let exchangeIds: string[] = [];
      
      if (Array.isArray(window.ccxt.exchanges)) {
        // Если это массив
        exchangeIds = window.ccxt.exchanges;
        console.log('📋 window.ccxt.exchanges is array');
      } else if (window.ccxt.exchanges && typeof window.ccxt.exchanges === 'object') {
        // Если это объект - берем ключи
        exchangeIds = Object.keys(window.ccxt.exchanges);
        console.log('📋 window.ccxt.exchanges is object, using keys');
      } else {
        // Fallback: ищем функции-классы бирж в window.ccxt
        exchangeIds = Object.keys(window.ccxt).filter(key => {
          const item = window.ccxt[key];
          return typeof item === 'function' && 
                 key !== 'Exchange' && 
                 key !== 'version' && 
                 key !== 'default' &&
                 !key.startsWith('_') &&
                 key.length > 2;
        });
        console.log('📋 Using fallback: scanning ccxt object keys');
      }
    
    console.log(`🔍 Found ${exchangeIds.length} exchange classes in CCXT:`, exchangeIds);
    console.log(`📊 First 10 exchanges:`, exchangeIds.slice(0, 10));
    console.log(`📊 Last 10 exchanges:`, exchangeIds.slice(-10));
    
    for (const exchangeId of exchangeIds) {
      try {
        const ExchangeClass = window.ccxt[exchangeId] as any;
        if (ExchangeClass && typeof ExchangeClass === 'function') {
          const exchange = new ExchangeClass();
          exchanges.push({
            id: exchangeId,
            name: exchange.name || exchangeId,
            has: exchange.has
          });
        }
      } catch (error) {
        // Некоторые биржи могут не инициализироваться без параметров
        // console.warn(`Failed to load exchange ${exchangeId}:`, error);
        exchanges.push({
          id: exchangeId,
          name: exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1),
          has: {}
        });
      }
    }
    
      // Сортируем по имени
      const sortedExchanges = exchanges.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`✅ Successfully loaded ${sortedExchanges.length} exchanges from CCXT`);
      console.log(`🏆 Sample exchanges:`, sortedExchanges.slice(0, 5).map(e => `${e.name} (${e.id})`));
      resolve(sortedExchanges);
    } catch (error) {
      console.error('🛡️ Безопасный перехват ошибки загрузки CCXT exchanges:', error);
      // Возвращаем fallback список для обеспечения работоспособности
      resolve(getFallbackExchanges());
    }
  });
};

interface CCXTBrowserFormData {
  name: string;
  exchangeId: string;
  sandbox: boolean;
  apiKey: string;
  secret: string;
  password: string;
  uid: string;
}

interface CCXTServerFormData {
  name: string;
  exchangeId: string;
  serverUrl: string;
  privateKey: string;
  timeout: number;
}

const DataProviderSetupWidgetInner: React.FC = () => {
  const { addProvider, initializeProvider, loading } = useDataProviderStore();
  
  const [providerType, setProviderType] = useState<DataProviderType>('ccxt-browser');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supportedExchanges, setSupportedExchanges] = useState<ExchangeInfo[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(true);

  // Безопасная загрузка списка бирж при инициализации
  useEffect(() => {
    const loadExchanges = async () => {
      setLoadingExchanges(true);
      try {
        // Безопасное тестирование CCXT
        try {
          testCCXTDirectly();
        } catch (testError) {
          console.warn('⚠️ Предупреждение при тестировании CCXT:', testError);
        }
        
        const exchanges = await loadCCXTExchanges();
        setSupportedExchanges(exchanges);
        console.log(`🔥 Успешно загружено ${exchanges.length} бирж из CCXT`);
      } catch (error) {
        console.error('🛡️ Перехваченная ошибка загрузки бирж:', error);
        // Устанавливаем fallback список при любых ошибках
        setSupportedExchanges(getFallbackExchanges());
      } finally {
        setLoadingExchanges(false);
      }
    };

    loadExchanges();
  }, []);

  // Форма для CCXT Browser
  const [ccxtBrowserForm, setCcxtBrowserForm] = useState<CCXTBrowserFormData>({
    name: '',
    exchangeId: '',
    sandbox: false,
    apiKey: '',
    secret: '',
    password: '',
    uid: ''
  });

  // Форма для CCXT Server
  const [ccxtServerForm, setCcxtServerForm] = useState<CCXTServerFormData>({
    name: '',
    exchangeId: '',
    serverUrl: '',
    privateKey: '',
    timeout: 30000
  });

  const handleCcxtBrowserFormChange = (field: keyof CCXTBrowserFormData, value: any) => {
    setCcxtBrowserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCcxtServerFormChange = (field: keyof CCXTServerFormData, value: any) => {
    setCcxtServerForm(prev => ({ ...prev, [field]: value }));
  };

  const validateCcxtBrowserForm = (): boolean => {
    return ccxtBrowserForm.name.trim() !== '' && ccxtBrowserForm.exchangeId !== '';
  };

  const validateCcxtServerForm = (): boolean => {
    return (
      ccxtServerForm.name.trim() !== '' && 
      ccxtServerForm.exchangeId !== '' &&
      ccxtServerForm.serverUrl.trim() !== '' &&
      ccxtServerForm.privateKey.trim() !== ''
    );
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const tempProvider = createTempProvider();
      if (!tempProvider) {
        setTestResult({ success: false, message: '🛡️ Ошибка создания тестового провайдера' });
        return;
      }

      // Добавляем временный провайдер в store для тестирования
      addProvider(tempProvider);

      const result = await initializeProvider(tempProvider.id);
      
      // Безопасное удаление временного провайдера
      try {
        const { removeProvider } = useDataProviderStore.getState();
        removeProvider(tempProvider.id);
      } catch (removeError) {
        console.warn('⚠️ Предупреждение при удалении временного провайдера:', removeError);
      }
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? `✅ Соединение успешно! Найдено ${result.data?.markets?.length || 0} торговых пар`
          : `❌ ${result.error || 'Неизвестная ошибка'}`
      });
    } catch (error) {
      console.error('🛡️ Перехваченная ошибка тестирования:', error);
      setTestResult({ 
        success: false, 
        message: `🛡️ Безопасная обработка ошибки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const createTempProvider = () => {
    const id = `temp-${Date.now()}`;
    
    if (providerType === 'ccxt-browser') {
      if (!validateCcxtBrowserForm()) return null;
      
      const config: CCXTBrowserConfig = {
        exchangeId: ccxtBrowserForm.exchangeId,
        sandbox: ccxtBrowserForm.sandbox,
        ...(ccxtBrowserForm.apiKey && { apiKey: ccxtBrowserForm.apiKey }),
        ...(ccxtBrowserForm.secret && { secret: ccxtBrowserForm.secret }),
        ...(ccxtBrowserForm.password && { password: ccxtBrowserForm.password }),
        ...(ccxtBrowserForm.uid && { uid: ccxtBrowserForm.uid })
      };

      return {
        id,
        name: ccxtBrowserForm.name,
        type: 'ccxt-browser' as const,
        status: 'disconnected' as const,
        config
      };
    }

    if (providerType === 'ccxt-server') {
      if (!validateCcxtServerForm()) return null;
      
      const config: CCXTServerConfig = {
        exchangeId: ccxtServerForm.exchangeId,
        serverUrl: ccxtServerForm.serverUrl,
        privateKey: ccxtServerForm.privateKey,
        timeout: ccxtServerForm.timeout
      };

      return {
        id,
        name: ccxtServerForm.name,
        type: 'ccxt-server' as const,
        status: 'disconnected' as const,
        config
      };
    }

    return null;
  };

  const handleSubmit = async () => {
    const provider = createTempProvider();
    if (!provider) return;

    // Создаем реальный ID
    provider.id = `${provider.type}-${Date.now()}`;
    
    addProvider(provider);
    
    // Тестируем соединение
    await initializeProvider(provider.id);
    
    // Очищаем форму
    if (providerType === 'ccxt-browser') {
      setCcxtBrowserForm({
        name: '',
        exchangeId: '',
        sandbox: false,
        apiKey: '',
        secret: '',
        password: '',
        uid: ''
      });
    } else if (providerType === 'ccxt-server') {
      setCcxtServerForm({
        name: '',
        exchangeId: '',
        serverUrl: '',
        privateKey: '',
        timeout: 30000
      });
    }
    
    setTestResult(null);
  };

  const isFormValid = providerType === 'ccxt-browser' 
    ? validateCcxtBrowserForm() 
    : validateCcxtServerForm();

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Настройка поставщиков данных</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Добавить поставщика данных</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Выбор типа поставщика */}
          <div className="space-y-2">
            <Label>Тип поставщика</Label>
            <Select value={providerType} onValueChange={(value: DataProviderType) => setProviderType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ccxt-browser">CCXT Browser</SelectItem>
                <SelectItem value="ccxt-server">CCXT Server</SelectItem>
                <SelectItem value="custom" disabled>Кастомный (скоро)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Форма для CCXT Browser */}
          {providerType === 'ccxt-browser' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="browser-name">Название поставщика</Label>
                <Input
                  id="browser-name"
                  value={ccxtBrowserForm.name}
                  onChange={(e) => handleCcxtBrowserFormChange('name', e.target.value)}
                  placeholder="Например: Binance Spot"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="browser-exchange">Биржа</Label>
                <Select 
                  value={ccxtBrowserForm.exchangeId} 
                  onValueChange={(value) => handleCcxtBrowserFormChange('exchangeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите биржу" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingExchanges ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Загружаем биржи...
                        </div>
                      </SelectItem>
                    ) : (
                      supportedExchanges.map(exchange => (
                        <SelectItem key={exchange.id} value={exchange.id}>
                          {exchange.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="browser-sandbox"
                  checked={ccxtBrowserForm.sandbox}
                  onCheckedChange={(checked) => handleCcxtBrowserFormChange('sandbox', checked)}
                />
                <Label htmlFor="browser-sandbox">Тестовый режим (Sandbox)</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="browser-apiKey">API Key (опционально)</Label>
                  <Input
                    id="browser-apiKey"
                    type="password"
                    value={ccxtBrowserForm.apiKey}
                    onChange={(e) => handleCcxtBrowserFormChange('apiKey', e.target.value)}
                    placeholder="Для приватных данных"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="browser-secret">Secret (опционально)</Label>
                  <Input
                    id="browser-secret"
                    type="password"
                    value={ccxtBrowserForm.secret}
                    onChange={(e) => handleCcxtBrowserFormChange('secret', e.target.value)}
                    placeholder="Для приватных данных"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="browser-password">Passphrase (опционально)</Label>
                  <Input
                    id="browser-password"
                    type="password"
                    value={ccxtBrowserForm.password}
                    onChange={(e) => handleCcxtBrowserFormChange('password', e.target.value)}
                    placeholder="Для некоторых бирж"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="browser-uid">UID (опционально)</Label>
                  <Input
                    id="browser-uid"
                    value={ccxtBrowserForm.uid}
                    onChange={(e) => handleCcxtBrowserFormChange('uid', e.target.value)}
                    placeholder="Для некоторых бирж"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Форма для CCXT Server */}
          {providerType === 'ccxt-server' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server-name">Название поставщика</Label>
                <Input
                  id="server-name"
                  value={ccxtServerForm.name}
                  onChange={(e) => handleCcxtServerFormChange('name', e.target.value)}
                  placeholder="Например: CCXT Server Binance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-exchange">Биржа</Label>
                <Select 
                  value={ccxtServerForm.exchangeId} 
                  onValueChange={(value) => handleCcxtServerFormChange('exchangeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите биржу" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingExchanges ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Загружаем биржи...
                        </div>
                      </SelectItem>
                    ) : (
                      supportedExchanges.map(exchange => (
                        <SelectItem key={exchange.id} value={exchange.id}>
                          {exchange.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-url">URL сервера</Label>
                <Input
                  id="server-url"
                  value={ccxtServerForm.serverUrl}
                  onChange={(e) => handleCcxtServerFormChange('serverUrl', e.target.value)}
                  placeholder="https://your-server.com/api"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="private-key">Приватный ключ</Label>
                <Textarea
                  id="private-key"
                  value={ccxtServerForm.privateKey}
                  onChange={(e) => handleCcxtServerFormChange('privateKey', e.target.value)}
                  placeholder="Приватный ключ для аутентификации"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Таймаут (мс)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={ccxtServerForm.timeout}
                  onChange={(e) => handleCcxtServerFormChange('timeout', parseInt(e.target.value) || 30000)}
                  min={1000}
                  max={60000}
                />
              </div>
            </div>
          )}

          {/* Результат тестирования */}
          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{testResult.message}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              variant="outline"
              disabled={!isFormValid || isTestingConnection}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTestingConnection ? 'Тестируем...' : 'Тест соединения'}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {loading ? 'Добавляем...' : 'Добавить поставщика'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DataProviderSetupWidget: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Ошибка виджета настройки поставщиков" showDetails={false}>
      <DataProviderSetupWidgetInner />
    </ErrorBoundary>
  );
}; 