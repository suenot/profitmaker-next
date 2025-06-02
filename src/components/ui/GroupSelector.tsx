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
    initializeDefaultGroups,
    setTradingPair,
    setAccount,
    setExchange,
    resetGroup
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

  // Инициализация значений input'ов на основе данных пользователя и группы
  React.useEffect(() => {
    if (selectedGroup) {
      // Если группа выбрана, показываем данные из группы
      setAccountInput(selectedGroup.account || firstAccount?.email || activeUser?.email || 'suenot@gmail.com');
      setExchangeInput(selectedGroup.exchange || firstAccount?.exchange || 'binance');
      setTradingPairInput(selectedGroup.tradingPair || 'btcusdt');
    } else {
      // Если группа не выбрана, показываем данные пользователя
      setAccountInput(firstAccount?.email || activeUser?.email || 'suenot@gmail.com');
      setExchangeInput(firstAccount?.exchange || 'binance');
      setTradingPairInput('btcusdt');
    }
  }, [firstAccount, activeUser, selectedGroup]);

  // Обработчики изменения input'ов с синхронизацией в store
  const handleAccountChange = (value: string) => {
    setAccountInput(value);
    if (selectedGroup) {
      setAccount(selectedGroup.id, value);
    }
  };

  const handleExchangeChange = (value: string) => {
    setExchangeInput(value);
    if (selectedGroup) {
      setExchange(selectedGroup.id, value);
    }
  };

  const handleTradingPairChange = (value: string) => {
    setTradingPairInput(value);
    if (selectedGroup) {
      setTradingPair(selectedGroup.id, value);
    }
  };



  const handleGroupSelect = (group: Group | null) => {
    onGroupSelect(group?.id);
    setIsOpen(false);
  };

  // Функция для получения названия цвета на английском
  const getColorName = (color: string) => {
    const colorMap: Record<string, string> = {
      'transparent': 'Transparent',
      '#00BCD4': 'Cyan',
      '#F44336': 'Red',
      '#9C27B0': 'Purple',
      '#2196F3': 'Blue',
      '#4CAF50': 'Green',
      '#FFC107': 'Yellow',
      '#FF9800': 'Orange',
      '#E91E63': 'Pink',
    };
    return colorMap[color] || 'Unknown';
  };

  // Функция для сброса группы
  const handleResetGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation(); // предотвращаем выбор группы при клике на крестик
    resetGroup(groupId);
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
        <div className="absolute top-full left-0 mt-1 w-96 bg-terminal-widget border border-terminal-border rounded-md shadow-lg z-50">
          <div className="p-3">
            {/* Три input'а для аккаунта, биржи и торговой пары */}
            <div className="space-y-2 mb-3">
              {/* Аккаунт */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Аккаунт"
                  value={accountInput}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent"
                />
              </div>
              
              {/* Биржа */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Биржа"
                  value={exchangeInput}
                  onChange={(e) => handleExchangeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent"
                />
              </div>
              
              {/* Торговая пара с крестиком для сброса группы */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Торговая пара"
                  value={tradingPairInput}
                  onChange={(e) => handleTradingPairChange(e.target.value)}
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
                <div
                  key={group.id}
                  className={`group w-full flex items-center px-3 py-2 text-sm rounded hover:bg-terminal-accent/20 cursor-pointer relative ${
                    selectedGroupId === group.id ? 'bg-terminal-accent/30' : ''
                  }`}
                  onClick={() => handleGroupSelect(group)}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0 border"
                    style={{ 
                      backgroundColor: group.color === 'transparent' ? 'transparent' : group.color,
                      borderColor: group.color === 'transparent' ? 'hsl(var(--terminal-border))' : group.color
                    }}
                  />
                  <span className="text-left flex-1">
                    {group.account || group.exchange || group.tradingPair 
                      ? `${group.account || 'account'} | ${group.exchange || 'exchange'} | ${group.tradingPair || 'pair'}`
                      : getColorName(group.color)
                    }
                  </span>
                  {/* Крестик для сброса группы - показывается при hover, скрыт для прозрачной группы */}
                  {group.color !== 'transparent' && (
                    <button
                      onClick={(e) => handleResetGroup(e, group.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-terminal-accent/30 transition-opacity"
                      title="Сбросить настройки группы"
                    >
                      <X size={12} className="text-terminal-muted hover:text-terminal-text" />
                    </button>
                  )}
                </div>
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