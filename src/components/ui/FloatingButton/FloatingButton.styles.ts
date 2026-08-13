import styled from "styled-components";
import { StyledButton } from "../Button/Button.styles";

export const StyledFloatingButton = styled(StyledButton)`
  position: fixed;
  right: ${({ theme }) => theme.spacing.lg};
  bottom: ${({ theme }) => theme.spacing.lg};
  z-index: 30;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
`;
