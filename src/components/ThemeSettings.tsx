import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    id: 'midnight-dark',
    name: 'Полночь',
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
    id: 'ocean-dark',
    name: 'Океан',
    colors: {
      bg: '8 25 43',
      widget: '16 35 55',
      accent: '25 45 70',
      text: '225 240 255',
      muted: '120 150 180',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '35 55 80'
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
  },
  {
    id: 'forest-dark',
    name: 'Лесная',
    colors: {
      bg: '15 25 18',
      widget: '22 35 25',
      accent: '30 50 35',
      text: '220 235 225',
      muted: '140 170 150',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '40 65 45'
    }
  },
  {
    id: 'purple-dark',
    name: 'Фиолетовая темная',
    colors: {
      bg: '25 20 35',
      widget: '35 30 50',
      accent: '50 40 70',
      text: '240 235 250',
      muted: '170 160 190',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '60 50 80'
    }
  },
  {
    id: 'magenta-dark',
    name: 'Магента',
    colors: {
      bg: '30 15 35',
      widget: '45 25 50',
      accent: '65 35 70',
      text: '250 230 255',
      muted: '190 150 200',
      positive: '34 197 94',
      negative: '244 67 54',
      border: '75 45 80'
    }
  },
  {
    id: 'red-dark',
    name: 'Красная темная',
    colors: {
      bg: '35 20 20',
      widget: '50 30 30',
      accent: '70 40 40',
      text: '250 230 230',
      muted: '200 150 150',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '80 50 50'
    }
  },
  {
    id: 'orange-dark',
    name: 'Оранжевая темная',
    colors: {
      bg: '35 25 15',
      widget: '50 40 25',
      accent: '70 55 35',
      text: '250 240 220',
      muted: '200 180 140',
      positive: '34 197 94',
      negative: '244 67 54',
      border: '80 65 45'
    }
  },
  {
    id: 'amber-dark',
    name: 'Янтарная',
    colors: {
      bg: '30 25 10',
      widget: '45 40 20',
      accent: '65 55 30',
      text: '245 235 200',
      muted: '185 170 130',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '75 65 40'
    }
  },
  {
    id: 'teal-dark',
    name: 'Бирюзовая темная',
    colors: {
      bg: '15 30 30',
      widget: '25 45 45',
      accent: '35 65 65',
      text: '220 245 245',
      muted: '140 185 185',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '45 75 75'
    }
  },
  {
    id: 'cyan-dark',
    name: 'Циан',
    colors: {
      bg: '10 25 30',
      widget: '20 40 50',
      accent: '30 55 70',
      text: '210 240 250',
      muted: '130 180 200',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '40 65 80'
    }
  },
  {
    id: 'indigo-dark',
    name: 'Индиго',
    colors: {
      bg: '20 15 35',
      widget: '35 25 55',
      accent: '50 35 75',
      text: '235 225 255',
      muted: '155 135 205',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '65 45 85'
    }
  },
  {
    id: 'slate-dark',
    name: 'Сланцевая',
    colors: {
      bg: '18 20 23',
      widget: '30 32 38',
      accent: '45 48 55',
      text: '226 232 240',
      muted: '148 163 184',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '55 60 70'
    }
  },
  {
    id: 'zinc-dark',
    name: 'Цинковая',
    colors: {
      bg: '20 20 22',
      widget: '35 35 38',
      accent: '50 50 55',
      text: '230 230 235',
      muted: '160 160 170',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '60 60 65'
    }
  },
  {
    id: 'neutral-dark',
    name: 'Нейтральная',
    colors: {
      bg: '22 22 22',
      widget: '38 38 38',
      accent: '55 55 55',
      text: '235 235 235',
      muted: '170 170 170',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '65 65 65'
    }
  },
  {
    id: 'stone-dark',
    name: 'Каменная',
    colors: {
      bg: '22 20 18',
      widget: '38 35 32',
      accent: '55 50 45',
      text: '235 232 228',
      muted: '170 165 158',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '65 60 55'
    }
  },
  {
    id: 'warm-dark',
    name: 'Теплая темная',
    colors: {
      bg: '25 22 18',
      widget: '42 38 32',
      accent: '60 55 45',
      text: '240 235 225',
      muted: '180 170 155',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '70 65 55'
    }
  },
  {
    id: 'cool-dark',
    name: 'Холодная темная',
    colors: {
      bg: '18 22 25',
      widget: '32 38 42',
      accent: '45 55 60',
      text: '225 235 240',
      muted: '155 170 180',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '55 65 70'
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
    id: 'paper-light',
    name: 'Бумажная',
    colors: {
      bg: '255 255 255',
      widget: '250 250 250',
      accent: '240 240 240',
      text: '20 20 20',
      muted: '120 120 120',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '220 220 220'
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
    id: 'cream-light',
    name: 'Кремовая',
    colors: {
      bg: '255 248 240',
      widget: '250 240 230',
      accent: '240 225 210',
      text: '80 50 30',
      muted: '140 110 80',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '220 200 180'
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
  },
  {
    id: 'sky-light',
    name: 'Небесная',
    colors: {
      bg: '235 245 255',
      widget: '220 235 250',
      accent: '200 220 245',
      text: '20 50 80',
      muted: '80 120 160',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '160 190 220'
    }
  },
  {
    id: 'mint-light',
    name: 'Мятная',
    colors: {
      bg: '240 255 245',
      widget: '225 250 235',
      accent: '200 240 215',
      text: '20 80 40',
      muted: '60 140 90',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '150 220 175'
    }
  },
  {
    id: 'sage-light',
    name: 'Шалфейная',
    colors: {
      bg: '245 250 245',
      widget: '235 245 235',
      accent: '220 235 220',
      text: '40 60 40',
      muted: '100 130 100',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '180 210 180'
    }
  },
  {
    id: 'lavender-light',
    name: 'Лавандовая',
    colors: {
      bg: '250 245 255',
      widget: '245 235 255',
      accent: '235 220 250',
      text: '60 40 80',
      muted: '120 100 140',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '200 180 220'
    }
  },
  {
    id: 'rose-light',
    name: 'Розовая',
    colors: {
      bg: '255 245 248',
      widget: '255 235 240',
      accent: '250 220 230',
      text: '80 20 40',
      muted: '140 80 100',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '220 180 200'
    }
  },
  {
    id: 'peach-light',
    name: 'Персиковая',
    colors: {
      bg: '255 248 240',
      widget: '255 240 225',
      accent: '250 225 200',
      text: '80 50 20',
      muted: '140 100 60',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '220 190 160'
    }
  },
  {
    id: 'coral-light',
    name: 'Коралловая',
    colors: {
      bg: '255 245 240',
      widget: '255 235 225',
      accent: '250 220 205',
      text: '80 40 20',
      muted: '140 90 60',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '220 180 155'
    }
  },
  {
    id: 'amber-light',
    name: 'Янтарная светлая',
    colors: {
      bg: '255 252 235',
      widget: '254 245 215',
      accent: '252 235 175',
      text: '100 70 20',
      muted: '150 120 50',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '230 200 120'
    }
  },
  {
    id: 'lime-light',
    name: 'Лаймовая',
    colors: {
      bg: '248 255 235',
      widget: '240 255 215',
      accent: '225 250 185',
      text: '50 80 20',
      muted: '100 140 60',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '180 220 140'
    }
  },
  {
    id: 'teal-light',
    name: 'Бирюзовая светлая',
    colors: {
      bg: '240 255 250',
      widget: '225 250 240',
      accent: '200 240 225',
      text: '20 80 60',
      muted: '60 140 110',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '150 220 190'
    }
  },
  {
    id: 'cyan-light',
    name: 'Циан светлая',
    colors: {
      bg: '235 255 255',
      widget: '215 250 255',
      accent: '185 240 255',
      text: '20 70 80',
      muted: '60 130 150',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '140 210 230'
    }
  },
  {
    id: 'indigo-light',
    name: 'Индиго светлая',
    colors: {
      bg: '245 245 255',
      widget: '235 235 255',
      accent: '220 220 250',
      text: '40 40 100',
      muted: '90 90 160',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '180 180 220'
    }
  },
  {
    id: 'violet-light',
    name: 'Фиолетовая светлая',
    colors: {
      bg: '250 245 255',
      widget: '245 235 255',
      accent: '235 220 255',
      text: '70 40 100',
      muted: '130 90 170',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '200 170 230'
    }
  },
  {
    id: 'slate-light',
    name: 'Сланцевая светлая',
    colors: {
      bg: '248 250 252',
      widget: '241 245 249',
      accent: '226 232 240',
      text: '30 41 59',
      muted: '100 116 139',
      positive: '34 197 94',
      negative: '239 68 68',
      border: '203 213 225'
    }
  },
  {
    id: 'gray-light',
    name: 'Серая светлая',
    colors: {
      bg: '249 250 251',
      widget: '243 244 246',
      accent: '229 231 235',
      text: '17 24 39',
      muted: '107 114 128',
      positive: '76 175 80',
      negative: '244 67 54',
      border: '209 213 219'
    }
  }
];

const ThemeSettings: React.FC = () => {
  const { theme, themeVariant, setThemeVariant, toggleTheme } = useTheme();
  
  const currentThemes = theme === 'dark' ? darkThemes : lightThemes;
  const otherThemes = theme === 'dark' ? lightThemes : darkThemes;

  const handleThemeSelect = (variantId: string) => {
    console.log('🎨 ThemeSettings: Selected variant:', variantId);
    const selectedTheme = [...currentThemes, ...otherThemes].find(t => t.id === variantId);
    if (selectedTheme) {
      console.log('🎨 ThemeSettings: Found theme:', selectedTheme);
      setThemeVariant(selectedTheme.id, selectedTheme.colors);
    } else {
      console.error('🎨 ThemeSettings: Theme not found for ID:', variantId);
    }
  };

  const currentTheme = currentThemes.find(t => t.id === themeVariant) || currentThemes[0];
  console.log('🎨 ThemeSettings: Current theme:', currentTheme);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-terminal-text">
          Настройки темы
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-terminal-border bg-terminal-accent/20">
            <div>
              <span className="font-medium text-terminal-text">Режим темы</span>
              <p className="text-sm text-terminal-muted">
                {theme === 'dark' ? 'Темная тема' : 'Светлая тема'}
              </p>
            </div>
            <Button
              onClick={() => {
                console.log('🎨 ThemeSettings: Toggle button clicked');
                toggleTheme();
              }}
              variant="outline"
              size="sm"
              className="bg-terminal-widget border-terminal-border text-terminal-text hover:bg-terminal-accent"
            >
              Переключить на {theme === 'dark' ? 'светлую' : 'темную'}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Текущая тема ({theme === 'dark' ? 'темная' : 'светлая'}):
            </label>
            <Select 
              value={themeVariant} 
              onValueChange={(value) => {
                console.log('🎨 ThemeSettings: Current theme select changed to:', value);
                handleThemeSelect(value);
              }}
            >
              <SelectTrigger className="w-full bg-terminal-widget border-terminal-border text-terminal-text">
                <SelectValue placeholder="Выберите тему" />
              </SelectTrigger>
              <SelectContent className="bg-terminal-widget border-terminal-border">
                {currentThemes.map((variant) => (
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
              Альтернативные темы ({theme === 'dark' ? 'светлые' : 'темные'}):
            </label>
            <Select onValueChange={(value) => {
              console.log('🎨 ThemeSettings: Alternative theme select changed to:', value);
              handleThemeSelect(value);
            }}>
              <SelectTrigger className="w-full bg-terminal-widget border-terminal-border text-terminal-text">
                <SelectValue placeholder={`Выберите ${theme === 'dark' ? 'светлую' : 'темную'} тему`} />
              </SelectTrigger>
              <SelectContent className="bg-terminal-widget border-terminal-border">
                {otherThemes.map((variant) => (
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
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            
            <div className="flex space-x-2">
              {Object.entries(currentTheme.colors).slice(0, 8).map(([key, value]) => (
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
