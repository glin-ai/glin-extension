import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';

interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  description: string;
  isTestnet: boolean;
}

interface NetworkSwitcherProps {
  onBack: () => void;
  currentNetwork: string;
  onNetworkChange: (networkId: string) => void;
}

const networks: Network[] = [
  {
    id: 'testnet',
    name: 'GLIN Testnet',
    rpcUrl: 'wss://glin-rpc-testnet.up.railway.app',
    description: 'Test network for development',
    isTestnet: true,
  },
  {
    id: 'mainnet',
    name: 'GLIN Mainnet',
    rpcUrl: 'wss://glin-rpc.up.railway.app',
    description: 'Production network',
    isTestnet: false,
  },
];

const NetworkCard = styled(Card)<{ $active: boolean }>`
  margin-bottom: ${theme.spacing.md};
  border: 2px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) =>
    $active ? theme.colors.primaryDim : theme.colors.surface};
  cursor: pointer;
  transition: all ${theme.transitions.base};

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const NetworkCardContent = styled.div`
  padding: ${theme.spacing.md};
`;

const NetworkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const NetworkName = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const NetworkBadge = styled.span<{ $isTestnet: boolean }>`
  font-size: ${theme.fontSizes.xs};
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.full};
  background: ${({ $isTestnet }) =>
    $isTestnet ? theme.colors.warning : theme.colors.success};
  color: white;
  font-weight: 600;
`;

const ActiveBadge = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.primary};
  font-weight: 600;
`;

const NetworkDescription = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.sm};
`;

const NetworkRPC = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textTertiary};
  font-family: ${theme.fonts.mono};
  word-break: break-all;
`;

const WarningBox = styled.div`
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const WarningText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.5;
`;

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  onBack,
  currentNetwork,
  onNetworkChange,
}) => {
  const [switching, setSwitching] = useState(false);

  const handleNetworkSelect = async (networkId: string) => {
    if (networkId === currentNetwork) return;

    setSwitching(true);
    try {
      await onNetworkChange(networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert('Failed to switch network');
    } finally {
      setSwitching(false);
    }
  };

  const selectedNetwork = networks.find((n) => n.id === currentNetwork);

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <HeaderTitle>Network</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        {selectedNetwork?.isTestnet && (
          <>
            <WarningBox>
              <WarningText>
                ⚠️ You are on a testnet. Tokens have no real value. Switch to mainnet when ready for production.
              </WarningText>
            </WarningBox>
            <Spacer size="md" />
          </>
        )}

        {networks.map((network) => (
          <NetworkCard
            key={network.id}
            $active={network.id === currentNetwork}
            onClick={() => handleNetworkSelect(network.id)}
          >
            <NetworkCardContent>
              <NetworkHeader>
                <NetworkName>
                  {network.name}
                  <NetworkBadge $isTestnet={network.isTestnet}>
                    {network.isTestnet ? 'TESTNET' : 'MAINNET'}
                  </NetworkBadge>
                </NetworkName>
                {network.id === currentNetwork && (
                  <ActiveBadge>✓ Active</ActiveBadge>
                )}
              </NetworkHeader>
              <NetworkDescription>{network.description}</NetworkDescription>
              <NetworkRPC>{network.rpcUrl}</NetworkRPC>
            </NetworkCardContent>
          </NetworkCard>
        ))}

        {switching && (
          <>
            <Spacer size="lg" />
            <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
              Switching network...
            </div>
          </>
        )}
      </Content>
    </Container>
  );
};
