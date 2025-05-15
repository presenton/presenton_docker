import { ThemeType } from "@/app/(presentation-generator)/upload/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const defaultColors = {
  light: {
    background: "#c8c7c9",
    slideBg: "#F2F2F2",
    slideTitle: "#000000",
    slideHeading: "#1a1a1a",
    slideDescription: "#333333",
    slideBox: "#ffffff",
    iconBg: "#1F1F2D",
    chartColors: ["#1F1F2D", "#3F3F5D", "#62628E", "#8F8FB2", "#C0C0D3"],
    fontFamily: "var(--font-inter)",
  },
  dark: {
    background: "#000000",
    slideBg: "#1E1E1E",
    slideTitle: "#ffffff",
    slideHeading: "#f5f5f5",
    slideDescription: "#e0e0e0",
    slideBox: "#2d2d2d",
    iconBg: "#5E8CF0",
    chartColors: ["#5E8CF0", "#8800ff", "#b200ff", "#d700ff", "#ef00ff"],
    fontFamily: "var(--font-inter)",
  },
  faint_yellow: {
    background: "#d9cebc",
    slideBg: "#F8F4E8",
    slideTitle: "#2C1810",
    slideHeading: "#4A3728",
    slideDescription: "#665E57",
    slideBox: "#FFFFFF",
    iconBg: "#281810",
    chartColors: ["#281810", "#4A3728", "#665E57", "#665E57", "#665E57"],
    fontFamily: "var(--font-inter)",
  },
  custom: {
    background: "#63ceff",
    slideBg: "#F4F4F4",
    slideTitle: "#1A1A1A",
    slideHeading: "#2D2D2D",
    slideDescription: "#4A4A4A",
    slideBox: "#d8c6c6",
    iconBg: "#281810",
    chartColors: ["#281810", "#4A3728", "#665E57", "#665E57", "#665E57"],
    fontFamily: "var(--font-inter)",
  },
  cream: {
    background: "#DDCFBB",
    slideBg: "#F9F6F0",
    slideTitle: "#484237",
    slideHeading: "#484237",
    slideDescription: "#595F6C",
    slideBox: "#EEE9DD",
    iconBg: "#A6825B",
    chartColors: ["#765939", "#A6825B", "#B89B7C", "#CAB49D", "#DBCDBD"],
    fontFamily: "var(--font-fraunces)",
  },
  royal_blue: {
    background: "#010103",
    slideBg: "#091433",
    slideTitle: "#ffffff",
    slideHeading: "#ffffff",
    slideDescription: "#E6E6E6",
    slideBox: "#29136C",
    iconBg: "#5E8CF0",
    chartColors: ["#5E8CF0", "#496CEB", "#f051b5", "#F7A8FF", "#FCD8FF"],
    fontFamily: "var(--font-instrument-sans)",
  },
  light_red: {
    background: "#F8E9E8",
    slideBg: "#FFFAFA",
    slideTitle: "#181D27",
    slideHeading: "#252B37",
    slideDescription: "#595F6C",
    slideBox: "#F3E8E8",
    iconBg: "#F0695F",
    chartColors: [
      "#F0695F",
      "#450808",
      "#8F1010",
      "#C1392F",
      "#EC5555",
      "#F49E9E",
    ],
    fontFamily: "var(--font-montserrat)",
  },
  dark_pink: {
    background: "#F3AEED",
    slideBg: "#F9E8FF",
    slideTitle: "#261827",
    slideHeading: "#252B37",
    slideDescription: "#6A596C",
    slideBox: "#F0D4F7",
    iconBg: "#D02CE5",
    chartColors: ["#D02CE5", "#B414C9", "#6E1886", "#A724CC", "#C65FE3"],
    fontFamily: "var(--font-inria-serif)",
  },
};

// Store the server-provided colors
export const serverColors: { [key in ThemeType]?: ThemeColors } = {};

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
}

interface ThemeState {
  currentTheme: ThemeType;
  currentColors: ThemeColors;
  isLoading: boolean;
}

const initialState: ThemeState = {
  currentTheme: ThemeType.Dark,
  currentColors: defaultColors.dark,
  isLoading: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.currentTheme = action.payload;
      // Use server colors if available, otherwise fall back to default
      state.currentColors =
        serverColors[action.payload] || defaultColors[action.payload];
    },
    setThemeColors: (
      state,
      action: PayloadAction<Partial<ThemeColors> & { theme: ThemeType }>
    ) => {
      const newColors = { ...state.currentColors, ...action.payload };
      state.currentColors = newColors;
      state.currentTheme = action.payload.theme;
      // Store the colors for this theme
      serverColors[action.payload.theme] = newColors;
    },
    setLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loadSavedTheme: (state, action: PayloadAction<any>) => {
      if (action.payload.name === "custom") {
        state.currentTheme = ThemeType.Custom;
        state.currentColors = action.payload.colors;
        serverColors.custom = action.payload.colors;
      }
    },
  },
});

export const { setTheme, setThemeColors, setLoadingState, loadSavedTheme } =
  themeSlice.actions;
export default themeSlice.reducer;
