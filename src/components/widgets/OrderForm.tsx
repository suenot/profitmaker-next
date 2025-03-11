
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit';
type TradeAction = 'buy' | 'sell';

const OrderFormWidget: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [price, setPrice] = useState(182.67);
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [action, setAction] = useState<TradeAction>('buy');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(price.toFixed(2));
  const [stopPrice, setStopPrice] = useState((price * 0.95).toFixed(2));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order submitted', { symbol, orderType, action, quantity, limitPrice, stopPrice });
    // In a real app, you would submit this to your trading API
  };
  
  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline">
          <h3 className="text-xl font-medium">{symbol}</h3>
          <span className="ml-2 text-sm text-terminal-muted">US Stock</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-medium">${price.toFixed(2)}</span>
          <span className="text-xs text-terminal-positive flex items-center">
            <ArrowUp size={12} className="mr-0.5" />
            1.24 (0.68%)
          </span>
        </div>
      </div>
      
      <div className="flex mb-4">
        <button 
          className={`flex-1 py-2 rounded-l-md transition-colors font-medium ${
            action === 'buy' 
              ? 'bg-terminal-positive text-white' 
              : 'bg-terminal-accent text-terminal-muted'
          }`}
          onClick={() => setAction('buy')}
        >
          Buy
        </button>
        <button 
          className={`flex-1 py-2 rounded-r-md transition-colors font-medium ${
            action === 'sell' 
              ? 'bg-terminal-negative text-white' 
              : 'bg-terminal-accent text-terminal-muted'
          }`}
          onClick={() => setAction('sell')}
        >
          Sell
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-terminal-muted mb-1">Order Type</label>
          <div className="relative">
            <select 
              className="w-full bg-terminal-accent border border-terminal-border rounded-md py-2 px-3 appearance-none text-sm"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
              <option value="stop-limit">Stop Limit</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-2.5 text-terminal-muted pointer-events-none" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-terminal-muted mb-1">Quantity</label>
          <input 
            type="number" 
            className="w-full bg-terminal-accent border border-terminal-border rounded-md py-2 px-3 text-sm"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
        </div>
        
        {(orderType === 'limit' || orderType === 'stop-limit') && (
          <div>
            <label className="block text-sm text-terminal-muted mb-1">Limit Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-terminal-muted text-sm">$</span>
              <input 
                type="number" 
                className="w-full bg-terminal-accent border border-terminal-border rounded-md py-2 pl-7 pr-3 text-sm"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                step="0.01"
              />
            </div>
          </div>
        )}
        
        {(orderType === 'stop' || orderType === 'stop-limit') && (
          <div>
            <label className="block text-sm text-terminal-muted mb-1">Stop Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-terminal-muted text-sm">$</span>
              <input 
                type="number" 
                className="w-full bg-terminal-accent border border-terminal-border rounded-md py-2 pl-7 pr-3 text-sm"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                step="0.01"
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm text-terminal-muted mb-1">Total</label>
          <div className="w-full bg-terminal-accent/50 border border-terminal-border rounded-md py-2 px-3 text-sm">
            ${(price * quantity).toFixed(2)}
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`w-full py-3 rounded-md font-medium transition-colors ${
            action === 'buy'
              ? 'bg-terminal-positive hover:bg-terminal-positive/90'
              : 'bg-terminal-negative hover:bg-terminal-negative/90'
          }`}
        >
          {action === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </button>
      </form>
    </div>
  );
};

export default OrderFormWidget;
