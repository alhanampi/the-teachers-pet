import { baseTheme, type AppTheme } from "../theme";

export const forestTheme: AppTheme = {
  ...baseTheme,
  colors: {
    background: "#dbe0d5",
    surface: "#FFFFFF",
    primary: "#5FBF5F",
    primaryDark: "#3E9E43",
    secondary: "#FFB74D",
    secondaryDark: "#F08C1E",
    accent: "#FFD54F",
    success: "#66BB6A",
    successDark: "#45A049",
    error: "#EF6C5C",
    text: "#2F3B2A",
    textLight: "#75846E",
    white: "#FFFFFF",
    levelColors: ["#5FBF5F", "#9CCC65", "#FFD54F", "#FFB74D", "#4DB6AC", "#8D6E63"],
  },
};
