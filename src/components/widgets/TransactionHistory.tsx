
import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, Filter } from 'lucide-react';

// Sample transaction data
const transactionData = [
  { 
    id: 'ord-123456', 
    type: 'buy', 
    symbol: 'AAPL', 
    quantity: 10, 
    price: 182.67, 
    date: '2023-05-15', 
    time: '14:32:45', 
    status: 'completed' 
  },
  { 
    id: 'ord-123457', 
    type: 'sell', 
    symbol: 'MSFT', 
    quantity: 5, 
    price: 315.75, 
    date: '2023-05-14', 
    time: '10:15:22', 
    status: 'completed' 
  },
  { 
    id: 'ord-123458', 
    type: 'buy', 
    symbol: 'TSLA', 
    quantity: 3, 
    price: 237.49, 
    date: '2023-05-12', 
    time: '09:45:11', 
    status: 'completed' 
  },
  { 
    id: 'ord-123459', 
    type: 'sell', 
    symbol: 'AMZN', 
    quantity: 2, 
    price: 139.85, 
    date: '2023-05-10', 
    time: '11:22:33', 
    status: 'completed' 
  },
  { 
    id: 'ord-123460', 
    type: 'buy', 
    symbol: 'GOOGL', 
    quantity: 4, 
    price: 127.56, 
    date: '2023-05-08', 
    time: '15:48:19', 
    status: 'completed' 
  },
];

const TransactionHistoryWidget: React.FC = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredTransactions = filter === 'all' 
    ? transactionData 
    : transactionData.filter(t => t.type === filter);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Recent Transactions</h3>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select 
              className="bg-terminal-accent border border-terminal-border rounded-md text-xs py-1 pl-2 pr-8 appearance-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1.5 text-terminal-muted pointer-events-none" />
          </div>
          
          <button className="p-1 rounded-md bg-terminal-accent border border-terminal-border">
            <Filter size={14} className="text-terminal-muted" />
          </button>
        </div>
      </div>
      
      <div className="overflow-auto flex-grow">
        <table className="w-full text-sm">
          <thead className="bg-terminal-accent/30 sticky top-0">
            <tr className="text-terminal-muted text-xs">
              <th className="text-left py-2 px-3 font-normal">Order</th>
              <th className="text-left py-2 px-3 font-normal">Symbol</th>
              <th className="text-right py-2 px-3 font-normal">Quantity</th>
              <th className="text-right py-2 px-3 font-normal">Price</th>
              <th className="text-right py-2 px-3 font-normal">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index} className="border-b border-terminal-border/20 hover:bg-terminal-accent/10">
                <td className="py-3 px-3">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${transaction.type === 'buy' ? 'bg-terminal-positive' : 'bg-terminal-negative'}`}></span>
                    <span className="capitalize">{transaction.type}</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-medium">{transaction.symbol}</td>
                <td className="py-3 px-3 text-right">{transaction.quantity}</td>
                <td className="py-3 px-3 text-right">${transaction.price.toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-terminal-muted">
                  <div className="flex flex-col items-end text-xs">
                    <div className="flex items-center">
                      <Calendar size={10} className="mr-1" />
                      {transaction.date}
                    </div>
                    <div className="flex items-center mt-0.5">
                      <Clock size={10} className="mr-1" />
                      {transaction.time}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistoryWidget;
