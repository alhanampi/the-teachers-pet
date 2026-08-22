import styled from "styled-components";

export const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const SwitchModeButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.primaryDark};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: underline;
  cursor: pointer;
  min-height: 44px;
`;

export const GuestButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: underline;
  cursor: pointer;
  min-height: 44px;
`;
