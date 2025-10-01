import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card, CardContent } from '../../components/Card';
import {
  Container,
  Header,
  HeaderTitle,
  HeaderActions,
  Content,
  Divider,
  Spacer,
} from '../../components/Layout';
import { theme } from '../../theme';
import { AccountSwitcher } from './AccountSwitcher';

interface Account {
  address: string;
  name: string;
  balance: string;
}

interface DashboardProps {
  account: Account;
  onLock: () => void;
  onSettings: () => void;
  onSend: () => void;
  onReceive: () => void;
  onProvider?: () => void;
  onManageAccounts?: () => void;
  onAccountSwitch?: () => void;
}

const AccountSelector = styled.button`
  background: ${theme.colors.backgroundLighter};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: all ${theme.transitions.base};
  color: ${theme.colors.text};
  font-size: ${theme.fontSizes.sm};
  width: 100%;

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.borderLight};
  }
`;

const AccountInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const AccountName = styled.div`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const AccountAddress = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
`;

const BalanceCard = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
  border: none;
  text-align: center;
  padding: ${theme.spacing.xl};
`;

const BalanceLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${theme.spacing.sm};
`;

const BalanceAmount = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  color: white;
  margin-bottom: ${theme.spacing.xs};
`;

const BalanceUSD = styled.div`
  font-size: ${theme.fontSizes.base};
  color: rgba(255, 255, 255, 0.7);
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
`;

const ActionButton = styled(Button)`
  padding: ${theme.spacing.md};
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const ActivitySection = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.md} 0;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
  transition: all ${theme.transitions.base};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityType = styled.div`
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.text};
`;

const ActivityTime = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
`;

const ActivityAmount = styled.div<{ type: 'send' | 'receive' }>`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  font-family: ${theme.fonts.mono};
  color: ${({ type }) =>
    type === 'receive' ? theme.colors.success : theme.colors.text};
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.lg};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  transition: color ${theme.transitions.base};

  &:hover {
    color: ${theme.colors.text};
  }
`;

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const Dashboard: React.FC<DashboardProps> = ({
  account,
  onLock,
  onSettings,
  onSend,
  onReceive,
  onProvider,
  onManageAccounts,
  onAccountSwitch,
}) => {
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  // Mock activity data
  const activities = [
    { type: 'receive' as const, amount: '100', time: '2 hours ago' },
    { type: 'send' as const, amount: '50', time: '1 day ago' },
    { type: 'receive' as const, amount: '250', time: '3 days ago' },
  ];

  const handleAccountChange = (address: string) => {
    onAccountSwitch?.();
  };

  const handleManageAccounts = () => {
    setShowAccountSwitcher(false);
    onManageAccounts?.();
  };

  return (
    <Container>
      {showAccountSwitcher && (
        <AccountSwitcher
          currentAccount={account}
          onClose={() => setShowAccountSwitcher(false)}
          onAccountChange={handleAccountChange}
          onManageAccounts={handleManageAccounts}
        />
      )}

      <Header>
        <HeaderTitle>GLIN Wallet</HeaderTitle>
        <HeaderActions>
          <IconButton onClick={onLock} title="Lock">
            🔒
          </IconButton>
          <IconButton onClick={onSettings} title="Settings">
            ⚙️
          </IconButton>
        </HeaderActions>
      </Header>

      <Content>
        <AccountSelector onClick={() => setShowAccountSwitcher(true)}>
          <AccountInfo>
            <AccountName>{account.name}</AccountName>
            <AccountAddress>{truncateAddress(account.address)}</AccountAddress>
          </AccountInfo>
          <span>▼</span>
        </AccountSelector>

        <Spacer size="lg" />

        <BalanceCard>
          <BalanceLabel>Total Balance</BalanceLabel>
          <BalanceAmount>{account.balance} tGLIN</BalanceAmount>
          <BalanceUSD>≈ $0.00 USD</BalanceUSD>
        </BalanceCard>

        <ActionGrid>
          <ActionButton variant="primary" onClick={onSend}>
            <span>↑</span>
            Send
          </ActionButton>
          <ActionButton variant="primary" onClick={onReceive}>
            <span>↓</span>
            Receive
          </ActionButton>
        </ActionGrid>

        {onProvider && (
          <>
            <Spacer size="md" />
            <Button variant="secondary" fullWidth onClick={onProvider}>
              🎯 Provider Dashboard
            </Button>
          </>
        )}

        <Divider />

        <ActivitySection>
          <SectionTitle>Recent Activity</SectionTitle>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityInfo>
                  <ActivityType>
                    {activity.type === 'receive' ? 'Received' : 'Sent'}
                  </ActivityType>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityInfo>
                <ActivityAmount type={activity.type}>
                  {activity.type === 'receive' ? '+' : '-'}
                  {activity.amount} tGLIN
                </ActivityAmount>
              </ActivityItem>
            ))
          ) : (
            <Card>
              <CardContent style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                No transactions yet
              </CardContent>
            </Card>
          )}
        </ActivitySection>
      </Content>
    </Container>
  );
};
