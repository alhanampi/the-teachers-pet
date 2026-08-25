import styled from "styled-components";
import { pressable } from "../../styles/interactive";

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  list-style: none;
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  padding: 0;
  max-width: 480px;
`;

export const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  min-height: 44px;
  cursor: pointer;
  text-align: left;
  ${pressable}
`;

export const Name = styled.span`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

export const Points = styled.span`
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primaryDark};
  white-space: nowrap;
`;

export const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const GroupLabel = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const NameGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Meta = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
