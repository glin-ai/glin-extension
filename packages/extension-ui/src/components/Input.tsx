import React from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

interface InputProps {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.text};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text};
  background: ${theme.colors.backgroundLighter};
  border: 1px solid ${({ hasError }) => hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  outline: none;
  transition: all ${theme.transitions.base};

  &::placeholder {
    color: ${theme.colors.textTertiary};
  }

  &:focus {
    border-color: ${({ hasError }) => hasError ? theme.colors.error : theme.colors.primary};
    background: ${theme.colors.surface};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.error};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  ...inputProps
}) => {
  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <StyledInput hasError={!!error} {...inputProps} />
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};
