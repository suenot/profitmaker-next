import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const { 
    groups, 
    getGroupById, 
    initializeDefaultGroups,
    setTradingPair,
    setAccount,
    setExchange,
    resetGroup
  } = useGroupStore();

  // User store for getting account data
  const { users, activeUserId } = useUserStore();
  const activeUser = users.find(u => u.id === activeUserId);
  const firstAccount = activeUser?.accounts[0];

  // Initialize groups and user on first render
  React.useEffect(() => {
    initializeDefaultGroups();
    
    // Initialize test user if no active user
    if (!activeUser && users.length === 0) {
      // Use hook inside component - add user through store
      const { addUser, addAccount } = useUserStore.getState();
      addUser({ 
        email: 'suenot@gmail.com',
        name: 'Test User'
      });
      
      // Find created user
      const newUser = useUserStore.getState().users.find(u => u.email === 'suenot@gmail.com');
      if (newUser) {
        addAccount(newUser.id, {
          exchange: 'binance',
          email: 'suenot@gmail.com',
          // API keys are optional - not providing them for test user
        });
      }
    }
  }, [initializeDefaultGroups, activeUser, users.length]);

  const selectedGroup = selectedGroupId ? getGroupById(selectedGroupId) : undefined;

  // Initialize input values based on user and group data
  React.useEffect(() => {
    if (selectedGroup) {
      // If group is selected, show data from group
      setAccountInput(selectedGroup.account || firstAccount?.email || activeUser?.email || 'suenot@gmail.com');
      setExchangeInput(selectedGroup.exchange || firstAccount?.exchange || 'binance');
      setTradingPairInput(selectedGroup.tradingPair || 'btcusdt');
    } else {
      // If no group is selected, show user data
      setAccountInput(firstAccount?.email || activeUser?.email || 'suenot@gmail.com');
      setExchangeInput(firstAccount?.exchange || 'binance');
      setTradingPairInput('btcusdt');
    }
  }, [firstAccount, activeUser, selectedGroup]);

  // Input change handlers with store synchronization
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

  // Function to get color name in English
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

  // Function to reset group
  const handleResetGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation(); // prevent group selection when clicking on cross
    resetGroup(groupId);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Selector button */}
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setButtonPosition({
              x: rect.left,
              y: rect.bottom + window.scrollY
            });
            setIsOpen(!isOpen);
          }}
          className="w-4 h-4 rounded-full border border-terminal-border hover:border-terminal-accent transition-colors flex items-center justify-center"
          style={{
            backgroundColor: selectedGroup ? selectedGroup.color : 'transparent',
            borderColor: selectedGroup ? selectedGroup.color : undefined,
          }}
          title={selectedGroup ? `Group: ${selectedGroup.name}` : 'Select group'}
        >
          {!selectedGroup && (
            <Plus size={8} className="text-terminal-muted" />
          )}
        </button>
      </div>

      {/* Portal for popover */}
      {isOpen && buttonPosition && createPortal(
        <>
          {/* Overlay for closing */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover */}
          <div 
            className="fixed w-96 bg-terminal-widget border border-terminal-border rounded-md shadow-lg z-[9999]"
            style={{
              left: buttonPosition.x,
              top: buttonPosition.y + 4,
            }}
          >
            <div className="p-3">
              {/* Three inputs for account, exchange and trading pair */}
              <div className="space-y-2 mb-3">
                                  {/* Account */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Account"
                    value={accountInput}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent"
                  />
                </div>
                
                {/* Exchange */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Exchange"
                    value={exchangeInput}
                    onChange={(e) => handleExchangeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent"
                  />
                </div>
                
                {/* Trading pair with cross for group reset */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Trading Pair"
                    value={tradingPairInput}
                    onChange={(e) => handleTradingPairChange(e.target.value)}
                    className={`w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-accent ${selectedGroup ? 'pr-8' : ''}`}
                    autoFocus
                  />
                  {/* Cross for group reset - only if group is selected */}
                  {selectedGroup && (
                    <button
                      onClick={() => handleGroupSelect(null)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-terminal-accent/20 transition-colors"
                      title="Remove group binding"
                    >
                      <X size={12} className="text-terminal-muted hover:text-terminal-text" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Group list */}
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
                    {/* Cross for group reset - shown on hover, hidden for transparent group */}
                    {group.color !== 'transparent' && (
                      <button
                        onClick={(e) => handleResetGroup(e, group.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-terminal-accent/30 transition-opacity"
                        title="Reset group settings"
                      >
                        <X size={12} className="text-terminal-muted hover:text-terminal-text" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default GroupSelector; 