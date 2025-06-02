import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useGroupStore } from '../../store/groupStore';
import { useUserStore } from '../../store/userStore';
import { Group } from '../../types/groups';

interface GroupSelectorProps {
  selectedGroupId?: string;
  onGroupSelect: (groupId: string | undefined) => void;
  className?: string;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroupId,
  onGroupSelect,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [accountInput, setAccountInput] = useState('');
  const [exchangeInput, setExchangeInput] = useState('');
  const [tradingPairInput, setTradingPairInput] = useState('');
  const { 
    groups, 
    getGroupById, 
    initializeDefaultGroups 
  } = useGroupStore();

  // User store для получения данных аккаунта
  const { users, activeUserId } = useUserStore();
  const activeUser = users.find(u => u.id === activeUserId);
  const firstAccount = activeUser?.accounts[0];

  // Инициализация групп и пользователя при первом рендере
  React.useEffect(() => {
    initializeDefaultGroups();
    
    // Инициализируем тестового пользователя если нет активного
    if (!activeUser && users.length === 0) {
      // Используем хук внутри компонента - добавляем пользователя через store
      const { addUser, addAccount } = useUserStore.getState();
      addUser({ 
        email: 'suenot@gmail.com',
        name: 'Test User'
      });
      
      // Находим созданного пользователя
      const newUser = useUserStore.getState().users.find(u => u.email === 'suenot@gmail.com');
      if (newUser) {
        addAccount(newUser.id, {
          exchange: 'binance',
          email: 'suenot@gmail.com',
          key: 'test_key',
          privateKey: 'test_private_key'
        });
      }
    }
  }, [initializeDefaultGroups, activeUser, users.length]);

  const selectedGroup = selectedGroupId ? getGroupById(selectedGroupId) : undefined;

  // Инициализация значений input'ов на основе данных пользователя
  React.useEffect(() => {
    if (firstAccount || activeUser) {
      setAccountInput(firstAccount?.email || activeUser?.email || 'suenot@gmail.com');
      setExchangeInput(firstAccount?.exchange || 'binance');
      setTradingPairInput(selectedGroup?.tradingPair || 'btcusdt');
    }
  }, [firstAccount, activeUser, selectedGroup]);



  const handleGroupSelect = (group: Group | null) => {
    onGroupSelect(group?.id);
    setIsOpen(false);
  };

  // Убрали функциональность создания групп - используем только фиксированные 8 групп

  return (
    <div className={`relative ${className}`}>
      {/* Кнопка селектора */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full border border-terminal-border hover:border-terminal-accent transition-colors flex items-center justify-center"
        style={{
          backgroundColor: selectedGroup ? selectedGroup.color : 'transparent',
          borderColor: selectedGroup ? selectedGroup.color : undefined,
        }}
        title={selectedGroup ? `Группа: ${selectedGroup.name}` : 'Выбрать группу'}
      >
        {!selectedGroup && (
          <Plus size={8} className="text-terminal-muted" />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-terminal-widget border border-terminal-border rounded-md shadow-lg z-50">
          <div className="p-3">
            {/* Три input'а для аккаунта, биржи и торговой пары */}
            <div className="space-y-2 mb-3">
              {/* Аккаунт */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Аккаунт"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent"
                />
              </div>
              
              {/* Биржа */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Биржа"
                  value={exchangeInput}
                  onChange={(e) => setExchangeInput(e.target.value)}
                  className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent"
                />
              </div>
              
              {/* Торговая пара с крестиком для сброса группы */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Торговая пара"
                  value={tradingPairInput}
                  onChange={(e) => setTradingPairInput(e.target.value)}
                  className={`w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent ${selectedGroup ? 'pr-8' : ''}`}
                  autoFocus
                />
                {/* Крестик для сброса группы - только если группа выбрана */}
                {selectedGroup && (
                  <button
                    onClick={() => handleGroupSelect(null)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-terminal-accent/20 transition-colors"
                    title="Убрать привязку к группе"
                  >
                    <X size={12} className="text-terminal-muted hover:text-terminal-text" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Список групп */}
            <div className="max-h-48 overflow-y-auto">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded hover:bg-terminal-accent/20 ${
                    selectedGroupId === group.id ? 'bg-terminal-accent/30' : ''
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: group.color }}
                  />
                  <span>{group.tradingPair || group.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay для закрытия */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default GroupSelector; 