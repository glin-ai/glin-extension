import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';
import {
  type ContractTransaction,
  formatGasLimit,
  estimateStorageDepositGLIN,
  getContractWarningLevel,
  getContractWarningMessage,
} from '../../utils/contractDetection';

interface SignContractTransactionProps {
  origin: string;
  appName: string;
  contractTx: ContractTransaction;
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

const TransactionTypeCard = styled(Card)<{ $level: 'low' | 'medium' | 'high' }>`
  background: ${props =>
    props.$level === 'high' ? 'rgba(239, 68, 68, 0.1)' :
    props.$level === 'medium' ? 'rgba(251, 191, 36, 0.1)' :
    'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${props =>
    props.$level === 'high' ? theme.colors.error :
    props.$level === 'medium' ? 'rgb(251, 191, 36)' :
    'rgb(59, 130, 246)'};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const TransactionType = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const TransactionMethod = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
`;

const DetailCard = styled(Card)`
  background: ${theme.colors.backgroundLighter};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.md} 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${theme.spacing.sm} 0;
  font-size: ${theme.fontSizes.sm};

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const DetailLabel = styled.div`
  color: ${theme.colors.textSecondary};
  flex-shrink: 0;
  width: 40%;
`;

const DetailValue = styled.div`
  color: ${theme.colors.text};
  font-family: ${theme.fonts.mono};
  text-align: right;
  word-break: break-all;
  flex: 1;
  font-size: ${theme.fontSizes.xs};
`;

const WarningBox = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
  background: ${props =>
    props.$level === 'high' ? 'rgba(239, 68, 68, 0.1)' :
    props.$level === 'medium' ? 'rgba(251, 191, 36, 0.1)' :
    'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${props =>
    props.$level === 'high' ? theme.colors.error :
    props.$level === 'medium' ? 'rgb(251, 191, 36)' :
    'rgb(59, 130, 246)'};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
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

const getTransactionTypeDisplay = (type: string): string => {
  switch (type) {
    case 'CONTRACT_CALL':
      return 'Contract Call';
    case 'CONTRACT_DEPLOY':
      return 'Contract Deployment';
    case 'CONTRACT_UPLOAD_CODE':
      return 'Upload Contract Code';
    default:
      return 'Transaction';
  }
};

export const SignContractTransaction: React.FC<SignContractTransactionProps> = ({
  origin,
  appName,
  contractTx,
  account,
  onApprove,
  onReject,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const warningLevel = getContractWarningLevel(contractTx);
  const warningMessage = getContractWarningMessage(contractTx);

  const handleApprove = async () => {
    if (!password) {
      setError('Password is required');
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

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Confirm Contract Transaction</HeaderTitle>
      </Header>

      <Content>
        <SiteInfo>
          <SiteIcon>🌐</SiteIcon>
          <SiteDetails>
            <SiteName>{appName}</SiteName>
            <SiteOrigin>{origin}</SiteOrigin>
          </SiteDetails>
        </SiteInfo>

        <TransactionTypeCard $level={warningLevel}>
          <TransactionType>
            {getTransactionTypeDisplay(contractTx.type)}
          </TransactionType>
          <TransactionMethod>
            {contractTx.section}.{contractTx.method}
          </TransactionMethod>
        </TransactionTypeCard>

        <WarningBox $level={warningLevel}>
          {warningMessage}
        </WarningBox>

        <DetailCard>
          {contractTx.contractAddress && (
            <DetailRow>
              <DetailLabel>Contract:</DetailLabel>
              <DetailValue>{truncateAddress(contractTx.contractAddress)}</DetailValue>
            </DetailRow>
          )}

          {contractTx.value && BigInt(contractTx.value) > 0n && (
            <DetailRow>
              <DetailLabel>Value:</DetailLabel>
              <DetailValue>
                {(Number(contractTx.value) / 1e18).toFixed(6)} tGLIN
              </DetailValue>
            </DetailRow>
          )}

          {contractTx.gasLimit && (
            <DetailRow>
              <DetailLabel>Gas Limit:</DetailLabel>
              <DetailValue>{formatGasLimit(contractTx.gasLimit)}</DetailValue>
            </DetailRow>
          )}

          <DetailRow>
            <DetailLabel>Storage Deposit:</DetailLabel>
            <DetailValue>
              {estimateStorageDepositGLIN(contractTx.storageDepositLimit)}
            </DetailValue>
          </DetailRow>

          {contractTx.data && (
            <DetailRow>
              <DetailLabel>Call Data:</DetailLabel>
              <DetailValue>
                {truncateAddress(contractTx.data)}
              </DetailValue>
            </DetailRow>
          )}

          {contractTx.codeHash && (
            <DetailRow>
              <DetailLabel>Code Hash:</DetailLabel>
              <DetailValue>
                {truncateAddress(contractTx.codeHash)}
              </DetailValue>
            </DetailRow>
          )}
        </DetailCard>

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
