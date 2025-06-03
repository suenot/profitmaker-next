# DataProvider Store - Модульная архитектура

Этот документ описывает модульную архитектуру DataProvider Store после рефакторинга от больших монолитных файлов к логически разделенным модулям.

## 🎯 Цели рефакторинга

- **Читаемость**: Разбить файл 809 строк на логические модули
- **Поддерживаемость**: Легче находить и редактировать конкретную функциональность  
- **Расширяемость**: Проще добавлять новые features без конфликтов
- **Тестируемость**: Возможность юнит-тестирования отдельных модулей

## 📁 Структура файлов

```
src/store/
├── dataProviderStore.ts      # Основной store (65 строк)
├── types.ts                  # Типы для store (75 строк)
├── utils/
│   └── ccxtUtils.ts         # CCXT утилиты (29 строк)
└── actions/
    ├── providerActions.ts   # Управление поставщиками (55 строк)
    ├── subscriptionActions.ts # Управление подписками (77 строк)  
    ├── dataActions.ts       # Работа с данными (153 строки)
    ├── fetchingActions.ts   # WebSocket/REST получение (318 строк)
    └── ccxtActions.ts       # CCXT специфичные методы (67 строк)
```

## 🔧 Модули

### 1. Основной Store (`dataProviderStore.ts`)
- Создание Zustand store с middleware (immer, subscribeWithSelector)
- Композиция всех action модулей
- Определение начального состояния с default provider

### 2. Типы (`types.ts`) 
- `DataProviderState` - интерфейс состояния
- `DataProviderActions` - интерфейс действий
- `DataProviderStore` - основной тип store

### 3. Утилиты (`utils/ccxtUtils.ts`)
- `getCCXT()` - получение CCXT из глобального объекта
- `getCCXTPro()` - получение CCXT Pro для WebSocket

### 4. Actions

#### Provider Actions (`providerActions.ts`)
Управление поставщиками данных:
- `addProvider()` - добавление поставщика  
- `removeProvider()` - удаление поставщика
- `setActiveProvider()` - установка активного поставщика

#### Subscription Actions (`subscriptionActions.ts`) 
Управление подписками с дедупликацией:
- `subscribe()` - создание подписки с умной дедупликацией
- `unsubscribe()` - отписка с подсчетом подписчиков

#### Data Actions (`dataActions.ts`)
Работа с данными и настройками:
- `setDataFetchMethod()` - смена метода получения данных (WebSocket/REST)
- `setRestInterval()` - настройка интервалов REST запросов
- `getCandles()`, `getTrades()`, `getOrderBook()` - получение данных
- `updateCandles()`, `updateTrades()`, `updateOrderBook()` - обновление данных
- Утилиты для работы с ключами подписок

#### Fetching Actions (`fetchingActions.ts`)
WebSocket и REST получение данных:
- `startDataFetching()` - запуск получения данных для подписки
- `stopDataFetching()` - остановка получения данных
- `startWebSocketFetching()` - WebSocket потоки через CCXT Pro
- `startRestFetching()` - REST polling через CCXT

#### CCXT Actions (`ccxtActions.ts`)
CCXT специфичные методы:
- `selectOptimalOrderBookMethod()` - интеллектуальный выбор orderbook метода
- `cleanup()` - очистка store

## 🔄 Использование

Импорт и использование остается точно таким же:

```typescript
import { useDataProviderStore } from './store/dataProviderStore';

// В компоненте
const { subscribe, getCandles, setDataFetchMethod } = useDataProviderStore();
```

## ⚡ Преимущества новой архитектуры

1. **Модульность**: Каждый файл отвечает за конкретную область функциональности
2. **Изоляция**: Изменения в одном модуле не влияют на другие  
3. **Повторное использование**: Actions можно переиспользовать в других stores
4. **Типизация**: Четкое разделение типов состояния и действий
5. **Дебаг**: Легче находить источник проблем по названию файла
6. **Code Review**: Проще ревьюить изменения в конкретных областях

## 🚀 Совместимость

✅ **Полная обратная совместимость** - все существующие компоненты работают без изменений.

TypeScript компиляция проходит без ошибок, все типы совпадают с предыдущей версией. 