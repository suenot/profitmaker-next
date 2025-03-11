
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown, Percent } from 'lucide-react';

const portfolioData = [
  { name: 'Stocks', value: 12500, color: '#4CAF50' },
  { name: 'Bonds', value: 5000, color: '#2196F3' },
  { name: 'Cash', value: 3000, color: '#FFC107' },
  { name: 'Crypto', value: 2200, color: '#9C27B0' },
  { name: 'Other', value: 1000, color: '#FF5722' },
];

const topHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc.', value: 4250, change: +2.34, price: 182.63 },
  { symbol: 'MSFT', name: 'Microsoft', value: 3800, change: +1.05, price: 315.75 },
  { symbol: 'AMZN', name: 'Amazon', value: 2450, change: -0.72, price: 139.85 },
  { symbol: 'TSLA', name: 'Tesla', value: 2000, change: +3.45, price: 237.49 },
];

const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);

const PortfolioWidget: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <h3 className="text-sm text-terminal-muted">Total Balance</h3>
          <p className="text-2xl font-medium">${totalValue.toLocaleString()}</p>
        </div>
        <div className="text-terminal-positive flex items-center">
          <ArrowUp size={14} className="mr-1" />
          <span className="text-sm">2.3%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                contentStyle={{ backgroundColor: '#1E2230', borderColor: '#2E3446', borderRadius: '4px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col justify-around">
          {portfolioData.map((item, index) => (
            <div key={index} className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-terminal-muted">{item.name}</span>
              <span className="ml-auto text-sm">{((item.value / totalValue) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <h3 className="text-sm font-medium mb-2">Top Holdings</h3>
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-terminal-muted border-b border-terminal-border">
            <tr>
              <th className="text-left font-normal py-2">Symbol</th>
              <th className="text-right font-normal py-2">Price</th>
              <th className="text-right font-normal py-2">Change</th>
              <th className="text-right font-normal py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {topHoldings.map((holding, index) => (
              <tr key={index} className="border-b border-terminal-border/30 hover:bg-terminal-accent/10">
                <td className="py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{holding.symbol}</span>
                    <span className="text-xs text-terminal-muted">{holding.name}</span>
                  </div>
                </td>
                <td className="text-right py-2">${holding.price}</td>
                <td className={`text-right py-2 ${holding.change >= 0 ? 'text-terminal-positive' : 'text-terminal-negative'}`}>
                  {holding.change >= 0 ? '+' : ''}{holding.change}%
                </td>
                <td className="text-right py-2">${holding.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioWidget;
