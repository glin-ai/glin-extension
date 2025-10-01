import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer, Divider } from '../../components/Layout';
import { theme } from '../../theme';

interface SettingsProps {
  onBack: () => void;
  onNetworkChange: () => void;
  onBackupWallet: () => void;
  onChangePassword: () => void;
  onThemeChange: () => void;
  currentNetwork?: string;
  currentTheme?: 'dark' | 'light';
}

const SettingsSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const SettingItem = styled.button`
  width: 100%;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  transition: all ${theme.transitions.base};
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.primary};
  }
`;

const SettingItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const SettingIcon = styled.div`
  font-size: ${theme.fontSizes.xl};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primaryDim};
  border-radius: ${theme.borderRadius.md};
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: 2px;
`;

const SettingDescription = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
`;

const SettingValue = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const ArrowIcon = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.lg};
`;

const VersionInfo = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.sm};
`;

const DangerZone = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`;

const DangerButton = styled(Button)`
  background: ${theme.colors.danger};

  &:hover {
    background: #dc2626;
  }
`;

export const Settings: React.FC<SettingsProps> = ({
  onBack,
  onNetworkChange,
  onBackupWallet,
  onChangePassword,
  onThemeChange,
  currentNetwork = 'testnet',
  currentTheme = 'dark',
}) => {
  const [showDangerZone, setShowDangerZone] = useState(false);

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Settings</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <SettingsSection>
          <SectionTitle>General</SectionTitle>

          <SettingItem onClick={onNetworkChange}>
            <SettingItemLeft>
              <SettingIcon>🌐</SettingIcon>
              <SettingInfo>
                <SettingLabel>Network</SettingLabel>
                <SettingDescription>Switch between networks</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
            <SettingValue>{currentNetwork === 'testnet' ? 'Testnet' : 'Mainnet'}</SettingValue>
            <ArrowIcon>›</ArrowIcon>
          </SettingItem>

          <SettingItem onClick={onThemeChange}>
            <SettingItemLeft>
              <SettingIcon>{currentTheme === 'dark' ? '🌙' : '☀️'}</SettingIcon>
              <SettingInfo>
                <SettingLabel>Theme</SettingLabel>
                <SettingDescription>Customize appearance</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
            <SettingValue>{currentTheme === 'dark' ? 'Dark' : 'Light'}</SettingValue>
            <ArrowIcon>›</ArrowIcon>
          </SettingItem>
        </SettingsSection>

        <Divider />

        <SettingsSection>
          <SectionTitle>Security</SectionTitle>

          <SettingItem onClick={onBackupWallet}>
            <SettingItemLeft>
              <SettingIcon>💾</SettingIcon>
              <SettingInfo>
                <SettingLabel>Backup Wallet</SettingLabel>
                <SettingDescription>Export recovery phrase</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
            <ArrowIcon>›</ArrowIcon>
          </SettingItem>

          <SettingItem onClick={onChangePassword}>
            <SettingItemLeft>
              <SettingIcon>🔑</SettingIcon>
              <SettingInfo>
                <SettingLabel>Change Password</SettingLabel>
                <SettingDescription>Update wallet password</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
            <ArrowIcon>›</ArrowIcon>
          </SettingItem>
        </SettingsSection>

        <Divider />

        <SettingsSection>
          <SectionTitle>About</SectionTitle>

          <SettingItem as="div" style={{ cursor: 'default' }}>
            <SettingItemLeft>
              <SettingIcon>ℹ️</SettingIcon>
              <SettingInfo>
                <SettingLabel>Version</SettingLabel>
                <SettingDescription>GLIN Wallet v0.1.0</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
          </SettingItem>

          <SettingItem
            as="a"
            href="https://glin.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <SettingItemLeft>
              <SettingIcon>🌐</SettingIcon>
              <SettingInfo>
                <SettingLabel>Website</SettingLabel>
                <SettingDescription>glin.ai</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
            <ArrowIcon>↗</ArrowIcon>
          </SettingItem>

          <SettingItem
            as="a"
            href="https://github.com/glin-ai/glin-extension"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <SettingItemLeft>
              <SettingIcon>📦</SettingIcon>
              <SettingInfo>
                <SettingLabel>Source Code</SettingLabel>
                <SettingDescription>Open source on GitHub</SettingDescription>
              </SettingInfo>
            </SettingItemLeft>
            <ArrowIcon>↗</ArrowIcon>
          </SettingItem>
        </SettingsSection>

        <Divider />

        <SettingsSection>
          <SectionTitle>Danger Zone</SectionTitle>

          {!showDangerZone ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDangerZone(true)}
            >
              Show Advanced Options
            </Button>
          ) : (
            <DangerZone>
              <SettingLabel style={{ marginBottom: theme.spacing.sm }}>
                Reset Wallet
              </SettingLabel>
              <SettingDescription style={{ marginBottom: theme.spacing.md }}>
                This will permanently delete your wallet. Make sure you have backed up your recovery phrase.
              </SettingDescription>
              <DangerButton variant="danger" fullWidth>
                Reset Wallet
              </DangerButton>
            </DangerZone>
          )}
        </SettingsSection>

        <VersionInfo>
          GLIN Wallet v0.1.0
          <br />
          © 2024 GLIN Team. Apache 2.0 License
        </VersionInfo>
      </Content>
    </Container>
  );
};
