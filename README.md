### Stack:
@<MCP_Server_with_documentation>
+ typescript
+ ccxt v4.4.86 @CCXT
+ TanStack Table v8 https://tanstack.com/table/latest @ReactTable 
+ TanStack Form v1: https://tanstack.com/form/ @ReactForm 
+ TanStack Router v1: https://tanstack.com/router/ @ReactRouter
+ TanStack Query v5: https://tanstack.com/query/ @ReactQuery
+ TanStack Virtual: https://tanstack.com/virtual/ @ReactVirtual
+ TanStack range selectors: https://tanstack.com/ranger/ @Ranger
+ rate-limiting and queue: https://tanstack.com/pacer/ @Pacer
+ zod + json schema @Zod 
+ @Recharts
+ night-vision @NightVision 
+ framer-motion @Framer Motion 
+ lucide-react @Lucide 
+ date-fns @Date-fns 
+ react-resizable-panels @React resizable panels 
+ zustand @Zustand 
+ immer @Immer 
+ https://github.com/vercel/swr @swr 
+ https://nextra.site/ for documentation @Nextra 

# Widget Floaty Designer 03

## Последние обновления ✨

### Интеллектуальный выбор CCXT методов для OrderBook

Система теперь автоматически выбирает наиболее эффективный метод WebSocket для каждой биржи:

#### Приоритеты выбора:
1. **`watchOrderBookForSymbols`** - ⚡ diff обновления (самые быстрые)
2. **`watchOrderBook`** - 📋 полные снепшоты (стандартные)
3. **`fetchOrderBook`** - 🔄 REST запросы (fallback)

#### Преимущества:
- 🚀 **Автоматическая оптимизация** - выбор лучшего метода для каждой биржи
- 📊 **Прозрачность** - отображение используемого CCXT метода в UI
- 🔧 **Интеллектуальная обработка** - поддержка разных форматов данных
- ⚡ **Максимальная производительность** - приоритет diff обновлений

#### Что исправлено:
- ✅ Ошибки "Invalid orderbook entry" с gateio
- ✅ Поддержка массивов `[price, amount]` от CCXT Pro
- ✅ Автоматический выбор оптимального метода
- ✅ Debug UI с информацией о текущем методе

## Установка и запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:8087 (или другой доступный порт)

## Использование OrderBook виджета

1. Выберите биржу (binance, gateio, etc.)
2. Укажите торговую пару (BTC/USDT)
3. Нажмите "Подписаться на orderbook"
4. Система автоматически выберет лучший метод
5. В Debug UI увидите используемый CCXT метод

## Технические детали

- **CCXT Pro** для WebSocket соединений
- **Zustand** для управления состоянием
- **React + TypeScript** для UI
- **Tailwind CSS** для стилизации 