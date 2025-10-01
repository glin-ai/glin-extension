import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface SignMessageProps {
  origin: string;
  appName: string;
  message: string;
  account: {
    address: string;
    name: string;
  };
  requiresPassword?: boolean;
  onApprove: (password?: string) => Promise<void>;
  onReject: () => void;
}

const SiteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.backgroundLighter};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const SiteIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.lg};
`;

const SiteDetails = styled.div`
  flex: 1;
`;

const SiteName = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
`;

const SiteOrigin = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
`;

const MessageCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
  max-height: 200px;
  overflow-y: auto;
`;

const MessageLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const MessageContent = styled.pre`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  line-height: 1.6;
`;

const AccountInfo = styled(Card)`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
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
  margin-top: ${theme.spacing.lg};
`;

const WarningBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.md};
  line-height: 1.6;
`;

export const SignMessage: React.FC<SignMessageProps> = ({
  origin,
  appName,
  message,
  account,
  requiresPassword = false,
  onApprove,
  onReject,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (requiresPassword && !password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onApprove(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Sign Message</HeaderTitle>
      </Header>

      <Content>
        <SiteInfo>
          <SiteIcon>🌐</SiteIcon>
          <SiteDetails>
            <SiteName>{appName}</SiteName>
            <SiteOrigin>{origin}</SiteOrigin>
          </SiteDetails>
        </SiteInfo>

        <WarningBox>
          ⚠️ Only sign messages from sites you trust. Signing a malicious message could compromise
          your account.
        </WarningBox>

        <MessageCard>
          <MessageLabel>Message to sign:</MessageLabel>
          <MessageContent>{message}</MessageContent>
        </MessageCard>

        <AccountLabel>Signing with account:</AccountLabel>
        <AccountInfo>
          <AccountName>{account.name}</AccountName>
          <AccountAddress>{account.address}</AccountAddress>
        </AccountInfo>

        {requiresPassword && (
          <>
            <Spacer size="md" />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              autoFocus
            />
          </>
        )}

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
            Sign
          </Button>
        </ActionButtons>
      </Content>
    </Container>
  );
};
