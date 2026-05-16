import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Theme,
  ThemeId,
  THEMES,
  InstitutionalBlack,
  PremiumLight,
  ZenWealth,
  DEFAULT_THEME_ID,
} from './index';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (themeId: ThemeId) => Promise<void>;
  themes: Record<ThemeId, Theme>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = '@investoros_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(InstitutionalBlack);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedThemeId = await AsyncStorage.getItem(STORAGE_KEY);
      const themeId = (storedThemeId as ThemeId) || DEFAULT_THEME_ID;

      if (THEMES[themeId]) {
        setThemeState(THEMES[themeId]);
      } else {
        setThemeState(THEMES[DEFAULT_THEME_ID]);
      }
    } catch (error) {
      console.error('Failed to load theme from AsyncStorage:', error);
      setThemeState(THEMES[DEFAULT_THEME_ID]);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (themeId: ThemeId) => {
    try {
      if (!THEMES[themeId]) {
        throw new Error(`Unknown theme ID: ${themeId}`);
      }

      setThemeState(THEMES[themeId]);
      await AsyncStorage.setItem(STORAGE_KEY, themeId);
    } catch (error) {
      console.error('Failed to set theme:', error);
      throw error;
    }
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    themes: THEMES,
  };

  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
