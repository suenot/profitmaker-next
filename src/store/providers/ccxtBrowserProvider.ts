import { getCCXT } from '../utils/ccxtUtils';
import { ccxtInstanceManager } from '../utils/ccxtInstanceManager';
import type { CCXTBrowserProvider } from '../../types/dataProviders';

/**
 * CCXT Browser Provider Implementation
 * Отвечает за получение данных через CCXT библиотеку в браузере
 */
export class CCXTBrowserProviderImpl {
  private provider: CCXTBrowserProvider;

  constructor(provider: CCXTBrowserProvider) {
    this.provider = provider;
  }

  /**
   * Получает все доступные символы для биржи
   */
  async getSymbolsForExchange(exchange: string): Promise<string[]> {
    try {
      // Используем кэшированный instance
      const exchangeInstance = await ccxtInstanceManager.getExchangeInstance(exchange, this.provider);

      if (!exchangeInstance.markets) {
        console.warn(`Markets not loaded for ${exchange}`);
        return [];
      }

      // Get all symbols from markets
      const symbols = Object.keys(exchangeInstance.markets);
      
      // Filter to get only active symbols and sort by popularity
      const activeSymbols = symbols
        .filter(symbol => {
          const market = exchangeInstance.markets[symbol];
          return market && market.active !== false;
        })
        .sort((a, b) => {
          // Sort by popularity (BTC and ETH first)
          if (a.includes('BTC')) return -1;
          if (b.includes('BTC')) return 1;
          if (a.includes('ETH')) return -1;
          if (b.includes('ETH')) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 50); // Limit to 50 most popular

      console.log(`📊 [CCXTBrowser] Retrieved ${activeSymbols.length} symbols for ${exchange} (from cache)`);
      return activeSymbols;
    } catch (error) {
      console.error(`❌ [CCXTBrowser] Error getting symbols for exchange: ${exchange}`, error);
      return [];
    }
  }

  /**
   * Определяет доступные рынки для биржи
   * 100% CCXT-BASED: Только реальные данные из CCXT API
   */
  async getMarketsForExchange(exchange: string): Promise<string[]> {
    try {
      // Используем кэшированный instance
      const exchangeInstance = await ccxtInstanceManager.getExchangeInstance(exchange, this.provider);

      if (!exchangeInstance.markets) {
        console.warn(`❌ [CCXTBrowser] No markets data available for ${exchange}`);
        return [];
      }

      console.log(`🔍 [CCXTBrowser] Analyzing ${exchange} CCXT markets data:`, {
        totalMarkets: Object.keys(exchangeInstance.markets).length,
        sampleMarkets: Object.keys(exchangeInstance.markets).slice(0, 5),
        exchangeInfo: exchangeInstance.describe ? exchangeInstance.describe() : 'No describe()'
      });

      const marketTypes = new Set<string>();
      
      // Анализируем ВСЕ рынки из CCXT
      for (const [symbol, market] of Object.entries(exchangeInstance.markets)) {
        if (market && typeof market === 'object') {
          const marketObj = market as any;
          
          // Логируем структуру первых нескольких рынков для дебага
          if (marketTypes.size < 3) {
            console.log(`📊 [CCXTBrowser] Sample market structure for ${symbol}:`, {
              type: marketObj.type,
              subType: marketObj.subType,
              spot: marketObj.spot,
              future: marketObj.future,
              option: marketObj.option,
              swap: marketObj.swap,
              linear: marketObj.linear,
              inverse: marketObj.inverse,
              settle: marketObj.settle,
              settleId: marketObj.settleId,
              contractSize: marketObj.contractSize,
              expiry: marketObj.expiry
            });
          }
          
          // Извлекаем все возможные типы рынков из CCXT данных
          if (marketObj.type) {
            marketTypes.add(marketObj.type.toLowerCase());
          }
          
          if (marketObj.subType) {
            marketTypes.add(marketObj.subType.toLowerCase());
          }
          
          // Boolean флаги для типов рынков
          if (marketObj.spot === true) {
            marketTypes.add('spot');
          }
          if (marketObj.future === true) {
            marketTypes.add('future');
          }
          if (marketObj.option === true) {
            marketTypes.add('option');
          }
          if (marketObj.swap === true) {
            marketTypes.add('swap');
          }
          if (marketObj.linear === true) {
            marketTypes.add('linear');
          }
          if (marketObj.linear === false) {
            marketTypes.add('inverse');
          }
          
          // Дополнительные индикаторы
          if (marketObj.settle && marketObj.settle !== marketObj.base) {
            marketTypes.add('futures'); // Если есть settlement currency отличная от base
          }
          if (marketObj.expiry) {
            marketTypes.add('expiry'); // Инструменты с истечением
          }
          if (marketObj.contractSize && marketObj.contractSize !== 1) {
            marketTypes.add('contract'); // Контрактные инструменты
          }
        }
      }
      
      console.log(`🎯 [CCXTBrowser] Raw market types detected from CCXT:`, Array.from(marketTypes));
      
      // Конвертируем CCXT типы в стандартные названия
      const finalMarkets: string[] = [];
      
      marketTypes.forEach(type => {
        switch (type) {
          case 'spot':
            if (!finalMarkets.includes('spot')) finalMarkets.push('spot');
            break;
          case 'future':
          case 'futures':
          case 'linear':
          case 'contract':
            if (!finalMarkets.includes('futures')) finalMarkets.push('futures');
            break;
          case 'option':
          case 'options':
          case 'expiry':
            if (!finalMarkets.includes('options')) finalMarkets.push('options');
            break;
          case 'swap':
            if (!finalMarkets.includes('swap')) finalMarkets.push('swap');
            break;
          case 'inverse':
            if (!finalMarkets.includes('inverse')) finalMarkets.push('inverse');
            break;
          case 'margin':
            if (!finalMarkets.includes('margin')) finalMarkets.push('margin');
            break;
        }
      });

      // Дополнительная проверка через CCXT has API (но НЕ добавляем, только подтверждаем)
      const hasCapabilities = {
        futures: !!(exchangeInstance.has?.fetchFuturesBalance || 
                   exchangeInstance.has?.fetchDerivativesMarkets ||
                   exchangeInstance.has?.fetchPositions),
        margin: !!(exchangeInstance.has?.fetchMarginBalance || 
                  exchangeInstance.has?.fetchBorrowRate),
        options: !!(exchangeInstance.has?.fetchOption ||
                   exchangeInstance.has?.fetchOptions)
      };

      console.log(`🔧 [CCXTBrowser] CCXT API capabilities:`, hasCapabilities);
      
      console.log(`✅ [CCXTBrowser] Final markets for ${exchange}:`, {
        total: finalMarkets.length,
        markets: finalMarkets,
        source: '100% CCXT Data',
        hasCapabilities
      });
      
      return finalMarkets.length > 0 ? finalMarkets : [];
    } catch (error) {
      console.error(`❌ [CCXTBrowser] Error getting markets for exchange: ${exchange}`, error);
      return []; // Возвращаем пустой массив, НЕ делаем предположений
    }
  }

  /**
   * Инвалидирует кэш для биржи (используется при изменении настроек)
   */
  invalidateCache(exchange: string): void {
    ccxtInstanceManager.invalidate(exchange, this.provider.id);
  }

  /**
   * Получает статистику кэша
   */
  getCacheStats() {
    return ccxtInstanceManager.getStats();
  }
}

/**
 * Фабрика для создания CCXT Browser провайдера
 */
export const createCCXTBrowserProvider = (provider: CCXTBrowserProvider): CCXTBrowserProviderImpl => {
  return new CCXTBrowserProviderImpl(provider);
}; 