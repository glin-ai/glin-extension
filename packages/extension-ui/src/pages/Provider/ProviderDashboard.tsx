import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';

interface ProviderStatus {
  status: 'active' | 'idle' | 'offline';
  tasks: {
    active: number;
    completed: number;
    failed: number;
  };
  earnings: {
    today: number;
    total: number;
    pending: number;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: string;
  deadline?: string;
}

interface ProviderDashboardProps {
  onBack: () => void;
  onViewTasks: () => void;
  onViewPoints: () => void;
}

const StatusBadge = styled.div<{ status: 'active' | 'idle' | 'offline' }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;

  ${({ status }) => {
    switch (status) {
      case 'active':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
        `;
      case 'idle':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${theme.colors.warning};
        `;
      case 'offline':
        return `
          background: rgba(107, 114, 128, 0.1);
          color: ${theme.colors.textSecondary};
        `;
    }
  }}

  &:before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
`;

const StatCard = styled(Card)`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
`;

const EarningsCard = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
  border: none;
  padding: ${theme.spacing.lg};
`;

const EarningsLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${theme.spacing.sm};
`;

const EarningsValue = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  color: white;
  margin-bottom: ${theme.spacing.xs};
`;

const EarningsBreakdown = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: ${theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.9);
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onBack,
  onViewTasks,
  onViewPoints,
}) => {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderStatus();
  }, []);

  const loadProviderStatus = async () => {
    try {
      const bridge = new MessageBridge();
      const response = await bridge.sendMessage(MessageType.GET_PROVIDER_STATUS, {});
      setStatus(response);
    } catch (error) {
      console.error('Failed to load provider status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <HeaderTitle>Provider Dashboard</HeaderTitle>
          <div style={{ width: '60px' }} />
        </Header>
        <Content>
          <LoadingState>Loading provider data...</LoadingState>
        </Content>
      </Container>
    );
  }

  if (!status) {
    return (
      <Container>
        <Header>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <HeaderTitle>Provider Dashboard</HeaderTitle>
          <div style={{ width: '60px' }} />
        </Header>
        <Content>
          <EmptyState>
            Failed to load provider data
            <Spacer size="md" />
            <Button variant="primary" onClick={loadProviderStatus}>
              Retry
            </Button>
          </EmptyState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Provider Dashboard</HeaderTitle>
        <StatusBadge status={status.status}>
          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
        </StatusBadge>
      </Header>

      <Content>
        <EarningsCard>
          <EarningsLabel>Total Earnings</EarningsLabel>
          <EarningsValue>{status.earnings.total.toFixed(2)} tGLIN</EarningsValue>
          <EarningsBreakdown>
            <span>Today: {status.earnings.today.toFixed(2)}</span>
            <span>Pending: {status.earnings.pending.toFixed(2)}</span>
          </EarningsBreakdown>
        </EarningsCard>

        <StatsGrid>
          <StatCard>
            <StatValue>{status.tasks.active}</StatValue>
            <StatLabel>Active Tasks</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{status.tasks.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>
        </StatsGrid>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions>
              <Button variant="primary" fullWidth onClick={onViewTasks}>
                View Tasks
              </Button>
              <Button variant="secondary" fullWidth onClick={onViewPoints}>
                Testnet Points
              </Button>
            </QuickActions>
          </CardContent>
        </Card>

        <Spacer size="md" />

        <Card>
          <CardHeader>
            <CardTitle>Task Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsGrid>
              <div>
                <StatValue style={{ fontSize: theme.fontSizes.xl }}>
                  {status.tasks.completed}
                </StatValue>
                <StatLabel>Completed</StatLabel>
              </div>
              <div>
                <StatValue style={{ fontSize: theme.fontSizes.xl, color: theme.colors.error }}>
                  {status.tasks.failed}
                </StatValue>
                <StatLabel>Failed</StatLabel>
              </div>
            </StatsGrid>
          </CardContent>
        </Card>
      </Content>
    </Container>
  );
};
