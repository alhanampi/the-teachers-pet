import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html {
    height: 100%;
    height: var(--app-height, 100dvh);
  }

  body, #root {
    height: 100%;
    overflow: hidden;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    padding-top: ${({ theme }) => theme.layout.headerHeight};
    overscroll-behavior: none;
  }

  button {
    font-family: inherit;
  }
`;
