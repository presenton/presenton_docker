import { useCallback } from "react";
import { ThemeType } from "../upload/type";

export interface ThemeColors {
  background: string;
  slideBg: string;
  slideTitle: string;
  slideHeading: string;
  slideDescription: string;
  slideBox: string;
  iconBg: string;
  chartColors: string[];
  fontFamily: string;
  theme?: ThemeType;
}

export const useThemeService = () => {
  const getTheme = useCallback(async (): Promise<{
    name: string;
    colors: ThemeColors;
  } | null> => {
    try {
      const response = await fetch('/api/theme');
      if (!response.ok) {
        throw new Error('Failed to fetch theme');
      }
      const data = await response.json();
      return data.theme;
    } catch (error) {
      console.error("Error retrieving theme:", error);
      return null;
    }
  }, []);

  const saveTheme = useCallback(
    async (themeData: {
      name: string;
      colors: ThemeColors;
    }): Promise<boolean> => {
      try {
        const response = await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ themeData }),
        });

        if (!response.ok) {
          throw new Error('Failed to save theme');
        }

        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error("Error saving theme:", error);
        return false;
      }
    },
    []
  );

  return {
    getTheme,
    saveTheme,
  };
}; 