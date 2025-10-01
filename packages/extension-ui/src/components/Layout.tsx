import styled from 'styled-components';
import { theme } from '../theme';

export const Container = styled.div`
  width: 400px;
  min-height: 600px;
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  display: flex;
  flex-direction: column;
  font-family: ${theme.fonts.primary};
`;

export const Header = styled.header`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const HeaderTitle = styled.h1`
  font-size: ${theme.fontSizes.xl};
  font-weight: 700;
  margin: 0;
  color: ${theme.colors.text};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const Content = styled.main`
  flex: 1;
  padding: ${theme.spacing.lg};
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.borderLight};
    border-radius: ${theme.borderRadius.full};
  }
`;

export const Footer = styled.footer`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: ${theme.spacing.md} 0;
`;

export const Spacer = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  height: ${({ size = 'md' }) => theme.spacing[size]};
`;
