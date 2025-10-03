import React from 'react';
import styled from 'styled-components';
import { NetworkId } from '@glin-extension/extension-base/src/types/networks';
import { theme } from '../theme';

interface NetworkIndicatorProps {
  networkId: NetworkId;
  onClick?: () => void;
}

const Container = styled.button<{ $networkId: NetworkId }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${({ $networkId }) => {
    if ($networkId === 'mainnet') return theme.colors.success;
    if ($networkId === 'testnet') return theme.colors.warning;
    if ($networkId === 'localhost') return '#6366f1';
    return theme.colors.textSecondary;
  }};
  background: ${({ $networkId }) => {
    if ($networkId === 'mainnet') return 'rgba(16, 185, 129, 0.1)';
    if ($networkId === 'testnet') return 'rgba(251, 191, 36, 0.1)';
    if ($networkId === 'localhost') return 'rgba(99, 102, 241, 0.1)';
    return 'rgba(148, 163, 184, 0.1)';
  }};
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

const StatusDot = styled.div<{ $networkId: NetworkId }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $networkId }) => {
    if ($networkId === 'mainnet') return theme.colors.success;
    if ($networkId === 'testnet') return theme.colors.warning;
    if ($networkId === 'localhost') return '#6366f1';
    return theme.colors.textSecondary;
  }};
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const NetworkName = styled.span<{ $networkId: NetworkId }>`
  color: ${({ $networkId }) => {
    if ($networkId === 'mainnet') return theme.colors.success;
    if ($networkId === 'testnet') return theme.colors.warning;
    if ($networkId === 'localhost') return '#6366f1';
    return theme.colors.textSecondary;
  }};
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

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({ networkId, onClick }) => {
  return (
    <Container $networkId={networkId} onClick={onClick}>
      <StatusDot $networkId={networkId} />
      <NetworkName $networkId={networkId}>{getNetworkDisplayName(networkId)}</NetworkName>
    </Container>
  );
};
