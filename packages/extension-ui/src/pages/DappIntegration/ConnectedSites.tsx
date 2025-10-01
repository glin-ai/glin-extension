import React from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content } from '../../components/Layout';
import { theme } from '../../theme';

interface ConnectedSite {
  origin: string;
  appName: string;
  appIcon?: string;
  connectedAt: number;
}

interface ConnectedSitesProps {
  sites: ConnectedSite[];
  onDisconnect: (origin: string) => void;
  onDisconnectAll: () => void;
  onBack: () => void;
}

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.md};
`;

const EmptyText = styled.div`
  font-size: ${theme.fontSizes.base};
  line-height: 1.6;
`;

const SiteCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  transition: all ${theme.transitions.base};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const SiteIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.backgroundLighter};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.lg};
  flex-shrink: 0;
`;

const SiteInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SiteName = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const SiteOrigin = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SiteTime = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textTertiary};
  margin-top: ${theme.spacing.xs};
`;

const DisconnectButton = styled(Button)`
  flex-shrink: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const formatTimeSince = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

export const ConnectedSites: React.FC<ConnectedSitesProps> = ({
  sites,
  onDisconnect,
  onDisconnectAll,
  onBack,
}) => {
  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Connected Sites</HeaderTitle>
        <HeaderActions>
          {sites.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onDisconnectAll}>
              Disconnect All
            </Button>
          )}
        </HeaderActions>
      </Header>

      <Content>
        {sites.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔌</EmptyIcon>
            <EmptyText>
              No connected sites
              <br />
              <br />
              When you connect to a dapp, it will appear here.
            </EmptyText>
          </EmptyState>
        ) : (
          <>
            {sites.map((site) => (
              <SiteCard key={site.origin}>
                <SiteIcon>{site.appIcon || '🌐'}</SiteIcon>
                <SiteInfo>
                  <SiteName>{site.appName}</SiteName>
                  <SiteOrigin>{site.origin}</SiteOrigin>
                  <SiteTime>Connected {formatTimeSince(site.connectedAt)}</SiteTime>
                </SiteInfo>
                <DisconnectButton
                  variant="danger"
                  size="sm"
                  onClick={() => onDisconnect(site.origin)}
                >
                  Disconnect
                </DisconnectButton>
              </SiteCard>
            ))}
          </>
        )}
      </Content>
    </Container>
  );
};
