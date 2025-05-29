
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

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

const darkThemes: ThemeVariant[] = [
  {
    id: 'default-dark',
    name: 'Стандартная темная',
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
    id: 'blue-dark',
    name: 'Синяя темная',
    colors: {
      bg: '15 23 42',
      widget: '30 41 59',
      accent: '51 65 85',
      text: '241 245 249',
      muted: '148 163 184',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '71 85 105'
    }
  },
  {
    id: 'green-dark',
    name: 'Зеленая темная',
    colors: {
      bg: '20 30 25',
      widget: '25 40 30',
      accent: '35 55 45',
      text: '230 245 235',
      muted: '150 180 165',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '45 70 55'
    }
  }
];

const lightThemes: ThemeVariant[] = [
  {
    id: 'default-light',
    name: 'Стандартная светлая',
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
  },
  {
    id: 'warm-light',
    name: 'Теплая светлая',
    colors: {
      bg: '255 251 235',
      widget: '254 243 199',
      accent: '253 224 71',
      text: '120 53 15',
      muted: '146 64 14',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '245 158 11'
    }
  },
  {
    id: 'cool-light',
    name: 'Холодная светлая',
    colors: {
      bg: '240 249 255',
      widget: '224 242 254',
      accent: '186 230 253',
      text: '12 74 110',
      muted: '14 116 144',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '125 211 252'
    }
  }
];

const ThemeSettings: React.FC = () => {
  const { theme, themeVariant, setThemeVariant } = useTheme();
  const themes = theme === 'dark' ? darkThemes : lightThemes;

  const handleThemeSelect = (variant: ThemeVariant) => {
    setThemeVariant(variant.id, variant.colors);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Варианты {theme === 'dark' ? 'темной' : 'светлой'} темы
        </h2>
        
        <div className="space-y-3">
          {themes.map((variant) => (
            <div
              key={variant.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                themeVariant === variant.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-terminal-border hover:border-terminal-accent'
              }`}
              onClick={() => handleThemeSelect(variant)}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">{variant.name}</span>
                {themeVariant === variant.id && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {Object.entries(variant.colors).slice(0, 4).map(([key, value]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: `hsl(${value})` }}
                    title={key}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t border-terminal-border">
        <p className="text-sm text-terminal-muted">
          Зажмите Option и кликните на кнопку темы для открытия настроек
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
