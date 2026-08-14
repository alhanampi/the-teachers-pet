import styled from "styled-components";
import { StyledButton } from "../../ui/Button/Button.styles";

export const PlayWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const PlayButton = styled(StyledButton)`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  min-width: 160px;
`;

export const FallbackMessage = styled.p`
  margin: 0;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;
