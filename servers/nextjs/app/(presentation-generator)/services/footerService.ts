import { useCallback } from "react";

export interface FooterProperties {
  logoProperties: {
    showLogo: boolean;
    logoPosition: string;
    opacity: number;
    logoImage: {
      light: string;
      dark: string;
    };
  };
  logoScale: number;
  logoOffset: {
    x: number;
    y: number;
  };
  footerMessage: {
    showMessage: boolean;
    opacity: number;
    fontSize: number;
    message: string;
  };
}

// Client-side service for footer properties
export const useFooterService = () => {
  // Get footer properties
  const getFooterProperties = useCallback(
    async (): Promise<FooterProperties | null> => {
      try {
        // @ts-ignore
        const result = await window.electron.getFooter();
        return result.properties;
      } catch (error) {
        console.error("Error retrieving footer properties:", error);
        return null;
      }
    },
    []
  );

  // Save footer properties
  const saveFooterProperties = useCallback(
    async (properties: FooterProperties): Promise<boolean> => {
      try {
        // @ts-ignore
        const result = await window.electron.setFooter(properties);
        return result.success;
      } catch (error) {
        console.error("Error saving footer properties:", error);
        return false;
      }
    },
    []
  );

  // Reset footer properties
  const resetFooterProperties = useCallback(
    async (defaultProperties: FooterProperties): Promise<boolean> => {
      return saveFooterProperties(defaultProperties);
    },
    [saveFooterProperties]
  );

  return {
    getFooterProperties,
    saveFooterProperties,
    resetFooterProperties,
  };
}; 