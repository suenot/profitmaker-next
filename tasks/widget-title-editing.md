# Widget Title Editing Task

## Цель
Реализовать функционал переименования виджетов по двойному клику на заголовок виджета, аналогично macOS Finder.

## Требования
1. По двойному клику на заголовок виджета (НЕ на иконки в шапке) должно появляться поле ввода для редактирования названия
2. В виджете должно храниться два поля: `defaultTitle` и `userTitle`
3. Если `userTitle` пустой - показывать `defaultTitle`
4. Если пользователь ввел пустую строку - очистить `userTitle` и показывать `defaultTitle`

## Текущее состояние
- Виджеты имеют только поле `title: string` в схеме `WidgetSchema`
- Заголовок отображается в компоненте `WidgetSimple.tsx` на строке ~339: `<h3 className="text-xs font-medium truncate text-terminal-text">{title}</h3>`
- Используется стор `dashboardStore` для управления состоянием виджетов

## План реализации
1. ✅ Изучить текущую структуру проекта
2. ✅ Обновить типы `WidgetSchema` добавив поля `defaultTitle` и `userTitle`
3. ✅ Обновить стор добавив метод для обновления названия виджета `updateWidgetTitle`
4. ✅ Модифицировать компонент `WidgetSimple` для:
   - ✅ Обработки двойного клика на заголовке (но не на иконках)
   - ✅ Показа инлайн-редактора названия
   - ✅ Отображения правильного title (userTitle || defaultTitle)
5. ✅ Обновить создание виджетов для установки defaultTitle в `createDefaultDashboard` и `WidgetMenu`
6. ✅ Обновить передачу пропсов в `TradingTerminal`

## Проверенные пути
- `/src/types/dashboard.ts` - схемы типов
- `/src/store/dashboardStore.ts` - стор состояния
- `/src/components/WidgetSimple.tsx` - основной компонент виджета
- `/src/components/widgets/` - реализации конкретных виджетов

## Реализованные изменения

### 1. Типы (`src/types/dashboard.ts`)
- Добавлены поля `defaultTitle: z.string()` и `userTitle: z.string().optional()` в `WidgetSchema`
- Поле `title` помечено как deprecated для обратной совместимости

### 2. Стор (`src/store/dashboardStore.ts`)
- Добавлен метод `updateWidgetTitle(dashboardId, widgetId, userTitle)` в интерфейс и реализацию
- Логика: если `userTitle` пустая строка, устанавливается `undefined`, иначе сохраняется обрезанное значение
- Обновлены виджеты в `createDefaultDashboard()` с полями `defaultTitle` и `userTitle: undefined`

### 3. Создание виджетов (`src/components/WidgetMenu.tsx`)
- Обновлен метод `addWidget` для передачи `defaultTitle` и `userTitle: undefined`

### 4. Компонент виджета (`src/components/WidgetSimple.tsx`)
- Добавлены пропсы `defaultTitle` и `userTitle?`
- Добавлено состояние `isEditingTitle` и `editTitleValue`
- Реализован `handleTitleDoubleClick` с остановкой всплытия событий
- Добавлен инлайн input с обработкой Enter/Escape и onBlur
- Отображается `userTitle || defaultTitle` 
- Автофокус и выделение текста при редактировании

### 5. Использование (`src/pages/TradingTerminal.tsx`)
- Обновлена передача пропсов `defaultTitle` и `userTitle` в компонент `Widget`

## Тестирование
- ✅ Двойной клик на заголовке виджета активирует режим редактирования
- ✅ Клик на иконки в шапке НЕ активирует редактирование  
- ✅ Enter сохраняет изменения
- ✅ Escape отменяет изменения
- ✅ Blur сохраняет изменения
- ✅ Пустая строка очищает userTitle и показывает defaultTitle

## Готово ✅
Функционал переименования виджетов по двойному клику реализован полностью согласно требованиям. 