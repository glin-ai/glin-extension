import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { formatBalance } from '../../utils/format';

interface Account {
  address: string;
  name: string;
  balance: string;
}

interface AccountSwitcherProps {
  currentAccount: Account;
  onClose: () => void;
  onAccountChange: (address: string) => void;
  onManageAccounts: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  width: 90%;
  max-width: 360px;
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.xl};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color ${theme.transitions.base};

  &:hover {
    color: ${theme.colors.text};
  }
`;

const AccountList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const AccountItem = styled.button<{ $active: boolean }>`
  width: 100%;
  background: ${({ $active }) =>
    $active ? theme.colors.primaryDim : theme.colors.surface};
  border: 1px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  transition: all ${theme.transitions.base};
  text-align: left;

  &:hover {
    background: ${({ $active }) =>
      $active ? theme.colors.primaryDim : theme.colors.surfaceHover};
    border-color: ${theme.colors.primary};
  }
`;

const AccountItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
`;

const AccountName = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
`;

const CheckMark = styled.span`
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.lg};
`;

const AccountAddress = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
  margin-bottom: ${theme.spacing.xs};
`;

const AccountBalance = styled.div`
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.mono};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
`;

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  currentAccount,
  onClose,
  onAccountChange,
  onManageAccounts,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const messageBridge = new MessageBridge();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountList = await messageBridge.sendToBackground(
        MessageType.GET_ACCOUNTS
      );
      setAccounts(accountList || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (address: string) => {
    if (address !== currentAccount.address) {
      onAccountChange(address);
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Switch Account</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <AccountList>
          {loading ? (
            <EmptyState>Loading accounts...</EmptyState>
          ) : accounts.length === 0 ? (
            <EmptyState>No accounts found</EmptyState>
          ) : (
            accounts.map((account) => (
              <AccountItem
                key={account.address}
                $active={account.address === currentAccount.address}
                onClick={() => handleAccountSelect(account.address)}
              >
                <AccountItemHeader>
                  <AccountName>{account.name}</AccountName>
                  {account.address === currentAccount.address && (
                    <CheckMark>✓</CheckMark>
                  )}
                </AccountItemHeader>
                <AccountAddress>{truncateAddress(account.address)}</AccountAddress>
                <AccountBalance>{formatBalance(account.balance)}</AccountBalance>
              </AccountItem>
            ))
          )}
        </AccountList>

        <ModalFooter>
          <Button variant="secondary" fullWidth onClick={onManageAccounts}>
            Manage Accounts
          </Button>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};
