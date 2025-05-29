
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
    console.log('🎨 Theme Provider: Loading saved theme:', saved);
    return saved || 'dark';
  });

  const [themeVariant, setThemeVariantState] = useState<string>(() => {
    const saved = localStorage.getItem('themeVariant');
    console.log('🎨 Theme Provider: Loading saved variant:', saved);
    return saved || (theme === 'dark' ? 'default-dark' : 'default-light');
  });

  const applyThemeColors = (colors: ThemeColors) => {
    console.log('🎨 Applying theme colors:', colors);
    const root = document.documentElement;
    
    // Log each CSS variable being set
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--terminal-${key}`;
      console.log(`🎨 Setting ${cssVar}: ${value}`);
      root.style.setProperty(cssVar, value);
    });
    
    // Verify the colors were applied
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

  const loadSavedThemeColors = (variant: string) => {
    console.log('🎨 Loading saved colors for variant:', variant);
    const saved = localStorage.getItem(`themeColors_${variant}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ThemeColors;
        console.log('🎨 Found saved colors:', parsed);
        return parsed;
      } catch (e) {
        console.error('🎨 Failed to parse saved theme colors:', e);
      }
    }
    console.log('🎨 No saved colors found for variant:', variant);
    return null;
  };

  useEffect(() => {
    console.log('🎨 Theme effect triggered - theme:', theme);
    
    // Apply theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('🎨 Added dark class to documentElement');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('🎨 Removed dark class from documentElement');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    console.log('🎨 Saved theme to localStorage:', theme);
    
    // Reset variant to default when theme changes, but only if current variant doesn't match theme
    const isCurrentVariantCompatible = 
      (theme === 'dark' && themeVariant.includes('dark')) ||
      (theme === 'light' && themeVariant.includes('light'));
    
    console.log('🎨 Current variant compatible with theme?', isCurrentVariantCompatible);
    
    if (!isCurrentVariantCompatible) {
      const newVariant = theme === 'dark' ? 'default-dark' : 'default-light';
      console.log('🎨 Switching to compatible variant:', newVariant);
      setThemeVariantState(newVariant);
      localStorage.setItem('themeVariant', newVariant);
      
      // Apply default colors
      const defaultColors = theme === 'dark' ? defaultDarkColors : defaultLightColors;
      console.log('🎨 Applying default colors for theme:', theme, defaultColors);
      applyThemeColors(defaultColors);
    } else {
      // Load saved colors for current variant or apply defaults
      const savedColors = loadSavedThemeColors(themeVariant);
      const defaultColors = theme === 'dark' ? defaultDarkColors : defaultLightColors;
      console.log('🎨 Using colors:', savedColors || defaultColors);
      applyThemeColors(savedColors || defaultColors);
    }
  }, [theme]);

  useEffect(() => {
    console.log('🎨 Variant effect triggered - variant:', themeVariant);
    
    // Apply colors when variant changes
    const savedColors = loadSavedThemeColors(themeVariant);
    if (savedColors) {
      console.log('🎨 Applying saved colors for variant:', themeVariant);
      applyThemeColors(savedColors);
    } else {
      // Apply default colors if no saved colors found
      const defaultColors = theme === 'dark' ? defaultDarkColors : defaultLightColors;
      console.log('🎨 No saved colors found, applying defaults for:', theme);
      applyThemeColors(defaultColors);
    }
  }, [themeVariant]);

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
