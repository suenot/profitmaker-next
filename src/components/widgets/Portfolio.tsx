
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown, ChevronDown, ChevronRight, Settings } from 'lucide-react';

const portfolioData = [
  { name: 'Валюта и металлы', value: 1110.73, color: '#2196F3' },
  { name: 'Фонды', value: 13404600.00, color: '#9C27B0' },
];

const currencyData = [
  { symbol: 'RUB', name: 'Российский рубль', quantity: '1 026,85', price: '', avg: '', value: '1 026,85 ₽', share: '0,01%', profit: '', profitPercent: '' },
  { symbol: 'EUR', name: 'Евро', quantity: '0,72', price: '93,6650 ₽', avg: '79,0475 ₽', value: '67,44 ₽', share: '≈0,00%', profit: '10,52 ₽', profitPercent: '18,49%' },
  { symbol: 'USD', name: 'Доллар США', quantity: '0,19', price: '86,5675 ₽', avg: '91,8200 ₽', value: '16,45 ₽', share: '≈0,00%', profit: '-1,00 ₽', profitPercent: '-5,72%' },
];

const fundsData = [
  { symbol: 'LQDT', name: 'LQDT', quantity: '8 250 000', price: '1,6248 ₽', avg: '1,3589 ₽', value: '13 404 600,00 ₽', share: '99,99%', profit: '2 193 526,50 ₽', profitPercent: '19,57%' },
];

const PortfolioWidget: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-medium">Инвестиционный счёт Васи</h3>
          <p className="text-sm text-terminal-muted">Деньги не спят</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm">
            <span className="mr-2">Стоимость в рублях</span>
            <ChevronDown size={16} />
          </div>
          <div className="flex items-center text-sm">
            <span className="mr-2">Всё время</span>
            <ChevronDown size={16} />
          </div>
          <button className="p-1 rounded hover:bg-terminal-accent/50">
            <Settings size={16} className="text-terminal-muted" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-terminal-accent/20 p-3 rounded-md">
          <div className="text-sm text-terminal-muted mb-1">За сегодня</div>
          <div className="flex items-baseline">
            <span className="text-xl font-medium mr-2">8 248,37 ₽</span>
            <span className="text-terminal-positive">(0,06%)</span>
          </div>
        </div>
        <div className="bg-terminal-accent/20 p-3 rounded-md">
          <div className="text-sm text-terminal-muted mb-1">За всё время</div>
          <div className="flex items-baseline">
            <span className="text-xl font-medium mr-2">2 193 536,03 ₽</span>
            <span className="text-terminal-positive">(19,56%)</span>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="mb-1 border-b border-terminal-border pb-2">
          <div className="grid grid-cols-8 text-xs text-terminal-muted">
            <div className="col-span-1">Название</div>
            <div className="text-right">Всего</div>
            <div className="text-right">Цена</div>
            <div className="text-right">Средняя</div>
            <div className="text-right">Стоимость</div>
            <div className="text-right">Доля</div>
            <div className="text-right">Доход</div>
            <div className="text-right">Доход, %</div>
          </div>
        </div>
        
        {/* Валюта и металлы */}
        <div className="mb-3">
          <div 
            className="flex items-center py-2 cursor-pointer text-sm hover:bg-terminal-accent/10"
            onClick={() => setSelectedCategory(selectedCategory === 'currency' ? null : 'currency')}
          >
            {selectedCategory === 'currency' ? (
              <ChevronDown size={16} className="mr-1" />
            ) : (
              <ChevronRight size={16} className="mr-1" />
            )}
            <span className="font-medium">Валюта и металлы</span>
            <span className="ml-auto">1 110,73 ₽</span>
            <span className="ml-4 w-12 text-right">0,01%</span>
          </div>
          
          {selectedCategory === 'currency' && (
            <div className="pl-6">
              {currencyData.map((item, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-8 py-2 text-sm border-t border-terminal-border/30 hover:bg-terminal-accent/10"
                >
                  <div className="col-span-1 flex items-center">
                    <div className="mr-2 w-6 h-6 rounded-full bg-terminal-accent flex items-center justify-center text-xs">
                      {item.symbol === 'RUB' && '₽'}
                      {item.symbol === 'EUR' && '€'}
                      {item.symbol === 'USD' && '$'}
                    </div>
                    <div>
                      <div>{item.name}</div>
                    </div>
                  </div>
                  <div className="text-right">{item.quantity}</div>
                  <div className="text-right">{item.price}</div>
                  <div className="text-right">{item.avg}</div>
                  <div className="text-right">{item.value}</div>
                  <div className="text-right">{item.share}</div>
                  <div className={`text-right ${item.profit.includes('-') ? 'text-terminal-negative' : item.profit ? 'text-terminal-positive' : ''}`}>
                    {item.profit}
                  </div>
                  <div className={`text-right ${item.profitPercent.includes('-') ? 'text-terminal-negative' : item.profitPercent ? 'text-terminal-positive' : ''}`}>
                    {item.profitPercent}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Фонды */}
        <div className="mb-3">
          <div 
            className="flex items-center py-2 cursor-pointer text-sm hover:bg-terminal-accent/10"
            onClick={() => setSelectedCategory(selectedCategory === 'funds' ? null : 'funds')}
          >
            {selectedCategory === 'funds' ? (
              <ChevronDown size={16} className="mr-1" />
            ) : (
              <ChevronRight size={16} className="mr-1" />
            )}
            <span className="font-medium">Фонды</span>
            <span className="ml-auto">13 404 600,00 ₽</span>
            <span className="ml-4 w-12 text-right">99,99%</span>
          </div>
          
          {selectedCategory === 'funds' && (
            <div className="pl-6">
              {fundsData.map((item, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-8 py-2 text-sm border-t border-terminal-border/30 hover:bg-terminal-accent/10"
                >
                  <div className="col-span-1 flex items-center">
                    <div className="mr-2 w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-xs">
                      LQ
                    </div>
                    <div>
                      <div>{item.name}</div>
                    </div>
                  </div>
                  <div className="text-right">{item.quantity}</div>
                  <div className="text-right">{item.price}</div>
                  <div className="text-right">{item.avg}</div>
                  <div className="text-right">{item.value}</div>
                  <div className="text-right">{item.share}</div>
                  <div className="text-right text-terminal-positive">{item.profit}</div>
                  <div className="text-right text-terminal-positive">{item.profitPercent}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioWidget;
