import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { BarChart2, Maximize, RefreshCw, Clock, Settings, Play, Pause } from 'lucide-react';
import { NightVision } from 'night-vision';
import { useDataProviderStore } from '../../store/dataProviderStore';
import { Timeframe, MarketType, ChartUpdateEvent, Candle } from '../../types/dataProviders';

// Chart configuration
const CHART_COLORS = {
  back: '#000000',
  grid: '#1a1a1a',
  candleUp: '#26a69a',
  candleDw: '#ef5350',
  wickUp: '#26a69a',
  wickDw: '#ef5350',
  volUp: '#26a69a',
  volDw: '#ef5350',
};

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: '1m', label: '1M' },
  { id: '5m', label: '5M' },
  { id: '15m', label: '15M' },
  { id: '30m', label: '30M' },
  { id: '1h', label: '1H' },
  { id: '4h', label: '4H' },
  { id: '1d', label: '1D' },
];

const EXCHANGES = [
  { id: 'binance', label: 'Binance' },
  { id: 'bybit', label: 'Bybit' },
  { id: 'okx', label: 'OKX' },
  { id: 'kucoin', label: 'KuCoin' },
];

const MARKETS: { id: MarketType; label: string }[] = [
  { id: 'spot', label: 'Spot' },
  { id: 'futures', label: 'Futures' },
];

interface ChartProps {
  dashboardId?: string;
  widgetId?: string;
  initialExchange?: string;
  initialSymbol?: string;
  initialTimeframe?: Timeframe;
  initialMarket?: MarketType;
}

