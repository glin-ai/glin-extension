import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface Activity {
  type: string;
  points: number;
  timestamp: string;
}

interface TestnetPointsData {
  total: number;
  rank: number;
  activities: Activity[];
}

interface TestnetPointsProps {
  onBack: () => void;
  onViewLeaderboard: () => void;
}

const PointsCard = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
  border: none;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const PointsLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${theme.spacing.sm};
`;

const PointsValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin-bottom: ${theme.spacing.xs};
`;

const RankBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: white;
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

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityType = styled.div`
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const ActivityTime = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textTertiary};
`;

const ActivityPoints = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.success};
  font-family: ${theme.fonts.mono};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const formatActivityType = (type: string): string => {
  const types: Record<string, string> = {
    'task_completed': 'Task Completed',
    'wallet_connected': 'Wallet Connected',
    'daily_active': 'Daily Active',
    'referral': 'Referral',
  };
  return types[type] || type;
};

const formatTimeSince = (timestamp: string): string => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

export const TestnetPoints: React.FC<TestnetPointsProps> = ({ onBack, onViewLeaderboard }) => {
  const [points, setPoints] = useState<TestnetPointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      // TODO: Call backend API
      // Mock data for now
      setPoints({
        total: 1250,
        rank: 42,
        activities: [
          {
            type: 'task_completed',
            points: 50,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            type: 'daily_active',
            points: 10,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            type: 'task_completed',
            points: 35,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      });
    } catch (error) {
      console.error('Failed to load points:', error);
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
          <HeaderTitle>Testnet Points</HeaderTitle>
          <div style={{ width: '60px' }} />
        </Header>
        <Content>
          <EmptyState>Loading points...</EmptyState>
        </Content>
      </Container>
    );
  }

  if (!points) {
    return (
      <Container>
        <Header>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <HeaderTitle>Testnet Points</HeaderTitle>
          <div style={{ width: '60px' }} />
        </Header>
        <Content>
          <EmptyState>
            Failed to load points
            <Spacer size="md" />
            <Button variant="primary" onClick={loadPoints}>
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
        <HeaderTitle>Testnet Points</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <PointsCard>
          <PointsLabel>Total Points</PointsLabel>
          <PointsValue>{points.total.toLocaleString()}</PointsValue>
          <RankBadge>
            <span>🏆</span>
            Rank #{points.rank}
          </RankBadge>
        </PointsCard>

        <Spacer size="lg" />

        <Button variant="secondary" fullWidth onClick={onViewLeaderboard}>
          View Leaderboard
        </Button>

        <Spacer size="lg" />

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {points.activities.length === 0 ? (
              <EmptyState>No activity yet</EmptyState>
            ) : (
              points.activities.map((activity, index) => (
                <ActivityItem key={index}>
                  <ActivityInfo>
                    <ActivityType>{formatActivityType(activity.type)}</ActivityType>
                    <ActivityTime>{formatTimeSince(activity.timestamp)}</ActivityTime>
                  </ActivityInfo>
                  <ActivityPoints>+{activity.points}</ActivityPoints>
                </ActivityItem>
              ))
            )}
          </CardContent>
        </Card>
      </Content>
    </Container>
  );
};
