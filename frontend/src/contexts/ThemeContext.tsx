import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type StepImageSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
  glassMode: boolean;
  setGlassMode: (enabled: boolean) => void;
  stepImageSize: StepImageSize;
  setStepImageSize: (size: StepImageSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [glassMode, setGlassModeState] = useState<boolean>(() => {
    const stored = localStorage.getItem('glassMode');
    return stored === 'true';
  });

  const [stepImageSize, setStepImageSizeState] = useState<StepImageSize>(() => {
    const stored = localStorage.getItem('stepImageSize') as StepImageSize;
    return stored || 'medium';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const getEffectiveTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const updateTheme = () => {
      const effective = getEffectiveTheme();
      setEffectiveTheme(effective);
      
      // Tailwind dark mode only needs the 'dark' class
      if (effective === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Add glass mode class
      if (glassMode) {
        root.classList.add('glass-mode');
      } else {
        root.classList.remove('glass-mode');
      }
    };

    updateTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme, glassMode]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  const setGlassMode = (enabled: boolean) => {
    localStorage.setItem('glassMode', enabled.toString());
    setGlassModeState(enabled);
  };

  const setStepImageSize = (size: StepImageSize) => {
    localStorage.setItem('stepImageSize', size);
    setStepImageSizeState(size);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme, glassMode, setGlassMode, stepImageSize, setStepImageSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Made with Bob
