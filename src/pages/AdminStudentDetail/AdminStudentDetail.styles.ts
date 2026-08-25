import styled from "styled-components";
import { pressable } from "../../styles/interactive";

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const BackButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.textLight};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  ${pressable}
`;

export const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primaryDark};
  margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.sm};
`;

export const SummaryList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 480px;
`;

export const SummaryRow = styled.li<{ $weak: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme, $weak }) => ($weak ? theme.colors.error : theme.colors.secondary)};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const AttemptList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 560px;
`;

export const AttemptRow = styled.li<{ $correct: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  border-left: 4px solid ${({ theme, $correct }) => theme.colors[$correct ? "success" : "error"]};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const AttemptPrompt = styled.span`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
`;

export const AttemptMeta = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  font-size: 0.85rem;
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
