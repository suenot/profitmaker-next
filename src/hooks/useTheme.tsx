
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

const defaultDarkColors: ThemeColors = {
  bg: '23 26 35',
  widget: '30 34 48',
  accent: '42 48 66',
  text: '230 232 236',
  muted: '157 163 180',
  positive: '76 175 80',
  negative: '244 67 54',
  border: '46 52 70'
};

const defaultLightColors: ThemeColors = {
  bg: '248 250 252',
  widget: '241 245 249',
  accent: '226 232 240',
  text: '15 23 42',
  muted: '100 116 139',
  positive: '34 197 94',
  negative: '239 68 68',
  border: '203 213 225'
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  const [themeVariant, setThemeVariantState] = useState<string>(() => {
    const saved = localStorage.getItem('themeVariant');
    return saved || (theme === 'dark' ? 'default-dark' : 'default-light');
  });

  const applyThemeColors = (colors: ThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--terminal-bg', colors.bg);
    root.style.setProperty('--terminal-widget', colors.widget);
    root.style.setProperty('--terminal-accent', colors.accent);
    root.style.setProperty('--terminal-text', colors.text);
    root.style.setProperty('--terminal-muted', colors.muted);
    root.style.setProperty('--terminal-positive', colors.positive);
    root.style.setProperty('--terminal-negative', colors.negative);
    root.style.setProperty('--terminal-border', colors.border);
  };

  const loadSavedThemeColors = (variant: string) => {
    const saved = localStorage.getItem(`themeColors_${variant}`);
    if (saved) {
      try {
        return JSON.parse(saved) as ThemeColors;
      } catch (e) {
        console.error('Failed to parse saved theme colors:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    // Apply theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Reset variant to default when theme changes, but only if current variant doesn't match theme
    const isCurrentVariantCompatible = 
      (theme === 'dark' && themeVariant.includes('dark')) ||
      (theme === 'light' && themeVariant.includes('light'));
    
    if (!isCurrentVariantCompatible) {
      const newVariant = theme === 'dark' ? 'default-dark' : 'default-light';
      setThemeVariantState(newVariant);
      localStorage.setItem('themeVariant', newVariant);
      
      // Apply default colors
      const defaultColors = theme === 'dark' ? defaultDarkColors : defaultLightColors;
      applyThemeColors(defaultColors);
    } else {
      // Load saved colors for current variant or apply defaults
      const savedColors = loadSavedThemeColors(themeVariant);
      const defaultColors = theme === 'dark' ? defaultDarkColors : defaultLightColors;
      applyThemeColors(savedColors || defaultColors);
    }
  }, [theme]);

  useEffect(() => {
    // Apply colors when variant changes
    const savedColors = loadSavedThemeColors(themeVariant);
    if (savedColors) {
      applyThemeColors(savedColors);
    } else {
      // Apply default colors if no saved colors found
      const defaultColors = theme === 'dark' ? defaultDarkColors : defaultLightColors;
      applyThemeColors(defaultColors);
    }
  }, [themeVariant]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setThemeVariant = (variant: string, colors: ThemeColors) => {
    setThemeVariantState(variant);
    applyThemeColors(colors);
    localStorage.setItem('themeVariant', variant);
    localStorage.setItem(`themeColors_${variant}`, JSON.stringify(colors));
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
