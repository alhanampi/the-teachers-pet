import { baseTheme, type AppTheme } from "../theme";

export const oceanTheme: AppTheme = {
  ...baseTheme,
  colors: {
    background: "#cee1ec",
    surface: "#FFFFFF",
    primary: "#3FA9E8",
    primaryDark: "#2586BE",
    secondary: "#34D1B4",
    secondaryDark: "#1FAE93",
    accent: "#FFE066",
    success: "#4FCB8A",
    successDark: "#33A86A",
    error: "#FF8A65",
    text: "#233240",
    textLight: "#6D8494",
    white: "#FFFFFF",
    levelColors: ["#3FA9E8", "#34D1B4", "#FFE066", "#4FCB8A", "#5A6BFF", "#FF8A65"],
  },
};
