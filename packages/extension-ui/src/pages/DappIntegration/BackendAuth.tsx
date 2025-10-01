import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface BackendAuthProps {
  origin: string;
  appName: string;
  account: {
    address: string;
    name: string;
  };
  backendUrl: string;
  onApprove: () => Promise<void>;
  onReject: () => void;
}

const SiteInfo = styled.div`
  text-align: center;
  margin: ${theme.spacing.lg} 0;
`;

const SiteIcon = styled.div`
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

const SiteName = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const SiteOrigin = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
  word-break: break-all;
`;

const AuthCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
`;

const AuthTitle = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const AuthStep = styled.div`
  padding: ${theme.spacing.sm} 0;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;

  strong {
    color: ${theme.colors.text};
  }
`;

const AccountInfo = styled(Card)`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
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

const BackendInfo = styled.div`
  padding: ${theme.spacing.md};
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing.md} 0;
`;

const BackendLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

const BackendUrl = styled.div`
  font-size: ${theme.fontSizes.sm};
  font-family: ${theme.fonts.mono};
  color: ${theme.colors.primary};
  word-break: break-all;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xl};
`;

const InfoBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.md};
  line-height: 1.6;
`;

export const BackendAuth: React.FC<BackendAuthProps> = ({
  origin,
  appName,
  account,
  backendUrl,
  onApprove,
  onReject,
}) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove();
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Backend Authentication</HeaderTitle>
      </Header>

      <Content>
        <SiteInfo>
          <SiteIcon>🔐</SiteIcon>
          <SiteName>{appName}</SiteName>
          <SiteOrigin>{origin}</SiteOrigin>
        </SiteInfo>

        <InfoBox>
          ℹ️ This site is requesting authentication with the GLIN backend. You will sign a message
          to prove ownership of your wallet.
        </InfoBox>

        <AuthCard>
          <AuthTitle>
            <span>🔄</span>
            Authentication Flow
          </AuthTitle>
          <AuthStep>
            <strong>1.</strong> Request a nonce from the backend
          </AuthStep>
          <AuthStep>
            <strong>2.</strong> Sign the nonce with your wallet
          </AuthStep>
          <AuthStep>
            <strong>3.</strong> Submit signature to backend
          </AuthStep>
          <AuthStep>
            <strong>4.</strong> Receive access & refresh tokens
          </AuthStep>
        </AuthCard>

        <BackendInfo>
          <BackendLabel>Backend Server:</BackendLabel>
          <BackendUrl>{backendUrl}</BackendUrl>
        </BackendInfo>

        <AccountLabel>Authenticate with account:</AccountLabel>
        <AccountInfo>
          <AccountName>{account.name}</AccountName>
          <AccountAddress>{account.address}</AccountAddress>
        </AccountInfo>

        <Spacer size="md" />

        <ActionButtons>
          <Button variant="secondary" size="lg" fullWidth onClick={onReject} disabled={loading}>
            Reject
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleApprove}
            loading={loading}
            disabled={loading}
          >
            Authenticate
          </Button>
        </ActionButtons>
      </Content>
    </Container>
  );
};
