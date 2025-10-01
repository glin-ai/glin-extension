import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Container, Header, HeaderTitle, Content, Spacer } from '../../components/Layout';
import { theme } from '../../theme';
import { formatBalance } from '../../utils/format';

interface Account {
  address: string;
  name: string;
  balance: string;
}

interface AccountManagementProps {
  onBack: () => void;
  currentAccountAddress: string;
  onAccountSwitch: (address: string) => void;
}

const AccountCard = styled(Card)<{ $active: boolean }>`
  margin-bottom: ${theme.spacing.md};
  border: 2px solid
    ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) =>
    $active ? theme.colors.primaryDim : theme.colors.surface};
  transition: all ${theme.transitions.base};

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const AccountCardContent = styled.div`
  padding: ${theme.spacing.md};
`;

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.sm};
`;

const AccountInfo = styled.div`
  flex: 1;
`;

const AccountName = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ActiveBadge = styled.span`
  font-size: ${theme.fontSizes.xs};
  background: ${theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.full};
  font-weight: 600;
`;

const AccountAddress = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.mono};
  margin-bottom: ${theme.spacing.sm};
  word-break: break-all;
`;

const AccountBalance = styled.div`
  font-size: ${theme.fontSizes.xl};
  font-weight: 700;
  color: ${theme.colors.text};
  font-family: ${theme.fonts.mono};
`;

const AccountActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const IconButton = styled.button`
  background: ${theme.colors.backgroundLighter};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  transition: all ${theme.transitions.base};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text};
    border-color: ${theme.colors.primary};
  }
`;

const CreateAccountForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: ${theme.spacing.lg} 0 ${theme.spacing.md} 0;
`;

export const AccountManagement: React.FC<AccountManagementProps> = ({
  onBack,
  currentAccountAddress,
  onAccountSwitch,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    setCreating(true);
    try {
      await messageBridge.sendToBackground(MessageType.CREATE_ACCOUNT, {
        name: newAccountName,
      });

      setNewAccountName('');
      setShowCreateForm(false);
      await loadAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleRenameAccount = async (address: string) => {
    if (!editName.trim()) return;

    try {
      await messageBridge.sendToBackground(MessageType.RENAME_ACCOUNT, {
        address,
        name: editName,
      });

      setEditingAccount(null);
      setEditName('');
      await loadAccounts();
    } catch (error) {
      console.error('Failed to rename account:', error);
      alert('Failed to rename account');
    }
  };

  const handleSwitchAccount = async (address: string) => {
    try {
      await messageBridge.sendToBackground(MessageType.SWITCH_ACCOUNT, {
        address,
      });
      onAccountSwitch(address);
    } catch (error) {
      console.error('Failed to switch account:', error);
      alert('Failed to switch account');
    }
  };

  const handleExportAccount = async (address: string) => {
    try {
      const result = await messageBridge.sendToBackground(
        MessageType.EXPORT_ACCOUNT,
        { address }
      );

      // Show private key in a secure way (this should have additional security measures)
      alert(`Private Key:\n\n${result.privateKey}\n\nWARNING: Never share your private key!`);
    } catch (error) {
      console.error('Failed to export account:', error);
      alert('Failed to export account');
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <HeaderTitle>Accounts</HeaderTitle>
          <div style={{ width: '60px' }} />
        </Header>
        <Content>
          <EmptyState>Loading accounts...</EmptyState>
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
        <HeaderTitle>Accounts</HeaderTitle>
        <div style={{ width: '60px' }} />
      </Header>

      <Content>
        <Button
          variant="primary"
          fullWidth
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Account'}
        </Button>

        {showCreateForm && (
          <>
            <Spacer size="md" />
            <CreateAccountForm onSubmit={handleCreateAccount}>
              <Input
                label="Account Name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., My Second Account"
                required
              />
              <FormActions>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </FormActions>
            </CreateAccountForm>
          </>
        )}

        <SectionTitle>Your Accounts ({accounts.length})</SectionTitle>

        {accounts.length === 0 ? (
          <EmptyState>No accounts found</EmptyState>
        ) : (
          accounts.map((account) => (
            <AccountCard
              key={account.address}
              $active={account.address === currentAccountAddress}
            >
              <AccountCardContent>
                {editingAccount === account.address ? (
                  <div>
                    <Input
                      label="Account Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <Spacer size="sm" />
                    <FormActions>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingAccount(null);
                          setEditName('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRenameAccount(account.address)}
                      >
                        Save
                      </Button>
                    </FormActions>
                  </div>
                ) : (
                  <>
                    <AccountHeader>
                      <AccountInfo>
                        <AccountName>
                          {account.name}
                          {account.address === currentAccountAddress && (
                            <ActiveBadge>ACTIVE</ActiveBadge>
                          )}
                        </AccountName>
                        <AccountAddress>{account.address}</AccountAddress>
                        <AccountBalance>{formatBalance(account.balance)}</AccountBalance>
                      </AccountInfo>
                    </AccountHeader>

                    <AccountActions>
                      {account.address !== currentAccountAddress && (
                        <IconButton onClick={() => handleSwitchAccount(account.address)}>
                          Switch
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => {
                          setEditingAccount(account.address);
                          setEditName(account.name);
                        }}
                      >
                        ✏️ Rename
                      </IconButton>
                      <IconButton onClick={() => handleExportAccount(account.address)}>
                        🔑 Export
                      </IconButton>
                    </AccountActions>
                  </>
                )}
              </AccountCardContent>
            </AccountCard>
          ))
        )}
      </Content>
    </Container>
  );
};
