
import React from 'react';
import { Plus, LayoutGrid, X, User } from 'lucide-react';

const TabNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  
  const tabs = [
    { id: 'tab-1', icon: <User size={14} />, label: 'Васи (И)', closable: true },
    { id: 'tab-2', label: 'Вкладка', closable: false },
    { id: 'tab-3', label: 'Сделки инсайдеров', closable: false },
    { id: 'tab-4', label: 'Вкладка', closable: false },
    { id: 'tab-5', label: 'Вкладка', closable: false },
    { id: 'tab-6', label: 'Вкладка', closable: false },
    { id: 'tab-7', label: 'Подбор акций', closable: false },
    { id: 'tab-8', label: 'Вкладка', closable: false },
  ];
  
  return (
    <div className="flex items-center justify-between h-12 px-2 bg-terminal-bg border-b border-terminal-border">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 h-full cursor-pointer border-r border-terminal-border whitespace-nowrap ${
              activeTab === index ? 'bg-terminal-accent/20 text-terminal-text' : 'text-terminal-muted hover:bg-terminal-accent/10'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            <span className="text-sm">{tab.label}</span>
            {tab.closable && (
              <button className="ml-2 p-0.5 rounded-full hover:bg-terminal-accent/50">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        
        <button className="flex items-center justify-center w-10 h-full text-terminal-muted hover:bg-terminal-accent/20">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="flex items-center">
        <button className="flex items-center px-3 py-1 text-sm text-terminal-muted hover:text-terminal-text">
          <LayoutGrid size={16} className="mr-1" />
          <span>Виджеты</span>
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
