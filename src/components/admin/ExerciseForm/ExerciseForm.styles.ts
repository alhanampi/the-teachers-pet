import styled from "styled-components";
import { pressable } from "../../../styles/interactive";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const FieldRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
`;

export const RemoveButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  flex-shrink: 0;
  width: 32px;
  ${pressable}
`;

export const PreviewButton = styled.button`
  border: none;
  background: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  flex-shrink: 0;
  width: 32px;
  ${pressable}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const AddButton = styled.button`
  align-self: flex-start;
  border: 2px dashed ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.radii.md};
  background: none;
  color: ${({ theme }) => theme.colors.secondaryDark};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  ${pressable}
`;

export const ErrorMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const HelperText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