const Chart: React.FC<ChartProps> = ({
  dashboardId = 'default',
  widgetId = 'chart-widget',
  initialExchange = 'binance',
  initialSymbol = 'BTC/USDT',
  initialTimeframe = '1h',
  initialMarket = 'spot'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const nightVisionRef = useRef<any>(null);
  
  // Store integration
  const { 
    subscribe, 
    unsubscribe, 
    initializeChartData,
    providers,
    activeProviderId,
    dataFetchSettings,
    getActiveSubscriptionsList,
    addChartUpdateListener,
    removeChartUpdateListener
  } = useDataProviderStore();

  // Widget state
  const [exchange, setExchange] = useState(initialExchange);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [market, setMarket] = useState<MarketType>(initialMarket);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chart state
  const [chartDimensions, setChartDimensions] = useState({ width: 600, height: 400 });
  const [showVolume, setShowVolume] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const activeSubscriptions = getActiveSubscriptionsList();
  
  // Check if we have active subscription for current settings
  const currentSubscriptionKey = `${exchange}:${market}:${symbol}:candles:${timeframe}`;
  const currentSubscription = activeSubscriptions.find(sub => 
    sub.key.exchange === exchange && 
    sub.key.symbol === symbol && 
    sub.key.dataType === 'candles' &&
    sub.key.timeframe === timeframe &&
    sub.key.market === market
  );

  // Chart initialization flag
  const [isChartInitialized, setIsChartInitialized] = useState(false);
  const [chartDataLoaded, setChartDataLoaded] = useState(false);

  // Handle chart resize with ResizeObserver
  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        const newDimensions = {
          width: Math.max(rect.width || 600, 300), // Минимальная ширина
          height: Math.max(rect.height || 400, 200) // Минимальная высота
        };
        
        // Обновляем только если размеры действительно изменились
        setChartDimensions(prev => {
          if (prev.width !== newDimensions.width || prev.height !== newDimensions.height) {
            console.log(`📐 [Chart] Dimensions changed: ${prev.width}x${prev.height} → ${newDimensions.width}x${newDimensions.height}`);
            return newDimensions;
          }
          return prev;
        });
      }
    };

    updateDimensions();

    // Используем ResizeObserver для более точного отслеживания
    let resizeObserver: ResizeObserver | null = null;
    
    if (chartRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          const { width, height } = entry.contentRect;
          
          const newDimensions = {
            width: Math.max(width || 600, 300),
            height: Math.max(height || 400, 200)
          };
          
          setChartDimensions(prev => {
            if (prev.width !== newDimensions.width || prev.height !== newDimensions.height) {
              console.log(`🔍 [Chart] ResizeObserver: ${prev.width}x${prev.height} → ${newDimensions.width}x${newDimensions.height}`);
              return newDimensions;
            }
            return prev;
          });
        }
      });
      
      resizeObserver.observe(chartRef.current);
      console.log(`👁️ [Chart] ResizeObserver attached`);
    } else {
      // Fallback для старых браузеров
      window.addEventListener('resize', updateDimensions);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        console.log(`👁️ [Chart] ResizeObserver disconnected`);
      } else {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  // Initialize empty NightVision chart
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // Destroy existing chart
      if (nightVisionRef.current) {
        nightVisionRef.current.destroy?.();
      }

      // Create new NightVision instance with empty data
      const chartId = `chart-${Date.now()}`;
      chartRef.current.id = chartId;
      nightVisionRef.current = new NightVision(chartId, {
        width: chartDimensions.width,
        height: chartDimensions.height,
        colors: {
          back: CHART_COLORS.back,
          grid: CHART_COLORS.grid
        },
        data: { panes: [] }, // Empty data initially
        autoResize: true
      });

      console.log(`📊 Empty NightVision chart initialized for ${exchange}:${symbol}:${timeframe}`);
      setIsChartInitialized(true);
    } catch (error) {
      console.error('❌ Failed to initialize NightVision chart:', error);
      setError('Failed to initialize chart');
      setIsChartInitialized(false);
    }

    return () => {
      if (nightVisionRef.current) {
        nightVisionRef.current.destroy?.();
        nightVisionRef.current = null;
      }
      setIsChartInitialized(false);
    };
  }, [exchange, symbol, timeframe, market]);

  // REST инициализация данных
  useEffect(() => {
    if (!isChartInitialized || !nightVisionRef.current) return;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setChartDataLoaded(false);

        console.log(`🚀 [Chart] Loading initial data via REST for ${exchange}:${market}:${symbol}:${timeframe}`);
        
        const candles = await initializeChartData(exchange, symbol, timeframe, market);
        
        if (candles && candles.length > 0 && nightVisionRef.current) {
          // Конвертируем в NightVision формат
          const ohlcvData = candles.map(candle => [
            candle.timestamp,
            candle.open,
            candle.high,
            candle.low,
            candle.close,
            candle.volume
          ]);

          // Создаем panes структуру
          const panes = [
            {
              overlays: [
                {
                  name: 'OHLCV',
                  type: 'Candles',
                  data: ohlcvData,
                  main: true,
                  props: {
                    colorCandleUp: CHART_COLORS.candleUp,
                    colorCandleDw: CHART_COLORS.candleDw,
                    colorWickUp: CHART_COLORS.wickUp,
                    colorWickDw: CHART_COLORS.wickDw,
                  }
                }
              ]
            }
          ];

          // Добавляем volume pane если включен
          if (showVolume) {
            const volumeData = candles.map(candle => [
              candle.timestamp,
              candle.volume
            ]);

            panes.push({
              overlays: [
                {
                  name: 'Volume',
                  type: 'Volume',
                  data: volumeData,
                  main: false,
                  props: {
                    colorCandleUp: CHART_COLORS.volUp,
                    colorCandleDw: CHART_COLORS.volDw,
                    colorWickUp: CHART_COLORS.volUp,
                    colorWickDw: CHART_COLORS.volDw,
                  }
                }
              ]
            });
          }

          // Обновляем chart напрямую
          nightVisionRef.current.data = { panes };
          nightVisionRef.current.update("data");
          
          setChartDataLoaded(true);
          console.log(`✅ [Chart] Initial data loaded: ${candles.length} candles`);
        }
      } catch (error) {
        console.error(`❌ [Chart] Failed to load initial data:`, error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isChartInitialized, exchange, symbol, timeframe, market, showVolume, initializeChartData]);

  // Handle chart resize without recreating
  useEffect(() => {
    if (!nightVisionRef.current || !isChartInitialized) return;

    console.log(`📐 [Chart] Resizing chart to ${chartDimensions.width}x${chartDimensions.height}`);
    
    try {
      // Обновляем размеры NightVision chart
      nightVisionRef.current.options.width = chartDimensions.width;
      nightVisionRef.current.options.height = chartDimensions.height;
      
      // Вызываем resize если доступен
      if (typeof nightVisionRef.current.resize === 'function') {
        nightVisionRef.current.resize(chartDimensions.width, chartDimensions.height);
        console.log(`✅ [Chart] Used resize() method`);
      } else {
        // Альтернативно - обновляем через update
        nightVisionRef.current.update();
        console.log(`✅ [Chart] Used update() method for resize`);
      }
    } catch (error) {
      console.error(`❌ [Chart] Failed to resize chart:`, error);
    }
  }, [chartDimensions, isChartInitialized]);

  // Event-driven chart updates (заменяем polling на events из store)
  const chartUpdateListener = useCallback((event: ChartUpdateEvent) => {
    if (!nightVisionRef.current || !chartDataLoaded) {
      console.log(`📊 [Chart] Event received but chart not ready:`, event.type, { chartReady: !!nightVisionRef.current, dataLoaded: chartDataLoaded });
      return;
    }

    const chartInstance = nightVisionRef.current;
    
    console.log(`📊 [Chart] Processing ${event.type} event:`, {
      type: event.type,
      exchange: event.exchange,
      symbol: event.symbol,
      timeframe: event.timeframe,
      data: event.data
    });

    try {
      if (event.type === 'new_candles') {
        // Новые свечи - добавляем в конец
        if (event.data?.newCandles && chartInstance.hub && chartInstance.hub.mainOv && chartInstance.hub.mainOv.data) {
          const newOhlcvData = event.data.newCandles.map((candle: Candle) => [
            candle.timestamp,
            candle.open,
            candle.high,
            candle.low,
            candle.close,
            candle.volume
          ]);
          
          const mainData = chartInstance.hub.mainOv.data;
          mainData.push(...newOhlcvData);
          chartInstance.update("data");
          console.log(`📈 [Chart] Added ${newOhlcvData.length} new candles`);
        }
      }
      else if (event.type === 'update_last_candle') {
        // Обновление последней свечи - эффективное обновление
        if (event.data?.lastCandle && chartInstance.hub && chartInstance.hub.mainOv && chartInstance.hub.mainOv.data) {
          const mainData = chartInstance.hub.mainOv.data;
          const lastIndex = mainData.length - 1;
          
          if (lastIndex >= 0) {
            const updatedCandle = [
              event.data.lastCandle.timestamp,
              event.data.lastCandle.open,
              event.data.lastCandle.high,
              event.data.lastCandle.low,
              event.data.lastCandle.close,
              event.data.lastCandle.volume
            ];
            
            mainData[lastIndex] = updatedCandle;
            chartInstance.update(); // Эффективное обновление без "data" параметра
            console.log(`🔄 [Chart] Updated last candle: close=${event.data.lastCandle.close}`);
          }
        }
      }
      // Игнорируем initial_load - используем REST инициализацию
    } catch (error) {
      console.error('❌ [Chart] Event processing error:', error);
    }
  }, [chartDataLoaded]);

  // Ref для хранения предыдущих настроек event listener
  const previousEventListenerRef = useRef<{
    exchange: string;
    symbol: string;
    timeframe: Timeframe;
    market: MarketType;
  } | null>(null);

  // Подписка на события store с правильным cleanup
  useEffect(() => {
    if (!nightVisionRef.current) return;

    // Отписываемся от предыдущих событий если они есть
    if (previousEventListenerRef.current) {
      const prev = previousEventListenerRef.current;
      console.log(`📺 [Chart] Unsubscribing from PREVIOUS events: ${prev.exchange}:${prev.symbol}:${prev.timeframe}:${prev.market}`);
      removeChartUpdateListener(prev.exchange, prev.symbol, prev.timeframe, prev.market, chartUpdateListener);
    }

    console.log(`📺 [Chart] Subscribing to events for ${exchange}:${symbol}:${timeframe}:${market}`);
    
    // Добавляем listener для новых настроек
    addChartUpdateListener(exchange, symbol, timeframe, market, chartUpdateListener);
    
    // Сохраняем настройки как предыдущие
    previousEventListenerRef.current = { exchange, symbol, timeframe, market };

    return () => {
      console.log(`📺 [Chart] Cleanup: Unsubscribing from events for ${exchange}:${symbol}:${timeframe}:${market}`);
      removeChartUpdateListener(exchange, symbol, timeframe, market, chartUpdateListener);
      previousEventListenerRef.current = null;
    };
  }, [exchange, symbol, timeframe, market, chartUpdateListener, addChartUpdateListener, removeChartUpdateListener]);

  // Subscription management
  const handleSubscribe = async () => {
    if (!activeProviderId) {
      setError('No active data provider');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const subscriberId = `${dashboardId}-${widgetId}`;
      const result = await subscribe(subscriberId, exchange, symbol, 'candles', timeframe, market);
      
      if (result.success) {
        setIsSubscribed(true);
        
        // ВАЖНО: Сохраняем текущие настройки как предыдущие ПОСЛЕ успешной подписки
        previousSubscriptionRef.current = { exchange, symbol, timeframe, market };
        
        console.log(`📊 Chart subscribed to ${exchange}:${market}:${symbol}:${timeframe} (method: ${dataFetchSettings.method})`);
        console.log(`💾 Saved as previous subscription: ${exchange}:${market}:${symbol}:${timeframe}`);
      } else {
        setError(result.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('❌ Subscription error:', error);
      setError(error instanceof Error ? error.message : 'Subscription failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = () => {
    const subscriberId = `${dashboardId}-${widgetId}`;
    unsubscribe(subscriberId, exchange, symbol, 'candles', timeframe, market);
    setIsSubscribed(false);
    console.log(`📊 Chart unsubscribed from ${exchange}:${market}:${symbol}:${timeframe}`);
  };

    // Ref для хранения предыдущих настроек подписки
  const previousSubscriptionRef = useRef<{
    exchange: string;
    symbol: string;
    timeframe: Timeframe;
    market: MarketType;
  } | null>(null);

  // Auto-subscribe when widget mounts or provider becomes available
  useEffect(() => {
    if (activeProviderId && !isSubscribed) {
      console.log(`📊 Chart auto-subscribing to ${exchange}:${market}:${symbol}:${timeframe}`);
      handleSubscribe();
    }
  }, [activeProviderId]);

  // Правильное управление подписками при смене настроек
  useEffect(() => {
    if (isSubscribed) {
      // Отписываемся от ПРЕДЫДУЩИХ настроек если они есть
      if (previousSubscriptionRef.current) {
        const prev = previousSubscriptionRef.current;
        console.log(`🛑 Chart unsubscribing from PREVIOUS settings: ${prev.exchange}:${prev.market}:${prev.symbol}:${prev.timeframe}`);
        
        const subscriberId = `${dashboardId}-${widgetId}`;
        unsubscribe(subscriberId, prev.exchange, prev.symbol, 'candles', prev.timeframe, prev.market);
      }
      
      // Подписываемся на НОВЫЕ настройки (сохранение произойдет в handleSubscribe)
      setTimeout(() => {
        console.log(`🚀 Chart subscribing to NEW settings: ${exchange}:${market}:${symbol}:${timeframe}`);
        handleSubscribe();
      }, 100);
    }
  }, [exchange, symbol, timeframe, market]);

  // Cleanup при unmount компонента
  useEffect(() => {
    return () => {
      if (previousSubscriptionRef.current && isSubscribed) {
        const prev = previousSubscriptionRef.current;
        console.log(`🧹 Chart cleanup: unsubscribing from ${prev.exchange}:${prev.market}:${prev.symbol}:${prev.timeframe}`);
        
        const subscriberId = `${dashboardId}-${widgetId}`;
        unsubscribe(subscriberId, prev.exchange, prev.symbol, 'candles', prev.timeframe, prev.market);
      }
    };
  }, []);

  // Format display values


  const getConnectionStatus = () => {
    if (!currentSubscription) return 'disconnected';
    if (!currentSubscription.isActive) return 'connecting';
    return 'connected';
  };

  const getStatusColor = () => {
    const status = getConnectionStatus();
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };



  return (
    <div className="flex flex-col h-full bg-terminal-bg border border-terminal-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-terminal-border">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-terminal-accent" />
          <div className="flex items-center gap-2">
            <span className="text-terminal-text font-medium">{symbol}</span>
            <span className="text-terminal-muted text-sm">({exchange.toUpperCase()})</span>
            <span className={`w-2 h-2 rounded-full ${getConnectionStatus() === 'connected' ? 'bg-green-400' : getConnectionStatus() === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'}`} />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 border-b border-terminal-border bg-terminal-surface">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Exchange Selector */}
            <div>
              <label className="block text-xs text-terminal-muted mb-1">Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full px-2 py-1 text-sm bg-terminal-bg border border-terminal-border rounded text-terminal-text focus:border-terminal-accent focus:outline-none"
              >
                {EXCHANGES.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.label}</option>
                ))}
              </select>
            </div>

            {/* Market Selector */}
            <div>
              <label className="block text-xs text-terminal-muted mb-1">Market</label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as MarketType)}
                className="w-full px-2 py-1 text-sm bg-terminal-bg border border-terminal-border rounded text-terminal-text focus:border-terminal-accent focus:outline-none"
              >
                {MARKETS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Symbol Input */}
            <div>
              <label className="block text-xs text-terminal-muted mb-1">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="BTC/USDT"
                className="w-full px-2 py-1 text-sm bg-terminal-bg border border-terminal-border rounded text-terminal-text focus:border-terminal-accent focus:outline-none"
              />
            </div>

            {/* Timeframe Selector */}
            <div>
              <label className="block text-xs text-terminal-muted mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="w-full px-2 py-1 text-sm bg-terminal-bg border border-terminal-border rounded text-terminal-text focus:border-terminal-accent focus:outline-none"
              >
                {TIMEFRAMES.map(tf => (
                  <option key={tf.id} value={tf.id}>{tf.label}</option>
                ))}
              </select>
            </div>

            {/* Controls */}
            <div className="flex items-end gap-2">
              <button
                onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                disabled={isLoading}
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                  isSubscribed 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg'
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : isSubscribed ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                {isLoading ? 'Loading...' : isSubscribed ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>

          {/* Status Info */}
          <div className="mt-3 flex items-center justify-between text-xs text-terminal-muted">
            <div className="flex items-center gap-4">
              <span>Method: {dataFetchSettings.method.toUpperCase()}</span>
              <span>Chart: {isChartInitialized ? 'Ready' : 'Initializing'}</span>
              {currentSubscription && (
                <span className={getStatusColor()}>
                  {currentSubscription.isFallback ? 'Fallback' : 'Primary'} • 
                  {currentSubscription.ccxtMethod || 'Standard'}
                </span>
              )}
            </div>
            {error && (
              <span className="text-red-400">{error}</span>
            )}
          </div>
        </div>
      )}

      {/* Timeframe Quick Selector */}
      <div className="flex items-center gap-1 p-2 border-b border-terminal-border">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              timeframe === tf.id
                ? 'bg-terminal-accent text-terminal-bg'
                : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        <div 
          ref={chartRef} 
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '300px' }}
        />
        
        {/* Loading/Error Overlay */}
        {(isLoading || error || !chartDataLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-terminal-bg/80">
            {isLoading ? (
              <div className="flex items-center gap-2 text-terminal-muted">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading chart data...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center">
                <div className="font-medium">Chart Error</div>
                <div className="text-sm">{error}</div>
              </div>
            ) : (
              <div className="text-terminal-muted text-center">
                <div className="font-medium">Chart Ready</div>
                <div className="text-sm">Start subscription to see real-time data</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
