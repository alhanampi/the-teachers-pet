import styled from "styled-components";
import { media } from "../../../styles/theme";

export const StyledScreen = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-content: safe center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  text-align: center;
  overflow-y: auto;

  ${media.tablet} {
    gap: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  }
`;

export const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primaryDark};
  margin: 0;

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

export const StyledSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export const StyledCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  max-width: 560px;

  ${media.tablet} {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }
`;
