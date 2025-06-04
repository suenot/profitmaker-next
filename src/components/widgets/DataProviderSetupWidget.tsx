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

// CCXT loaded via CDN script tag - available as window.ccxt
declare global {
  interface Window {
    ccxt: any;
  }
}

// Interface for exchange information
interface ExchangeInfo {
  id: string;
  name: string;
  has: any;
}

// Safe fallback exchanges list
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

// Test CCXT directly (CDN version)
const testCCXTDirectly = () => {
  try {
    console.log('🧪 CCXT DIRECT TEST (CDN version):');
    if (!window.ccxt) {
      console.error('❌ CCXT not loaded! Check CDN script tag connection');
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

// Safe loading of exchanges list from CCXT with full error handling
const loadCCXTExchanges = (): Promise<ExchangeInfo[]> => {
  return new Promise((resolve) => {
    try {
      const exchanges: ExchangeInfo[] = [];
      
      // Check CCXT availability with detailed logging
      if (!window?.ccxt) {
        console.warn('⚠️ CCXT not loaded via CDN, using fallback list');
        resolve(getFallbackExchanges());
        return;
      }
      
      // Check window.ccxt.exchanges type  
      let exchangeIds: string[] = [];
      
      if (Array.isArray(window.ccxt.exchanges)) {
        // If it's an array
        exchangeIds = window.ccxt.exchanges;
        console.log('📋 window.ccxt.exchanges is array');
      } else if (window.ccxt.exchanges && typeof window.ccxt.exchanges === 'object') {
        // If it's an object - take keys
        exchangeIds = Object.keys(window.ccxt.exchanges);
        console.log('📋 window.ccxt.exchanges is object, using keys');
      } else {
        // Fallback: search for exchange class functions in window.ccxt
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
        // Some exchanges may not initialize without parameters
        // console.warn(`Failed to load exchange ${exchangeId}:`, error);
        exchanges.push({
          id: exchangeId,
          name: exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1),
          has: {}
        });
      }
    }
    
      // Sort by name
      const sortedExchanges = exchanges.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`✅ Successfully loaded ${sortedExchanges.length} exchanges from CCXT`);
      console.log(`🏆 Sample exchanges:`, sortedExchanges.slice(0, 5).map(e => `${e.name} (${e.id})`));
      resolve(sortedExchanges);
    } catch (error) {
      console.error('🛡️ Safe error handling for CCXT exchanges loading:', error);
      // Return fallback list to ensure functionality
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
  const { addProvider } = useDataProviderStore();
  
  const [providerType, setProviderType] = useState<DataProviderType>('ccxt-browser');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supportedExchanges, setSupportedExchanges] = useState<ExchangeInfo[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(true);

  // Safe loading of exchanges list on initialization
  useEffect(() => {
    const loadExchanges = async () => {
      setLoadingExchanges(true);
      try {
        // Safe CCXT testing
        try {
          testCCXTDirectly();
        } catch (testError) {
          console.warn('⚠️ Warning during CCXT testing:', testError);
        }
        
        const exchanges = await loadCCXTExchanges();
        setSupportedExchanges(exchanges);
        console.log(`🔥 Successfully loaded ${exchanges.length} exchanges from CCXT`);
      } catch (error) {
        console.error('🛡️ Caught error loading exchanges:', error);
        // Set fallback list on any errors
        setSupportedExchanges(getFallbackExchanges());
      } finally {
        setLoadingExchanges(false);
      }
    };

    loadExchanges();
  }, []);

  // Form for CCXT Browser
  const [ccxtBrowserForm, setCcxtBrowserForm] = useState<CCXTBrowserFormData>({
    name: '',
    exchangeId: '',
    sandbox: false,
    apiKey: '',
    secret: '',
    password: '',
    uid: ''
  });

  // Form for CCXT Server
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
        setTestResult({ success: false, message: '🛡️ Error creating test provider' });
        return;
      }

      // Direct testing via CCXT
      if (tempProvider.type === 'ccxt-browser') {
        const ccxt = window.ccxt;
        if (!ccxt) {
          setTestResult({ success: false, message: '❌ CCXT not loaded! Check CDN connection' });
          return;
        }

        const config = tempProvider.config as CCXTBrowserConfig;
        const ExchangeClass = ccxt[config.exchangeId];
        
        if (!ExchangeClass) {
          setTestResult({ success: false, message: `❌ Exchange ${config.exchangeId} not found in CCXT` });
          return;
        }

        const exchange = new ExchangeClass({
          ...config,
          enableRateLimit: true,
          timeout: 10000
        });

        // Test loading markets
        const markets = await exchange.loadMarkets();
        const marketCount = Object.keys(markets).length;
        
        setTestResult({
          success: true,
          message: `✅ Connection successful! Exchange ${exchange.name}, found ${marketCount} trading pairs`
        });
      } else if (tempProvider.type === 'ccxt-server') {
        // For CCXT Server we can add simple URL check
        const config = tempProvider.config as CCXTServerConfig;
        try {
          const response = await fetch(config.serverUrl + '/health', { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${config.privateKey}` },
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            setTestResult({
              success: true,
              message: `✅ Server available! URL: ${config.serverUrl}`
            });
          } else {
            setTestResult({
              success: false,
              message: `❌ Server unavailable. Status: ${response.status}`
            });
          }
        } catch (fetchError) {
          setTestResult({
            success: false,
            message: `❌ Server connection error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
          });
        }
      }
    } catch (error) {
      console.error('🛡️ Caught testing error:', error);
      setTestResult({ 
        success: false, 
        message: `🛡️ Safe error handling: ${error instanceof Error ? error.message : 'Unknown error'}` 
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

  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const provider = createTempProvider();
    if (!provider) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Create real ID
      provider.id = `${provider.type}-${Date.now()}`;
      
      addProvider(provider);
      
      setSubmitResult({
        success: true,
        message: `Provider "${provider.name}" successfully added!`
      });
      
      // Clear form
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
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error adding provider'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = providerType === 'ccxt-browser' 
    ? validateCcxtBrowserForm() 
    : validateCcxtServerForm();

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Data Providers Setup</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Data Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider type selection */}
          <div className="space-y-2">
            <Label>Provider Type</Label>
            <Select value={providerType} onValueChange={(value: DataProviderType) => setProviderType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ccxt-browser">CCXT Browser</SelectItem>
                <SelectItem value="ccxt-server">CCXT Server</SelectItem>
                <SelectItem value="custom" disabled>Custom (coming soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form for CCXT Browser */}
          {providerType === 'ccxt-browser' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="browser-name">Provider Name</Label>
                <Input
                  id="browser-name"
                  value={ccxtBrowserForm.name}
                  onChange={(e) => handleCcxtBrowserFormChange('name', e.target.value)}
                  placeholder="e.g.: Binance Spot"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="browser-exchange">Exchange</Label>
                <Select 
                  value={ccxtBrowserForm.exchangeId} 
                  onValueChange={(value) => handleCcxtBrowserFormChange('exchangeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingExchanges ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading exchanges...
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
                <Label htmlFor="browser-sandbox">Test Mode (Sandbox)</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="browser-apiKey">API Key (optional)</Label>
                  <Input
                    id="browser-apiKey"
                    type="password"
                    value={ccxtBrowserForm.apiKey}
                    onChange={(e) => handleCcxtBrowserFormChange('apiKey', e.target.value)}
                    placeholder="For private data"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="browser-secret">Secret (optional)</Label>
                  <Input
                    id="browser-secret"
                    type="password"
                    value={ccxtBrowserForm.secret}
                    onChange={(e) => handleCcxtBrowserFormChange('secret', e.target.value)}
                    placeholder="For private data"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="browser-password">Passphrase (optional)</Label>
                  <Input
                    id="browser-password"
                    type="password"
                    value={ccxtBrowserForm.password}
                    onChange={(e) => handleCcxtBrowserFormChange('password', e.target.value)}
                    placeholder="For some exchanges"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="browser-uid">UID (optional)</Label>
                  <Input
                    id="browser-uid"
                    value={ccxtBrowserForm.uid}
                    onChange={(e) => handleCcxtBrowserFormChange('uid', e.target.value)}
                    placeholder="For some exchanges"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form for CCXT Server */}
          {providerType === 'ccxt-server' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server-name">Provider Name</Label>
                <Input
                  id="server-name"
                  value={ccxtServerForm.name}
                  onChange={(e) => handleCcxtServerFormChange('name', e.target.value)}
                  placeholder="e.g.: CCXT Server Binance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-exchange">Exchange</Label>
                <Select 
                  value={ccxtServerForm.exchangeId} 
                  onValueChange={(value) => handleCcxtServerFormChange('exchangeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingExchanges ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading exchanges...
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
                <Label htmlFor="server-url">Server URL</Label>
                <Input
                  id="server-url"
                  value={ccxtServerForm.serverUrl}
                  onChange={(e) => handleCcxtServerFormChange('serverUrl', e.target.value)}
                  placeholder="https://your-server.com/api"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="private-key">Private Key</Label>
                <Textarea
                  id="private-key"
                  value={ccxtServerForm.privateKey}
                  onChange={(e) => handleCcxtServerFormChange('privateKey', e.target.value)}
                  placeholder="Private key for authentication"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
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

          {/* Test result */}
          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{testResult.message}</p>
            </div>
          )}

          {/* Submit result */}
          {submitResult && (
            <div className={`p-3 rounded-lg ${
              submitResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{submitResult.message}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              variant="outline"
              disabled={!isFormValid || isTestingConnection}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? 'Adding...' : 'Add Provider'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DataProviderSetupWidget: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Data Provider Setup Widget Error" showDetails={false}>
      <DataProviderSetupWidgetInner />
    </ErrorBoundary>
  );
}; 