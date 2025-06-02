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
    name: 'Dark Theme',
    type: 'dark',
    colors: {
      bg: '220 13% 11%',           // #181B20 deep graphite
      widget: '222 16% 16%',       // #23272F dark gray for panels
      accent: '217 29% 16%',       // #242D39 for hover/selection
      text: '210 40% 98%',         // #F7FAFC almost white text
      muted: '210 13% 69%',        // #A0AEC0 light gray for secondary text
      positive: '152 77% 43%',     // #16C784 bright green (buy)
      negative: '356 77% 57%',     // #EA3943 bright red (sell)
      border: '220 21% 23%'        // #2D3748 dark gray for borders
    }
  },
  {
    id: 'light',
    name: 'Light Theme',
    type: 'light',
    colors: {
      bg: '210 28% 98%',           // #F7F9FB light background
      widget: '0 0% 100%',         // #FFFFFF white for panels
      accent: '210 28% 96%',       // #F1F5F9 light gray for selection
      text: '222 44% 14%',         // #1A202C dark gray text
      muted: '220 15% 35%',        // #4A5568 gray for secondary text
      positive: '152 77% 43%',     // #16C784 bright green (buy)
      negative: '356 77% 57%',     // #EA3943 bright red (sell)
      border: '210 28% 90%'        // #E2E8F0 light gray for borders
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
      
      // Force apply colors to document
      const root = document.documentElement;
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--terminal-${key}`, value);
      });
      
      // Apply theme class
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
          Theme Selection
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Interface Theme:
            </label>
            <Select 
              value={themeVariant} 
              onValueChange={handleThemeSelect}
            >
              <SelectTrigger className="w-full bg-terminal-widget border-terminal-border text-terminal-text">
                <SelectValue placeholder="Select theme" />
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
                  {currentTheme.type === 'dark' ? 'Dark' : 'Light'}
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
