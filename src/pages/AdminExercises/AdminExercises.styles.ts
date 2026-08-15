import styled from "styled-components";
import { media } from "../../styles/theme";
import { pressable } from "../../styles/interactive";

export const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 560px;

  ${media.tablet} {
    flex-direction: row;
  }
`;

export const Count = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  list-style: none;
  margin: 0;
  padding: 0 0 80px;
  max-width: 560px;
`;

export const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
`;

export const Prompt = styled.span`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const Meta = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
`;

export const Answer = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
`;

export const Hint = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
  font-style: italic;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const ActionButton = styled.button<{ $tone?: "danger" }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  font-weight: 700;
  min-height: 32px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 2px solid
    ${({ theme, $tone }) => ($tone === "danger" ? theme.colors.error : theme.colors.secondary)};
  background: none;
  color: ${({ theme, $tone }) => ($tone === "danger" ? theme.colors.error : theme.colors.secondaryDark)};
  cursor: pointer;
  ${pressable}

  &:hover {
    background: ${({ theme, $tone }) =>
      $tone === "danger" ? theme.colors.error : theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
