import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'available' | 'active' | 'completed' | 'failed';
  deadline?: string;
  createdAt: string;
}

interface TaskListProps {
  onBack: () => void;
  onAcceptTask: (taskId: string) => void;
}

const TabBar = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  border-bottom: 2px solid ${theme.colors.border};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ active }) => (active ? theme.colors.primary : 'transparent')};
  color: ${({ active }) => (active ? theme.colors.primary : theme.colors.textSecondary)};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.base};
  margin-bottom: -2px;

  &:hover {
    color: ${theme.colors.text};
  }
`;

const TaskCard = styled(Card)`
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  transition: all ${theme.transitions.base};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.sm};
`;

const TaskTitle = styled.h3`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
  flex: 1;
`;

const TaskReward = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: 700;
  color: ${theme.colors.primary};
  font-family: ${theme.fonts.mono};
`;

const TaskDescription = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.sm} 0;
  line-height: 1.6;
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const TaskMeta = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textTertiary};
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;

  ${({ status }) => {
    switch (status) {
      case 'available':
        return `
          background: rgba(59, 130, 246, 0.1);
          color: ${theme.colors.info};
        `;
      case 'active':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
        `;
      case 'completed':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: ${theme.colors.success};
        `;
      case 'failed':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.error};
        `;
      default:
        return `
          background: ${theme.colors.backgroundLighter};
          color: ${theme.colors.textSecondary};
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.md};
`;

export const TaskList: React.FC<TaskListProps> = ({ onBack, onAcceptTask }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [activeTab]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // TODO: Call backend API
      // Mock data for now
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Train Small Language Model',
          description: 'Help train a 125M parameter language model on general text data.',
          reward: 50,
          status: 'available',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Image Classification Task',
          description: 'Classify images from the CIFAR-10 dataset using a provided model.',
          reward: 25,
          status: 'available',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Sentiment Analysis',
          description: 'Analyze sentiment of product reviews using transformer models.',
          reward: 35,
          status: 'available',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];

      setTasks(mockTasks.filter(t => t.status === activeTab));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Tasks</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <TabBar>
          <Tab active={activeTab === 'available'} onClick={() => setActiveTab('available')}>
            Available
          </Tab>
          <Tab active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
            Active
          </Tab>
          <Tab active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
            Completed
          </Tab>
        </TabBar>

        {loading ? (
          <EmptyState>Loading tasks...</EmptyState>
        ) : tasks.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <div>No {activeTab} tasks</div>
          </EmptyState>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id}>
              <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
                <TaskReward>{task.reward} tGLIN</TaskReward>
              </TaskHeader>
              <TaskDescription>{task.description}</TaskDescription>
              <TaskFooter>
                <TaskMeta>
                  {task.deadline ? `Due ${formatDate(task.deadline)}` : `Posted ${formatDate(task.createdAt)}`}
                </TaskMeta>
                {activeTab === 'available' ? (
                  <Button variant="primary" size="sm" onClick={() => onAcceptTask(task.id)}>
                    Accept Task
                  </Button>
                ) : (
                  <StatusBadge status={task.status}>{task.status}</StatusBadge>
                )}
              </TaskFooter>
            </TaskCard>
          ))
        )}
      </Content>
    </Container>
  );
};
