import React from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content } from '../../components/Layout';
import { theme } from '../../theme';

interface ThemeSelectorProps {
  onBack: () => void;
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

const ThemeCard = styled(Card)<{ $active: boolean }>`
  margin-bottom: ${theme.spacing.md};
  border: 2px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) =>
    $active ? theme.colors.primaryDim : theme.colors.surface};
  cursor: pointer;
  transition: all ${theme.transitions.base};

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const ThemeCardContent = styled.div`
  padding: ${theme.spacing.md};
`;

const ThemeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const ThemeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const ThemeIcon = styled.div`
  font-size: ${theme.fontSizes['3xl']};
`;

const ThemeDetails = styled.div``;

const ThemeName = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const ThemeDescription = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
`;

const ActiveBadge = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.primary};
  font-weight: 600;
`;

const ThemePreview = styled.div<{ $isDark: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#0f172a' : '#f1f5f9')};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const PreviewHeader = styled.div<{ $isDark: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#1e293b' : '#ffffff')};
  color: ${({ $isDark }) => ($isDark ? '#f1f5f9' : '#0f172a')};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;
`;

const PreviewButton = styled.div<{ $isDark: boolean }>`
  background: ${({ $isDark }) =>
    $isDark ? '#6366f1' : '#6366f1'};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  text-align: center;
`;

const InfoBox = styled.div`
  background: ${theme.colors.primaryDim};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const InfoText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.6;
`;

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onBack,
  currentTheme,
  onThemeChange,
}) => {
  const themes = [
    {
      id: 'dark' as const,
      name: 'Dark Theme',
      description: 'Easy on the eyes in low light',
      icon: '🌙',
    },
    {
      id: 'light' as const,
      name: 'Light Theme',
      description: 'Clean and bright appearance',
      icon: '☀️',
    },
  ];

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Theme</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        {themes.map((themeOption) => (
          <ThemeCard
            key={themeOption.id}
            $active={themeOption.id === currentTheme}
            onClick={() => onThemeChange(themeOption.id)}
          >
            <ThemeCardContent>
              <ThemeHeader>
                <ThemeInfo>
                  <ThemeIcon>{themeOption.icon}</ThemeIcon>
                  <ThemeDetails>
                    <ThemeName>{themeOption.name}</ThemeName>
                    <ThemeDescription>{themeOption.description}</ThemeDescription>
                  </ThemeDetails>
                </ThemeInfo>
                {themeOption.id === currentTheme && (
                  <ActiveBadge>✓ Active</ActiveBadge>
                )}
              </ThemeHeader>

              <ThemePreview $isDark={themeOption.id === 'dark'}>
                <PreviewHeader $isDark={themeOption.id === 'dark'}>
                  GLIN Wallet
                </PreviewHeader>
                <PreviewButton $isDark={themeOption.id === 'dark'}>
                  Preview Button
                </PreviewButton>
              </ThemePreview>
            </ThemeCardContent>
          </ThemeCard>
        ))}

        <InfoBox>
          <InfoText>
            💡 Theme preference is saved and will persist across sessions
          </InfoText>
        </InfoBox>
      </Content>
    </Container>
  );
};
