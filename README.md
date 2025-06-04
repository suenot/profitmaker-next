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

## Latest Updates ✨

### Intelligent CCXT Method Selection for OrderBook

The system now automatically selects the most efficient WebSocket method for each exchange:

#### Selection Priorities:
1. **`watchOrderBookForSymbols`** - ⚡ diff updates (fastest)
2. **`watchOrderBook`** - 📋 full snapshots (standard)
3. **`fetchOrderBook`** - 🔄 REST requests (fallback)

#### Benefits:
- 🚀 **Automatic optimization** - best method selection for each exchange
- 📊 **Transparency** - display of used CCXT method in UI
- 🔧 **Intelligent processing** - support for different data formats
- ⚡ **Maximum performance** - priority for diff updates

#### What's Fixed:
- ✅ "Invalid orderbook entry" errors with gateio
- ✅ Support for `[price, amount]` arrays from CCXT Pro
- ✅ Automatic optimal method selection
- ✅ Debug UI with current method information

## Installation and Setup

```bash
npm install
npm run dev
```

Open http://localhost:8087 (or another available port)

## Using OrderBook Widget

1. Select exchange (binance, gateio, etc.)
2. Specify trading pair (BTC/USDT)
3. Click "Subscribe to orderbook"
4. System automatically selects best method
5. See used CCXT method in Debug UI

## Technical Details

- **CCXT Pro** for WebSocket connections
- **Zustand** for state management
- **React + TypeScript** for UI
- **Tailwind CSS** for styling 