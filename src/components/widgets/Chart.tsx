
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart2, Maximize, Menu, ChevronsUpDown, RefreshCw } from 'lucide-react';

// Generate some realistic stock data
const generateChartData = () => {
  const data = [];
  let price = 100 + Math.random() * 10;
  
  for (let i = 0; i < 50; i++) {
    // Simulate price movement with some randomness
    const change = (Math.random() - 0.5) * 2; // Random movement
    price += change;
    
    data.push({
      time: new Date(Date.now() - (50 - i) * 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: price,
      volume: Math.floor(Math.random() * 1000) + 100
    });
  }
  
  return data;
};

const chartData = generateChartData();

interface ChartWidgetProps {
  symbol?: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ symbol = 'AAPL' }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [currentPrice, setCurrentPrice] = useState(chartData[chartData.length - 1].price.toFixed(2));
  const [priceChange, setPriceChange] = useState({
    value: '+1.24',
    percentage: '+1.25%',
    isPositive: true
  });
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="font-medium mr-1">{symbol}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-terminal-accent/30 text-terminal-muted">NASDAQ</span>
        </div>
        
        <div className="flex space-x-1 items-center">
          {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
            <button 
              key={tf}
              className={`text-xs px-2 py-1 rounded ${timeframe === tf ? 'bg-terminal-accent text-white' : 'text-terminal-muted hover:bg-terminal-accent/30'}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded hover:bg-terminal-accent/30">
            <RefreshCw size={14} className="text-terminal-muted" />
          </button>
          <button className="p-1 rounded hover:bg-terminal-accent/30">
            <ChevronsUpDown size={14} className="text-terminal-muted" />
          </button>
          <button className="p-1 rounded hover:bg-terminal-accent/30">
            <Menu size={14} className="text-terminal-muted" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline">
          <span className="text-2xl font-medium mr-2">${currentPrice}</span>
          <span className={`text-sm ${priceChange.isPositive ? 'text-terminal-positive' : 'text-terminal-negative'}`}>
            {priceChange.value} ({priceChange.percentage})
          </span>
        </div>
      </div>
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#9DA3B4', fontSize: 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
              tickLine={false}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']} 
              tick={{ fill: '#9DA3B4', fontSize: 10 }} 
              axisLine={false} 
              tickLine={false}
              orientation="right"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E2230', 
                borderColor: '#2E3446',
                borderRadius: '4px',
                fontSize: '12px'
              }} 
              labelStyle={{ color: '#E6E8EC' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#4CAF50" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#priceGradient)" 
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;
