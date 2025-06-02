# Dashboard Rename: переименование дашбордов через двойной клик

## Требования
- Двойной клик по названию дашборда в табе для переименования
- Inline редактирование как в macOS Finder
- Сохранение по Enter или потере фокуса
- Отмена по Escape
- UX как в нативных приложениях macOS

## Текущее состояние (проанализированные файлы)
- src/components/TabNavigation.tsx - компонент с табами дашбордов
- src/store/dashboardStore.ts - есть функция updateDashboard
- src/types/dashboard.ts - есть тип UpdateDashboardData

## Логика реализации
1. **Состояние редактирования**: добавить useState для отслеживания редактируемого дашборда
2. **Двойной клик**: onDoubleClick обработчик на название дашборда
3. **Inline input**: заменить span на input при редактировании
4. **Клавиатурные shortcuts**: Enter (сохранить), Escape (отменить)
5. **Автофокус**: фокус на input при начале редактирования
6. **Validation**: проверка что название не пустое

## Техническая архитектура
- React useState для состояния редактирования
- Условный рендеринг: span или input
- useEffect для автофокуса
- Event handlers для клавиатуры
- dashboard store updateDashboard для сохранения

## Реализованная функциональность

### 1. Состояние редактирования (строки 13-15)
```typescript
// Добавлено состояние для отслеживания редактируемого дашборда
const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
const [editingTitle, setEditingTitle] = useState('');
```

### 2. Обработчики событий (строки 75-100)
```typescript
// Двойной клик для начала редактирования
const handleDashboardDoubleClick = (dashboard: any, e: React.MouseEvent) => {
  e.stopPropagation();
  setEditingDashboardId(dashboard.id);
  setEditingTitle(dashboard.title);
};

// Сохранение изменений
const handleTitleSave = () => {
  if (editingDashboardId && editingTitle.trim()) {
    updateDashboard(editingDashboardId, { title: editingTitle.trim() });
  }
  setEditingDashboardId(null);
  setEditingTitle('');
};

// Отмена редактирования
const handleTitleCancel = () => {
  setEditingDashboardId(null);
  setEditingTitle('');
};

// Клавиатурные shortcuts
const handleTitleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleTitleSave();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    handleTitleCancel();
  }
};
```

### 3. Условный рендеринг в табе (строки 102-140)
```typescript
{editingDashboardId === dashboard.id ? (
  <input
    type="text"
    value={editingTitle}
    onChange={(e) => setEditingTitle(e.target.value)}
    onBlur={handleTitleSave}
    onKeyDown={handleTitleKeyDown}
    className="text-sm bg-transparent border-none outline-none w-full min-w-[80px] max-w-[200px]"
    autoFocus
    onClick={(e) => e.stopPropagation()}
  />
) : (
  <span 
    className="text-sm select-none"
    onDoubleClick={(e) => handleDashboardDoubleClick(dashboard, e)}
  >
    {dashboard.title}
  </span>
)}
```

### 4. Особенности UX как в macOS Finder
- ✅ **Двойной клик**: активирует режим редактирования
- ✅ **Inline editing**: input появляется на месте названия
- ✅ **Автофокус**: input автоматически получает фокус
- ✅ **Enter**: сохраняет изменения
- ✅ **Escape**: отменяет редактирование
- ✅ **onBlur**: автосохранение при потере фокуса
- ✅ **Validation**: проверка что название не пустое
- ✅ **stopPropagation**: предотвращение переключения таба при редактировании

### 5. Стилистические решения
- `bg-transparent border-none outline-none`: незаметный input как в Finder
- `select-none`: запрещает выделение текста при двойном клике
- `min-w-[80px] max-w-[200px]`: ограничения ширины input
- `autoFocus`: автоматический фокус при начале редактирования

## Статус: ЗАВЕРШЕНО ✅

Все требования выполнены:
- ✅ Двойной клик по названию дашборда активирует редактирование
- ✅ Inline редактирование как в macOS Finder
- ✅ Сохранение по Enter или потере фокуса (onBlur)
- ✅ Отмена по Escape
- ✅ UX полностью соответствует нативным приложениям macOS
- ✅ Функциональность интегрирована с dashboard store
- ✅ Предотвращено переключение табов во время редактирования 