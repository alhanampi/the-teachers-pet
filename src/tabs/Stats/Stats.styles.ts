import styled from "styled-components";
import { media } from "../../styles/theme";

export const BigNumbers = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 480px;
  justify-content: center;
`;

export const BigNumberCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

export const BigNumberValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primaryDark};
`;

export const BigNumberLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  max-width: 480px;
  height: 200px;

  ${media.tablet} {
    height: 240px;
  }
`;

export const EncourageText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  max-width: 420px;
`;
