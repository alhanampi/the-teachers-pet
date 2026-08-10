import { baseTheme, type AppTheme } from "../theme";

export const sunsetTheme: AppTheme = {
  ...baseTheme,
  colors: {
    background: "#e9d4c4",
    surface: "#FFFFFF",
    primary: "#FF6F91",
    primaryDark: "#E4506F",
    secondary: "#FF9A5A",
    secondaryDark: "#F2793B",
    accent: "#FFD46A",
    success: "#7BC77E",
    successDark: "#57A65A",
    error: "#F2545B",
    text: "#432E3A",
    textLight: "#8A7480",
    white: "#FFFFFF",
    levelColors: ["#FF6F91", "#FF9A5A", "#FFD46A", "#7BC77E", "#C77DFF", "#F2545B"],
  },
};
