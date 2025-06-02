# Переименование Dashboard табов без цифр

## Задача
Изменить логику создания новых табов Dashboard так, чтобы все новые табы назывались просто "Dashboard" без добавления цифр (не "Dashboard 1", "Dashboard 2", "Dashboard 3", а просто "Dashboard").

## Проблема  
В текущей реализации при создании нового dashboard автоматически добавляется номер:
```typescript
title: `Dashboard ${dashboards.length + 1}`
```

## Анализ кода

### Файлы для изменения:

1. **src/components/TabNavigation.tsx** (строка ~76):
   - Функция `handleAddDashboard` содержит логику создания нового dashboard
   - Там происходит установка названия с цифрой

2. **src/store/dashboardStore.ts** (строка ~26):
   - Функция `createDefaultDashboard` создает первый dashboard с названием "Main Dashboard"
   - При дублировании dashboard добавляется "(Copy)" к названию

### Найденная логика именования:
```typescript
// В TabNavigation.tsx - БЫЛО:
const handleAddDashboard = () => {
  const newId = addDashboard({
    title: `Dashboard ${dashboards.length + 1}`, // <-- ПРОБЛЕМА БЫЛА ТУТ
    description: 'New dashboard',
    // ...
  });
};

// СТАЛО:
const handleAddDashboard = () => {
  const newId = addDashboard({
    title: 'Dashboard', // <-- ИСПРАВЛЕНО
    description: 'New dashboard',
    // ...
  });
};
```

## Решение ✅
✅ Заменил `title: \`Dashboard \${dashboards.length + 1}\`` на `title: 'Dashboard'` в файле **src/components/TabNavigation.tsx** на строке 76

## Изменения:
- **src/components/TabNavigation.tsx**: Исправлена функция `handleAddDashboard()` - теперь все новые табы создаются с названием "Dashboard" без цифр

## Проверенные пути:
- ✅ src/components/TabNavigation.tsx - ИСПРАВЛЕНО: логика создания табов
- ✅ src/store/dashboardStore.ts - store логика (не требует изменений)
- ❌ src/types/dashboard.ts - только типы
- ❌ другие компоненты не связаны с именованием dashboard

## Статус
✅ ВЫПОЛНЕНО - все новые Dashboard табы теперь называются просто "Dashboard" 