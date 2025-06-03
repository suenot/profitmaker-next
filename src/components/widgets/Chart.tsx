import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { BarChart2, Maximize, RefreshCw, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { NightVision } from 'night-vision';
import { OHLCVData, Timeframe, ChartColors } from '@/types/chart';
import { generateDemoData } from '@/utils/generateDemoData';

// Chart configuration
const CHART_COLORS: ChartColors = {
  back: '#000000',
  grid: '#1a1a1a',
  candleUp: '#26a69a',
  candleDw: '#ef5350',
  wickUp: '#26a69a',
  wickDw: '#ef5350',
  volUp: '#26a69a',
  volDw: '#ef5350',
};

const TIMEFRAMES: Timeframe[] = [
  { id: '1M', label: '1M', value: '1m' },
  { id: '5M', label: '5M', value: '5m' },
  { id: '10M', label: '10M', value: '10m' },
  { id: '1H', label: '1H', value: '1h' },
  { id: '4H', label: '4H', value: '4h' },
  { id: 'D', label: 'D', value: '1d' },
  { id: 'W', label: 'W', value: '1w' },
  { id: 'M', label: 'M', value: '1M' },
];

interface ChartWidgetProps {
  symbol?: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ symbol = 'USDRUB' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const nightVisionRef = useRef<NightVision | null>(null);
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [data, setData] = useState<OHLCVData[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initialize demo data
  useEffect(() => {
    const demoData = generateDemoData(50);
    setData(demoData);
  }, []);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize NightVision instance
  useEffect(() => {
    if (!chartRef.current || !mounted) return;

    // Create a container div for NightVision if it doesn't exist
    let container = document.getElementById(`nightvision-chart-${symbol}`);
    if (!container) {
      container = document.createElement('div');
      container.id = `nightvision-chart-${symbol}`;
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      chartRef.current.appendChild(container);
    }

    // Initialize NightVision instance
    if (!nightVisionRef.current) {
      nightVisionRef.current = new NightVision(`nightvision-chart-${symbol}`, {
        colors: {
          back: CHART_COLORS.back,
          grid: CHART_COLORS.grid
        },
        autoResize: true
      });
    }

    return () => {
      if (nightVisionRef.current) {
        nightVisionRef.current.destroy();
        nightVisionRef.current = null;
      }
      container?.remove();
    };
  }, [mounted, symbol]);

  // Handle chart container size
  useLayoutEffect(() => {
    if (!chartRef.current || !mounted) return;

    const updateSize = () => {
      if (!chartRef.current || !nightVisionRef.current) return;
      nightVisionRef.current.update();
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mounted]);

  // Update chart data
  useEffect(() => {
    if (!nightVisionRef.current || !mounted || !data.length) return;

    try {
      const chart = nightVisionRef.current;
      
      // Format data according to NightVision requirements
      const formattedData = data.map(item => [
        item.timestamp,
        Number(item.open),
        Number(item.high),
        Number(item.low),
        Number(item.close),
        Number(item.volume)
      ]);

      // Create base candlestick overlay
      const mainOverlay = {
        name: symbol,
        type: 'Candles',
        main: true,
        data: formattedData,
        props: {
          showVolume: showVolume,
          colorCandleUp: CHART_COLORS.candleUp,
          colorCandleDw: CHART_COLORS.candleDw,
          colorWickUp: CHART_COLORS.wickUp,
          colorWickDw: CHART_COLORS.wickDw,
          colorVolUp: CHART_COLORS.volUp,
          colorVolDw: CHART_COLORS.volDw
        }
      };

      // Create panes structure
      const panes = [{
        overlays: [mainOverlay]
      }];

      // Set chart data
      chart.data = { panes };
      chart.update();

    } catch (error) {
      console.warn('Error updating chart data:', error);
    }
  }, [mounted, data, symbol, showVolume]);

  // Get current price and change
  const getCurrentPriceInfo = () => {
    if (!data.length) return { price: 0, change: 0, changePercent: 0 };
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (!previous) return { price: latest.close, change: 0, changePercent: 0 };
    
    const change = latest.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    
    return { 
      price: latest.close, 
      change, 
      changePercent 
    };
  };

  const { price, change, changePercent } = getCurrentPriceInfo();
  const isPositive = change >= 0;

  // Handle refresh data
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const newData = generateDemoData(50);
      setData(newData);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm flex items-center text-terminal-muted">
            <Clock size={14} className="mr-1" />
            Chart {symbol}
          </span>
          
          {/* Current price info */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-lg font-mono">
              {price.toFixed(4)}
            </span>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-terminal-positive' : 'text-terminal-negative'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-sm">
                {isPositive ? '+' : ''}{change.toFixed(4)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 rounded hover:bg-terminal-accent/30 disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-terminal-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-1 rounded hover:bg-terminal-accent/30">
            <Maximize size={14} className="text-terminal-muted" />
          </button>
        </div>
      </div>
      
      {/* Timeframe buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-1 items-center">
          {TIMEFRAMES.map(tf => (
            <button 
              key={tf.id}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                timeframe === tf.id 
                  ? 'bg-terminal-accent text-white' 
                  : 'text-terminal-muted hover:bg-terminal-accent/30'
              }`}
              onClick={() => setTimeframe(tf.id)}
            >
              {tf.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowVolume(!showVolume)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showVolume 
                ? 'bg-terminal-accent text-white' 
                : 'bg-terminal-accent/30 text-terminal-muted hover:bg-terminal-accent/50'
            }`}
          >
            Volume
          </button>
          <button className="px-3 py-1 text-xs rounded bg-terminal-accent/30 text-terminal-muted hover:bg-terminal-accent/50">
            Indicators
          </button>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="flex-grow relative min-h-[300px]" ref={chartRef}>
        {!mounted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-terminal-muted">Loading chart...</div>
          </div>
        )}
        
        {/* Time axis labels */}
        <div className="absolute bottom-4 left-4 text-xs text-terminal-muted flex space-x-8 pointer-events-none">
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
          <span>2025</span>
          <span>Feb</span>
        </div>
        
        {/* Volume indicator */}
        {data.length > 0 && (
          <div className="absolute bottom-4 right-4 text-xs text-terminal-muted pointer-events-none">
            Vol: {data[data.length - 1]?.volume.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartWidget;
