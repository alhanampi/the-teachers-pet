import styled from "styled-components";
import { media } from "../../styles/theme";

export const IconWrap = styled.div`
  display: flex;
  justify-content: center;
`;

export const Icon = styled.img`
  width: 80px;
  height: 80px;
`;

export const SectionLabel = styled.p`
  margin: 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

export const PairList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  ${media.tablet} {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const PairRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
`;

export const PairWord = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export const PairDivider = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

export const ExampleGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  ${media.tablet} {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const ExampleChip = styled.span`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;
