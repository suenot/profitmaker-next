
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
      bg: '17 24 39',
      widget: '31 41 55',
      accent: '55 65 81',
      text: '243 244 246',
      muted: '156 163 175',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '75 85 99'
    }
  },
  {
    id: 'light',
    name: 'Светлая тема',
    type: 'light',
    colors: {
      bg: '255 255 255',
      widget: '249 250 251',
      accent: '243 244 246',
      text: '17 24 39',
      muted: '107 114 128',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '209 213 219'
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
                  style={{ backgroundColor: `hsl(${value})` }}
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
