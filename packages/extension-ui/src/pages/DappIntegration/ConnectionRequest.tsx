import React from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface ConnectionRequestProps {
  origin: string;
  appName: string;
  appIcon?: string;
  account: {
    address: string;
    name: string;
  };
  onApprove: () => void;
  onReject: () => void;
}

const AppInfo = styled.div`
  text-align: center;
  margin: ${theme.spacing.lg} 0;
`;

const AppIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${theme.spacing.md} auto;
  background: ${theme.colors.backgroundLighter};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes['2xl']};
`;

const AppName = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const AppOrigin = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
  word-break: break-all;
`;

const PermissionsCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  margin: ${theme.spacing.lg} 0;
`;

const PermissionTitle = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} 0;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};

  &:before {
    content: '✓';
    color: ${theme.colors.success};
    font-weight: bold;
    flex-shrink: 0;
  }
`;

const AccountCard = styled(Card)`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md};
`;

const AccountLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

const AccountName = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
`;

const AccountAddress = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
  margin-top: ${theme.spacing.xs};
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xl};
`;

const WarningText = styled.div`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.md};
  line-height: 1.6;
`;

export const ConnectionRequest: React.FC<ConnectionRequestProps> = ({
  origin,
  appName,
  appIcon,
  account,
  onApprove,
  onReject,
}) => {
  return (
    <Container>
      <Header>
        <HeaderTitle>Connection Request</HeaderTitle>
      </Header>

      <Content>
        <AppInfo>
          <AppIcon>{appIcon || '🌐'}</AppIcon>
          <AppName>{appName}</AppName>
          <AppOrigin>{origin}</AppOrigin>
        </AppInfo>

        <PermissionsCard>
          <PermissionTitle>This site is requesting to:</PermissionTitle>
          <PermissionItem>View your wallet address</PermissionItem>
          <PermissionItem>Request approval for transactions</PermissionItem>
          <PermissionItem>Request message signatures</PermissionItem>
        </PermissionsCard>

        <AccountLabel>Connect with account:</AccountLabel>
        <AccountCard>
          <AccountName>{account.name}</AccountName>
          <AccountAddress>{account.address}</AccountAddress>
        </AccountCard>

        <WarningText>
          ⚠️ Only connect to websites you trust. GLIN Wallet will never ask for your password or
          recovery phrase through a website.
        </WarningText>

        <ActionButtons>
          <Button variant="secondary" size="lg" fullWidth onClick={onReject}>
            Reject
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onApprove}>
            Connect
          </Button>
        </ActionButtons>
      </Content>
    </Container>
  );
};
