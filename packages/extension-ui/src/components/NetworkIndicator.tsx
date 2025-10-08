import React from 'react';
import styled from 'styled-components';
import { NetworkId } from '@glin-extension/extension-base/src/types/networks';
import { theme } from '../theme';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface NetworkIndicatorProps {
  networkId: NetworkId;
  connectionStatus?: ConnectionStatus;
  errorMessage?: string | null;
  onClick?: () => void;
}

const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return theme.colors.success;
    case 'connecting':
      return theme.colors.warning;
    case 'disconnected':
      return theme.colors.textSecondary;
    case 'error':
      return theme.colors.danger;
    default:
      return theme.colors.textSecondary;
  }
};

const getStatusBgColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'rgba(16, 185, 129, 0.1)';
    case 'connecting':
      return 'rgba(251, 191, 36, 0.1)';
    case 'disconnected':
      return 'rgba(148, 163, 184, 0.1)';
    case 'error':
      return 'rgba(239, 68, 68, 0.1)';
    default:
      return 'rgba(148, 163, 184, 0.1)';
  }
};

const Container = styled.button<{ $status: ConnectionStatus }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${({ $status }) => getStatusColor($status)};
  background: ${({ $status }) => getStatusBgColor($status)};
  cursor: pointer;
  transition: all ${theme.transitions.base};
  font-size: ${theme.fontSizes.xs};
  font-weight: 600;

  &:hover {
    transform: scale(1.05);
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StatusDot = styled.div<{ $status: ConnectionStatus }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $status }) => getStatusColor($status)};
  animation: ${({ $status }) =>
    $status === 'connecting' ? 'pulse 1.5s ease-in-out infinite' :
    $status === 'connected' ? 'pulse 2s ease-in-out infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const NetworkName = styled.span<{ $status: ConnectionStatus }>`
  color: ${({ $status }) => getStatusColor($status)};
`;

const getNetworkDisplayName = (networkId: NetworkId): string => {
  switch (networkId) {
    case 'mainnet':
      return 'Mainnet';
    case 'testnet':
      return 'Testnet';
    case 'localhost':
      return 'Local';
    case 'custom':
      return 'Custom';
    default:
      return 'Unknown';
  }
};

const getStatusDisplayText = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'disconnected':
      return 'Offline';
    case 'error':
      return 'Connection Failed';
    default:
      return 'Unknown';
  }
};

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  networkId,
  connectionStatus = 'disconnected',
  errorMessage,
  onClick
}) => {
  const displayText = `${getNetworkDisplayName(networkId)} • ${getStatusDisplayText(connectionStatus)}`;
  const title = errorMessage
    ? `${displayText}\nError: ${errorMessage}`
    : displayText;

  return (
    <Container $status={connectionStatus} onClick={onClick} title={title}>
      <StatusDot $status={connectionStatus} />
      <NetworkName $status={connectionStatus}>{displayText}</NetworkName>
    </Container>
  );
};
