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
      // @ts-ignore
      const result = await window.electron.getTheme();
      return result.theme;
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
        // @ts-ignore
        const result = await window.electron.setTheme(themeData);
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