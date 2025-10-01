import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface SignTransactionProps {
  origin: string;
  appName: string;
  transaction: {
    to: string;
    amount: string;
    fee?: string;
  };
  account: {
    address: string;
    name: string;
    balance: string;
  };
  onApprove: (password: string) => Promise<void>;
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

const TransactionCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
`;

const TransactionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  font-size: ${theme.fontSizes.sm};

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const TransactionLabel = styled.div`
  color: ${theme.colors.textSecondary};
`;

const TransactionValue = styled.div`
  color: ${theme.colors.text};
  font-weight: 500;
  font-family: ${theme.fonts.mono};
  text-align: right;
  max-width: 60%;
  word-break: break-all;
`;

const TransactionAmount = styled(TransactionValue)`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.primary};
`;

const TotalRow = styled(TransactionRow)`
  margin-top: ${theme.spacing.sm};
  padding-top: ${theme.spacing.md};
  border-top: 2px solid ${theme.colors.border};
  font-weight: 600;
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

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSizes.sm};
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

export const SignTransaction: React.FC<SignTransactionProps> = ({
  origin,
  appName,
  transaction,
  account,
  onApprove,
  onReject,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fee = transaction.fee || '0.01';
  const total = (parseFloat(transaction.amount) + parseFloat(fee)).toFixed(6);

  const handleApprove = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    if (parseFloat(total) > parseFloat(account.balance)) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onApprove(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Confirm Transaction</HeaderTitle>
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
          ⚠️ You are about to send tGLIN. Make sure you trust this site and verify the recipient
          address.
        </WarningBox>

        <TransactionCard>
          <TransactionRow>
            <TransactionLabel>To:</TransactionLabel>
            <TransactionValue>{transaction.to}</TransactionValue>
          </TransactionRow>
          <TransactionRow>
            <TransactionLabel>Amount:</TransactionLabel>
            <TransactionAmount>{transaction.amount} tGLIN</TransactionAmount>
          </TransactionRow>
          <TransactionRow>
            <TransactionLabel>Network Fee:</TransactionLabel>
            <TransactionValue>{fee} tGLIN</TransactionValue>
          </TransactionRow>
          <TotalRow>
            <TransactionLabel>Total:</TransactionLabel>
            <TransactionValue>{total} tGLIN</TransactionValue>
          </TotalRow>
        </TransactionCard>

        <AccountLabel>From account:</AccountLabel>
        <AccountInfo>
          <AccountName>{account.name}</AccountName>
          <AccountAddress>{account.address}</AccountAddress>
          <BalanceInfo>
            <span style={{ color: theme.colors.textSecondary }}>Balance:</span>
            <span style={{ color: theme.colors.text }}>{account.balance} tGLIN</span>
          </BalanceInfo>
        </AccountInfo>

        <Spacer size="md" />

        <Input
          type="password"
          label="Password"
          placeholder="Enter your password to confirm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoFocus
        />

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
            disabled={loading || !password}
          >
            Confirm
          </Button>
        </ActionButtons>
      </Content>
    </Container>
  );
};
