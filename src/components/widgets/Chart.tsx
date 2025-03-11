
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart2, Maximize, Menu, ChevronsUpDown, RefreshCw, Clock } from 'lucide-react';

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

const ChartWidget: React.FC<ChartWidgetProps> = ({ symbol = 'USDRUB' }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [currentPrice, setCurrentPrice] = useState(86.56);
  
  const timeframes = [
    { id: '1M', label: '1М' },
    { id: '5M', label: '5М' },
    { id: '10M', label: '10М' },
    { id: '1H', label: '1Ч' },
    { id: '4H', label: '4Ч' },
    { id: 'D', label: 'Д' },
    { id: 'W', label: 'Н' },
    { id: 'M', label: 'Мес' },
  ];
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm flex items-center text-terminal-muted">
          <Clock size={14} className="mr-1" />
          Деньги не спят: график {symbol}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-1 items-center">
          {timeframes.map(tf => (
            <button 
              key={tf.id}
              className={`text-xs px-2 py-1 rounded ${timeframe === tf.id ? 'bg-terminal-accent text-white' : 'text-terminal-muted hover:bg-terminal-accent/30'}`}
              onClick={() => setTimeframe(tf.id)}
            >
              {tf.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-xs rounded bg-terminal-accent/30 text-terminal-muted hover:bg-terminal-accent/50">
            Индикаторы
          </button>
          <button className="p-1 rounded hover:bg-terminal-accent/30">
            <Maximize size={14} className="text-terminal-muted" />
          </button>
        </div>
      </div>
      
      <div className="flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#9DA3B4', fontSize: 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} 
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
              formatter={(value: number) => [`${value.toFixed(4)}`, 'Цена']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#4878ff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#priceGradient)" 
              animationDuration={300}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#4878ff" 
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: '#4878ff', stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="absolute bottom-4 left-4 text-xs text-terminal-muted flex space-x-8">
          <span>сент.</span>
          <span>окт.</span>
          <span>нояб.</span>
          <span>дек.</span>
          <span>2025</span>
          <span>февр.</span>
        </div>
        
        <div className="absolute bottom-4 right-4 text-xs text-terminal-muted">
          57162
        </div>
      </div>
    </div>
  );
};

export default ChartWidget;
