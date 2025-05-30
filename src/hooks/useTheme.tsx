import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeColors {
  bg: string;
  widget: string;
  accent: string;
  text: string;
  muted: string;
  positive: string;
  negative: string;
  border: string;
}

interface ThemeContextType {
  theme: Theme;
  themeVariant: string;
  toggleTheme: () => void;
  setThemeVariant: (variant: string, colors: ThemeColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Обновленные цвета для современных тем (HSL для Tailwind)
const modernDarkColors: ThemeColors = {
  bg: '220 13% 11%',              // #181B20 глубокий графитовый
  widget: '222 16% 16%',          // #23272F тёмно-серый для панелей
  accent: '217 29% 16%',          // #242D39 для hover/выделения
  text: '210 40% 98%',            // #F7FAFC почти белый текст
  muted: '210 13% 69%',           // #A0AEC0 светло-серый для второстепенного текста
  positive: '152 77% 43%',        // #16C784 ярко-зелёный (buy)
  negative: '356 77% 57%',        // #EA3943 ярко-красный (sell)
  border: '220 21% 23%'           // #2D3748 тёмно-серый для границ
};

const modernLightColors: ThemeColors = {
  bg: '210 28% 98%',              // #F7F9FB светлый фон
  widget: '0 0% 100%',            // #FFFFFF белый для панелей
  accent: '210 28% 96%',          // #F1F5F9 светло-серый для выделения
  text: '222 44% 14%',            // #1A202C тёмно-серый текст
  muted: '220 15% 35%',           // #4A5568 серый для второстепенного текста
  positive: '152 77% 43%',        // #16C784 ярко-зелёный (buy)
  negative: '356 77% 57%',        // #EA3943 ярко-красный (sell)
  border: '210 28% 90%'           // #E2E8F0 светло-серый для границ
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    console.log('🎨 Theme Provider: Loading saved theme:', saved);
    return saved || 'dark';
  });

  const [themeVariant, setThemeVariantState] = useState<string>(() => {
    const saved = localStorage.getItem('themeVariant');
    console.log('🎨 Theme Provider: Loading saved variant:', saved);
    return saved || (theme === 'dark' ? 'dark' : 'light');
  });

  const applyThemeColors = (colors: ThemeColors) => {
    console.log('🎨 Applying theme colors:', colors);
    const root = document.documentElement;
    
    // Применяем цвета напрямую
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--terminal-${key}`;
      console.log(`🎨 Setting ${cssVar}: ${value}`);
      root.style.setProperty(cssVar, value);
    });
    
    // Принудительно обновляем стили
    root.style.setProperty('--terminal-bg', colors.bg);
    root.style.setProperty('--terminal-widget', colors.widget);
    root.style.setProperty('--terminal-accent', colors.accent);
    root.style.setProperty('--terminal-text', colors.text);
    root.style.setProperty('--terminal-muted', colors.muted);
    root.style.setProperty('--terminal-positive', colors.positive);
    root.style.setProperty('--terminal-negative', colors.negative);
    root.style.setProperty('--terminal-border', colors.border);
    
    // Проверяем применение
    setTimeout(() => {
      const computedStyle = getComputedStyle(root);
      console.log('🎨 Verification - Applied CSS variables:');
      Object.keys(colors).forEach(key => {
        const cssVar = `--terminal-${key}`;
        const appliedValue = computedStyle.getPropertyValue(cssVar).trim();
        console.log(`🎨 ${cssVar}: ${appliedValue}`);
      });
    }, 100);
  };

  useEffect(() => {
    console.log('🎨 Theme effect triggered - theme:', theme);
    
    // Применяем класс темы
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', theme);
    
    // Применяем современные цвета сразу
    const modernColors = theme === 'dark' ? modernDarkColors : modernLightColors;
    applyThemeColors(modernColors);
    
    // Обновляем вариант темы
    const newVariant = theme === 'dark' ? 'dark' : 'light';
    setThemeVariantState(newVariant);
    localStorage.setItem('themeVariant', newVariant);
    
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('🎨 Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const setThemeVariant = (variant: string, colors: ThemeColors) => {
    console.log('🎨 Setting theme variant:', variant, 'with colors:', colors);
    setThemeVariantState(variant);
    applyThemeColors(colors);
    localStorage.setItem('themeVariant', variant);
    localStorage.setItem(`themeColors_${variant}`, JSON.stringify(colors));
    console.log('🎨 Saved variant and colors to localStorage');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeVariant, toggleTheme, setThemeVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
