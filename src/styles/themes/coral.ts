import { baseTheme, type AppTheme } from "../theme";

export const coralTheme: AppTheme = {
  ...baseTheme,
  colors: {
    background: "#e2cad4",
    surface: "#FFFFFF",
    primary: "#FF6B6B",
    primaryDark: "#E85555",
    secondary: "#4ECDC4",
    secondaryDark: "#3AB5AC",
    accent: "#FFD93D",
    success: "#6BCB77",
    successDark: "#4FAE59",
    error: "#FF9F45",
    text: "#3A3A3A",
    textLight: "#7A7A7A",
    white: "#FFFFFF",
    levelColors: ["#FF6B6B", "#FFA94D", "#FFD93D", "#6BCB77", "#4ECDC4", "#8E7CFF"],
  },
};
