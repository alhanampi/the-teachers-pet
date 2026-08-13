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
  padding: ${({ theme }) => theme.spacing.lg};
  width: calc(100% - ${({ theme }) => theme.spacing.md} * 2);
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  text-align: center;

  &:focus {
    outline: none;
  }
`;

export const Message = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  ${media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;
