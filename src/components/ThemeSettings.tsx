
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
    id: 'default-dark',
    name: 'Стандартная темная',
    type: 'dark',
    colors: {
      bg: '23 26 35',
      widget: '30 34 48',
      accent: '42 48 66',
      text: '230 232 236',
      muted: '157 163 180',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '46 52 70'
    }
  },
  {
    id: 'midnight-dark',
    name: 'Полночь',
    type: 'dark',
    colors: {
      bg: '12 14 20',
      widget: '20 22 30',
      accent: '30 35 45',
      text: '245 245 250',
      muted: '140 150 170',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '35 40 50'
    }
  },
  {
    id: 'default-light',
    name: 'Стандартная светлая',
    type: 'light',
    colors: {
      bg: '255 255 255',
      widget: '248 250 252',
      accent: '241 245 249',
      text: '30 41 59',
      muted: '100 116 139',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '226 232 240'
    }
  },
  {
    id: 'paper-light',
    name: 'Бумажная',
    type: 'light',
    colors: {
      bg: '250 250 250',
      widget: '255 255 255',
      accent: '245 245 245',
      text: '51 65 85',
      muted: '71 85 105',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '203 213 225'
    }
  }
];

const ThemeSettings: React.FC = () => {
  const { theme, themeVariant, setThemeVariant, toggleTheme } = useTheme();

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

  const darkThemes = availableThemes.filter(t => t.type === 'dark');
  const lightThemes = availableThemes.filter(t => t.type === 'light');
  const currentTheme = availableThemes.find(t => t.id === themeVariant) || availableThemes[0];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-terminal-text">
          Настройки темы
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Темные темы:
            </label>
            <Select 
              value={theme === 'dark' ? themeVariant : ''} 
              onValueChange={(value) => {
                console.log('🎨 ThemeSettings: Dark theme select changed to:', value);
                handleThemeSelect(value);
              }}
            >
              <SelectTrigger className="w-full bg-terminal-widget border-terminal-border text-terminal-text">
                <SelectValue placeholder="Выберите темную тему" />
              </SelectTrigger>
              <SelectContent className="bg-terminal-widget border-terminal-border">
                {darkThemes.map((variant) => (
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

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Светлые темы:
            </label>
            <Select 
              value={theme === 'light' ? themeVariant : ''} 
              onValueChange={(value) => {
                console.log('🎨 ThemeSettings: Light theme select changed to:', value);
                handleThemeSelect(value);
              }}
            >
              <SelectTrigger className="w-full bg-terminal-widget border-terminal-border text-terminal-text">
                <SelectValue placeholder="Выберите светлую тему" />
              </SelectTrigger>
              <SelectContent className="bg-terminal-widget border-terminal-border">
                {lightThemes.map((variant) => (
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
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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
