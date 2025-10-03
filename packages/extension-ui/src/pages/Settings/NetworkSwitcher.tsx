import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';
import { Network, NetworkId, getAllNetworks, validateRpcUrl } from '@glin-extension/extension-base/src/types/networks';

interface NetworkSwitcherProps {
  onBack: () => void;
  currentNetwork: NetworkId;
  onNetworkChange: (networkId: NetworkId, customRpcUrl?: string) => void;
}

const networks = getAllNetworks();

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

const NetworkBadge = styled.span<{ $networkId: NetworkId }>`
  font-size: ${theme.fontSizes.xs};
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.full};
  background: ${({ $networkId }) => {
    if ($networkId === 'mainnet') return theme.colors.success;
    if ($networkId === 'testnet') return theme.colors.warning;
    if ($networkId === 'localhost') return '#6366f1'; // Indigo for localhost
    return theme.colors.textSecondary; // Gray for custom
  }};
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

const CustomRPCSection = styled.div`
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.md};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

const InputGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  font-size: ${theme.fontSizes.sm};
  font-family: ${theme.fonts.mono};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

const ErrorText = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.xs};
`;

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  onBack,
  currentNetwork,
  onNetworkChange,
}) => {
  const [switching, setSwitching] = useState(false);
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [rpcError, setRpcError] = useState('');

  const handleNetworkSelect = async (networkId: NetworkId) => {
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

  const handleCustomRpcConnect = async () => {
    // Validate RPC URL
    const validation = validateRpcUrl(customRpcUrl);
    if (!validation.valid) {
      setRpcError(validation.error || 'Invalid RPC URL');
      return;
    }

    setRpcError('');
    setSwitching(true);
    try {
      await onNetworkChange('custom', customRpcUrl);
    } catch (error) {
      console.error('Failed to connect to custom RPC:', error);
      alert('Failed to connect to custom RPC');
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
        {currentNetwork === 'testnet' && (
          <>
            <WarningBox>
              <WarningText>
                ⚠️ You are on a testnet. Tokens have no real value. Switch to mainnet when ready for production.
              </WarningText>
            </WarningBox>
            <Spacer size="md" />
          </>
        )}

        {currentNetwork === 'localhost' && (
          <>
            <WarningBox>
              <WarningText>
                💻 You are connected to a local development node. Make sure your local blockchain is running on ws://localhost:9944.
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
                  <NetworkBadge $networkId={network.id}>
                    {network.id.toUpperCase()}
                  </NetworkBadge>
                </NetworkName>
                {network.id === currentNetwork && (
                  <ActiveBadge>✓ Active</ActiveBadge>
                )}
              </NetworkHeader>
              <NetworkRPC>{network.rpcUrl}</NetworkRPC>
            </NetworkCardContent>
          </NetworkCard>
        ))}

        <CustomRPCSection>
          <SectionTitle>Custom RPC</SectionTitle>
          <InputGroup>
            <Label htmlFor="customRpcUrl">WebSocket URL</Label>
            <Input
              id="customRpcUrl"
              type="text"
              placeholder="ws://localhost:9944 or wss://..."
              value={customRpcUrl}
              onChange={(e) => {
                setCustomRpcUrl(e.target.value);
                setRpcError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomRpcConnect();
                }
              }}
            />
            {rpcError && <ErrorText>{rpcError}</ErrorText>}
          </InputGroup>
          <Button
            variant="primary"
            fullWidth
            onClick={handleCustomRpcConnect}
            disabled={switching || !customRpcUrl}
          >
            Connect to Custom RPC
          </Button>
        </CustomRPCSection>

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
