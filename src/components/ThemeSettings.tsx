
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThemeVariant {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: {
    bg: string;
    widget: string;
    accent: string;
    text: string;
    muted: string;
    positive: string;
    negative: string;
    border: string;
  };
}

const availableThemes: ThemeVariant[] = [
  {
    id: 'dark',
    name: 'Темная тема',
    type: 'dark',
    colors: {
      bg: '15 15 15',           // Чистый темно-серый
      widget: '25 25 25',       // Темно-серый для виджетов
      accent: '40 40 40',       // Серый для акцентов
      text: '255 255 255',      // Белый текст
      muted: '160 160 160',     // Серый для второстепенного текста
      positive: '34 197 94',    // Зеленый
      negative: '239 68 68',    // Красный
      border: '60 60 60'        // Серый для границ
    }
  },
  {
    id: 'light',
    name: 'Светлая тема',
    type: 'light',
    colors: {
      bg: '255 255 255',        // Чистый белый
      widget: '250 250 250',    // Очень светло-серый для виджетов
      accent: '240 240 240',    // Светло-серый для акцентов
      text: '0 0 0',            // Черный текст
      muted: '100 100 100',     // Темно-серый для второстепенного текста
      positive: '34 197 94',    // Зеленый
      negative: '239 68 68',    // Красный
      border: '220 220 220'     // Светло-серый для границ
    }
  }
];

const ThemeSettings: React.FC = () => {
  const { theme, themeVariant, setThemeVariant } = useTheme();

  const handleThemeSelect = (variantId: string) => {
    console.log('🎨 ThemeSettings: Selected variant:', variantId);
    const selectedTheme = availableThemes.find(t => t.id === variantId);
    if (selectedTheme) {
      console.log('🎨 ThemeSettings: Found theme:', selectedTheme);
      setThemeVariant(selectedTheme.id, selectedTheme.colors);
      
      // Принудительно применяем цвета к документу
      const root = document.documentElement;
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--terminal-${key}`, value);
      });
      
      // Применяем класс темы
      if (selectedTheme.type === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      
    } else {
      console.error('🎨 ThemeSettings: Theme not found for ID:', variantId);
    }
  };

  const currentTheme = availableThemes.find(t => t.id === themeVariant) || availableThemes[0];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-terminal-text">
          Выбор темы
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Тема интерфейса:
            </label>
            <Select 
              value={themeVariant} 
              onValueChange={handleThemeSelect}
            >
              <SelectTrigger className="w-full bg-terminal-widget border-terminal-border text-terminal-text">
                <SelectValue placeholder="Выберите тему" />
              </SelectTrigger>
              <SelectContent className="bg-terminal-widget border-terminal-border">
                {availableThemes.map((variant) => (
                  <SelectItem 
                    key={variant.id} 
                    value={variant.id}
                    className="text-terminal-text hover:bg-terminal-accent focus:bg-terminal-accent"
                  >
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-lg border border-terminal-border bg-terminal-accent/20">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-terminal-text">{currentTheme.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-terminal-muted">
                  {currentTheme.type === 'dark' ? 'Темная' : 'Светлая'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {Object.entries(currentTheme.colors).slice(0, 8).map(([key, value]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded border border-terminal-border"
                  style={{ backgroundColor: `rgb(${value})` }}
                  title={key}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
