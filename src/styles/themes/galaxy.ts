import { baseTheme, type AppTheme } from "../theme";

export const galaxyTheme: AppTheme = {
  ...baseTheme,
  colors: {
    background: "#F1ECFF",
    surface: "#FFFFFF",
    primary: "#9B6BFF",
    primaryDark: "#7A4FE0",
    secondary: "#5AD1E6",
    secondaryDark: "#33B4CC",
    accent: "#FFD93D",
    success: "#5ED3A3",
    successDark: "#3BB585",
    error: "#FF7A8A",
    text: "#332A4D",
    textLight: "#7C7396",
    white: "#FFFFFF",
    levelColors: ["#9B6BFF", "#5AD1E6", "#FFD93D", "#5ED3A3", "#FF7A8A", "#6B7FFF"],
  },
};
