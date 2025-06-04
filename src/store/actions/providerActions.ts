import type { StateCreator } from 'zustand';
import type { DataProvider, ProviderExchangeMapping } from '../../types/dataProviders';
import type { DataProviderStore } from '../types';
import { 
  selectOptimalProvider, 
  createProviderExchangeMappings, 
  getNextProviderPriority, 
  generateProviderId,
  validateProviderConfig 
} from '../utils/providerUtils';
import { useUserStore } from '../userStore';

export interface ProviderActions {
  addProvider: (provider: DataProvider) => void;
  removeProvider: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
  
  // NEW: Multiple provider management
  enableProvider: (providerId: string) => void;
  disableProvider: (providerId: string) => void;
  toggleProvider: (providerId: string) => void;
  isProviderEnabled: (providerId: string) => boolean;
  getEnabledProviders: () => DataProvider[];
  
  createProvider: (type: 'ccxt-browser' | 'ccxt-server', name: string, exchanges: string[], config?: any) => DataProvider;
  updateProvider: (providerId: string, updates: { name?: string; exchanges?: string[]; priority?: number; config?: any }) => void;
  getProviderForExchange: (exchange: string) => DataProvider | null;
  getProviderExchangeMappings: (exchanges: string[]) => ProviderExchangeMapping[];
  updateProviderPriority: (providerId: string, priority: number) => void;
}

export const createProviderActions: StateCreator<
  DataProviderStore,
  [['zustand/immer', never]],
  [],
  ProviderActions
> = (set, get) => ({
  // Provider management
  addProvider: (provider: DataProvider) => {
    set(state => {
      const validation = validateProviderConfig(provider);
      if (!validation.isValid) {
        console.error(`❌ Invalid provider config:`, validation.errors);
        return;
      }
      
      state.providers[provider.id] = provider;
      if (!state.activeProviderId) {
        state.activeProviderId = provider.id;
      }
      console.log(`🔌 Provider added: ${provider.id}`, provider);
    });
  },

  removeProvider: (providerId: string) => {
    set(state => {
      // Stop all subscriptions using this provider
      Object.keys(state.activeSubscriptions).forEach(key => {
        const subscription = state.activeSubscriptions[key];
        if (subscription.providerId === providerId) {
          get().stopDataFetching(key);
          delete state.activeSubscriptions[key];
        }
      });
      
      delete state.providers[providerId];
      
      if (state.activeProviderId === providerId) {
        const remainingProviders = Object.keys(state.providers);
        state.activeProviderId = remainingProviders.length > 0 ? remainingProviders[0] : null;
      }
      console.log(`🔌 Provider removed: ${providerId}`);
    });
  },

  setActiveProvider: (providerId: string) => {
    set(state => {
      if (state.providers[providerId]) {
        state.activeProviderId = providerId;
        console.log(`🎯 Active provider set to: ${providerId}`);
      }
    });
  },

  // NEW: Multiple provider management
  enableProvider: (providerId: string) => {
    set(state => {
      if (state.providers[providerId]) {
        state.providers[providerId].status = 'connected' as const;
        console.log(`🔄 Enabled provider ${providerId}`);
      }
    });
  },

  disableProvider: (providerId: string) => {
    set(state => {
      if (state.providers[providerId]) {
        state.providers[providerId].status = 'disconnected' as const;
        console.log(`🔄 Disabled provider ${providerId}`);
      }
    });
  },

  toggleProvider: (providerId: string) => {
    set(state => {
      if (state.providers[providerId]) {
        state.providers[providerId].status = state.providers[providerId].status === 'connected' ? 'disconnected' : 'connected' as const;
        console.log(`🔄 Toggled provider ${providerId}`);
      }
    });
  },

  isProviderEnabled: (providerId: string) => {
    return get().providers[providerId]?.status === 'connected' as const;
  },

  getEnabledProviders: () => {
    const providers = Object.values(get().providers);
    return providers.filter(p => p.status === 'connected' as const);
  },

  // NEW: Create provider with simplified config
  createProvider: (type: 'ccxt-browser' | 'ccxt-server', name: string, exchanges: string[], config: any = {}) => {
    const providers = Object.values(get().providers);
    const priority = getNextProviderPriority(providers);
    const id = generateProviderId(type, exchanges, name);
    
    const baseProvider = {
      id,
      name,
      type,
      exchanges,
      priority,
      status: 'connected' as const
    };
    
    let newProvider: DataProvider;
    
    if (type === 'ccxt-browser') {
      newProvider = {
        ...baseProvider,
        type: 'ccxt-browser',
        config: {
          sandbox: config.sandbox || false,
          options: config.options || {}
        }
      };
    } else if (type === 'ccxt-server') {
      newProvider = {
        ...baseProvider,
        type: 'ccxt-server',
        config: {
          serverUrl: config.serverUrl || '',
          timeout: config.timeout || 30000,
          sandbox: config.sandbox || false
        }
      };
    } else {
      throw new Error(`Unsupported provider type: ${type}`);
    }
    
    get().addProvider(newProvider);
    console.log(`🔧 Created new provider:`, newProvider);
    
    return newProvider;
  },

  // NEW: Get provider for specific exchange
  getProviderForExchange: (exchange: string): DataProvider | null => {
    const providers = Object.values(get().providers);
    // Only consider enabled providers (connected status)
    const enabledProviders = providers.filter(p => p.status === 'connected');
    return selectOptimalProvider(enabledProviders, exchange);
  },

  // NEW: Get provider mappings for exchanges
  getProviderExchangeMappings: (exchanges: string[]): ProviderExchangeMapping[] => {
    const providers = Object.values(get().providers);
    // Only consider enabled providers (connected status)
    const enabledProviders = providers.filter(p => p.status === 'connected');
    const userStore = useUserStore.getState();
    const activeUser = userStore.users.find(u => u.id === userStore.activeUserId) || null;
    
    return createProviderExchangeMappings(enabledProviders, exchanges, activeUser);
  },

  // NEW: Update existing provider
  updateProvider: (providerId: string, updates: { name?: string; exchanges?: string[]; priority?: number; config?: any }) => {
    set(state => {
      const provider = state.providers[providerId];
      if (!provider) {
        console.error(`❌ Provider ${providerId} not found for update`);
        return;
      }

      // Update fields
      if (updates.name !== undefined) provider.name = updates.name;
      if (updates.exchanges !== undefined) provider.exchanges = updates.exchanges;
      if (updates.priority !== undefined) provider.priority = updates.priority;
      if (updates.config !== undefined) {
        provider.config = { ...provider.config, ...updates.config };
      }

      // Validate updated provider
      const validation = validateProviderConfig(provider);
      if (!validation.isValid) {
        console.error(`❌ Invalid provider config after update:`, validation.errors);
        return;
      }

      console.log(`🔄 Provider updated: ${providerId}`, provider);
    });
  },

  // NEW: Update provider priority
  updateProviderPriority: (providerId: string, priority: number) => {
    set(state => {
      if (state.providers[providerId]) {
        state.providers[providerId].priority = priority;
        console.log(`🔄 Updated provider ${providerId} priority to ${priority}`);
      }
    });
  }
}); 