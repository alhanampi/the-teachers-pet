import styled from "styled-components";
import { media } from "../../styles/theme";

export const Input = styled.input`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  min-height: 44px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 3px solid ${({ theme }) => theme.colors.secondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${media.tablet} {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

export const Mascot = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
  }
`;
