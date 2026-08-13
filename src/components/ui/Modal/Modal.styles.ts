import styled from "styled-components";
import { media } from "../../../styles/theme";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
`;

export const StyledContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.card} rgba(0, 0, 0, 0.2);
  padding: ${({ theme }) => theme.spacing.md};
  width: calc(100% - ${({ theme }) => theme.spacing.md} * 2);
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  &:focus {
    outline: none;
  }

  ${media.tablet} {
    padding: ${({ theme }) => theme.spacing.lg};
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const CloseButton = styled.button`
  flex-shrink: 0;
  border: none;
  background: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;
