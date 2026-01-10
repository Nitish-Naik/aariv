import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

type ThemeType = 'light' | 'dark';

// Define the shape of our provided colors object
// It includes the specific theme keys (background, text, etc.)
// AND the nested palettes (neutral, primary, etc.)
type ActiveThemeColors = typeof colors.light & {
  neutral: typeof colors.neutral;
  primary: typeof colors.primary;
  semantic: typeof colors.semantic;
  action: typeof colors.action;
  platforms: typeof colors.platforms;
};

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  colors: ActiveThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('user-theme');
      if (storedTheme) {
        setThemeState(storedTheme as ThemeType);
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('user-theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';
  
  // Merge colors based on theme
  const activeColors: ActiveThemeColors = {
    // Spread semantic color keys (background, surface, etc.)
    ...(isDark ? colors.dark : colors.light),
    
    // Preserve nested palettes
    neutral: colors.neutral,
    primary: colors.primary,
    semantic: colors.semantic,
    action: colors.action,
    platforms: colors.platforms,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors: activeColors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
