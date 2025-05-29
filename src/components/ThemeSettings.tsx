
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

interface ThemeVariant {
  id: string;
  name: string;
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

const darkTheme: ThemeVariant = {
  id: 'default-dark',
  name: 'Темная',
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
};

const lightTheme: ThemeVariant = {
  id: 'default-light',
  name: 'Светлая',
  colors: {
    bg: '248 250 252',
    widget: '241 245 249',
    accent: '226 232 240',
    text: '15 23 42',
    muted: '100 116 139',
    positive: '34 197 94',
    negative: '239 68 68',
    border: '203 213 225'
  }
};

const ThemeSettings: React.FC = () => {
  const { theme, themeVariant, setThemeVariant, toggleTheme } = useTheme();
  
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    console.log('🎨 ThemeSettings: Changing to theme:', newTheme);
    
    if (newTheme !== theme) {
      // Switch theme mode first
      toggleTheme();
    }
    
    // Apply the appropriate base theme
    const targetTheme = newTheme === 'dark' ? darkTheme : lightTheme;
    console.log('🎨 ThemeSettings: Applying theme:', targetTheme);
    setThemeVariant(targetTheme.id, targetTheme.colors);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-terminal-text">
          Настройки темы
        </h2>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-terminal-text">
              Выберите тему:
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleThemeChange('dark')}
                variant={theme === 'dark' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                  theme === 'dark' 
                    ? 'bg-terminal-accent text-terminal-text border-terminal-border' 
                    : 'bg-terminal-widget border-terminal-border text-terminal-text hover:bg-terminal-accent'
                }`}
              >
                <div className="font-medium">{darkTheme.name}</div>
                <div className="flex space-x-1">
                  {Object.entries(darkTheme.colors).slice(0, 6).map(([key, value]) => (
                    <div
                      key={key}
                      className="w-4 h-4 rounded border border-terminal-border"
                      style={{ backgroundColor: `hsl(${value})` }}
                      title={key}
                    />
                  ))}
                </div>
              </Button>
              
              <Button
                onClick={() => handleThemeChange('light')}
                variant={theme === 'light' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                  theme === 'light' 
                    ? 'bg-terminal-accent text-terminal-text border-terminal-border' 
                    : 'bg-terminal-widget border-terminal-border text-terminal-text hover:bg-terminal-accent'
                }`}
              >
                <div className="font-medium">{lightTheme.name}</div>
                <div className="flex space-x-1">
                  {Object.entries(lightTheme.colors).slice(0, 6).map(([key, value]) => (
                    <div
                      key={key}
                      className="w-4 h-4 rounded border border-terminal-border"
                      style={{ backgroundColor: `hsl(${value})` }}
                      title={key}
                    />
                  ))}
                </div>
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-terminal-border bg-terminal-accent/20">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-terminal-text">Текущая тема: {currentTheme.name}</span>
              <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
            </div>
            
            <div className="flex space-x-2">
              {Object.entries(currentTheme.colors).map(([key, value]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded border border-terminal-border"
                  style={{ backgroundColor: `hsl(${value})` }}
                  title={key}
                  onClick={() => console.log('🎨 Color clicked:', key, value)}
                />
              ))}
            </div>
            
            <div className="mt-2 text-xs text-terminal-muted">
              Клик по цвету для отладки в консоли
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-terminal-border">
        <p className="text-sm text-terminal-muted">
          Настройки автоматически сохраняются в браузере
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
