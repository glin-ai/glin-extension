import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';
import { theme } from '../../theme';

interface Wallet {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  accountCount: number;
  createdAt: Date;
  lastUsed: Date;
}

interface WalletSwitcherProps {
  currentWalletName: string;
  currentWalletAddress: string;
  onWalletChanged: () => void;
  onImportWallet?: () => void;
}

const WalletDropdownContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: ${theme.spacing.lg};
`;

const ActiveWalletButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex: 1;
  text-align: left;
`;

const WalletIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
`;

const WalletDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const WalletName = styled.div`
  font-size: ${theme.fontSizes.md};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 2px;
`;

const WalletAddress = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  transition: transform 0.2s;
  transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  color: ${theme.colors.textSecondary};
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + ${theme.spacing.xs});
  left: 0;
  right: 0;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
`;

const WalletItem = styled.button<{ isActive: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${(props) => (props.isActive ? theme.colors.primaryLight : 'transparent')};
  border: none;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActiveBadge = styled.span`
  margin-left: auto;
  padding: 2px 8px;
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: 600;
`;

const AccountCount = styled.span`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: ${theme.spacing.xs} 0;
`;

const AddWalletButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background: transparent;
  border: none;
  color: ${theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

export const WalletSwitcher: React.FC<WalletSwitcherProps> = ({
  currentWalletName,
  currentWalletAddress,
  onWalletChanged,
  onImportWallet,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const messageBridge = new MessageBridge();

  useEffect(() => {
    if (isOpen) {
      loadWallets();
    }
  }, [isOpen]);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const walletList = await messageBridge.sendToBackground(MessageType.GET_WALLETS);
      setWallets(walletList || []);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchWallet = async (walletId: number) => {
    const password = prompt('Enter password to switch wallet:');
    if (!password) return;

    try {
      await messageBridge.sendToBackground(MessageType.SWITCH_WALLET, {
        walletId,
        password,
      });

      setIsOpen(false);
      onWalletChanged();
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      alert(error instanceof Error ? error.message : 'Failed to switch wallet');
    }
  };

  const handleAddWallet = () => {
    setIsOpen(false);
    onImportWallet?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <WalletDropdownContainer>
      <ActiveWalletButton onClick={() => setIsOpen(!isOpen)}>
        <WalletInfo>
          <WalletIcon>{getInitials(currentWalletName)}</WalletIcon>
          <WalletDetails>
            <WalletName>{currentWalletName}</WalletName>
            <WalletAddress>
              {currentWalletAddress.slice(0, 10)}...{currentWalletAddress.slice(-8)}
            </WalletAddress>
          </WalletDetails>
        </WalletInfo>
        <ChevronIcon isOpen={isOpen}>▼</ChevronIcon>
      </ActiveWalletButton>

      <DropdownMenu isOpen={isOpen}>
        {loading ? (
          <WalletItem isActive={false} disabled>
            Loading wallets...
          </WalletItem>
        ) : (
          <>
            {wallets.map((wallet) => (
              <WalletItem
                key={wallet.id}
                isActive={wallet.isActive}
                onClick={() => !wallet.isActive && handleSwitchWallet(wallet.id)}
                disabled={wallet.isActive}
              >
                <WalletIcon>{getInitials(wallet.name)}</WalletIcon>
                <WalletDetails>
                  <WalletName>{wallet.name}</WalletName>
                  <AccountCount>{wallet.accountCount} accounts</AccountCount>
                </WalletDetails>
                {wallet.isActive && <ActiveBadge>Active</ActiveBadge>}
              </WalletItem>
            ))}

            <Divider />

            <AddWalletButton onClick={handleAddWallet}>
              + Import New Wallet
            </AddWalletButton>
          </>
        )}
      </DropdownMenu>
    </WalletDropdownContainer>
  );
};
