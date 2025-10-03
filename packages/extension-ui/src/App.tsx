import React, { useState, useEffect } from 'react';
import { MessageBridge, MessageType } from '@glin-extension/extension-base';
import { NetworkId } from '@glin-extension/extension-base/src/types/networks';

// Pages
import { Welcome, CreateWallet, ShowMnemonic, ImportWallet } from './pages/Onboarding';
import { Unlock } from './pages/Unlock';
import { Dashboard, Send, Receive, AccountManagement } from './pages/Dashboard';
import { ConnectedSites } from './pages/DappIntegration';
import { ProviderDashboard, TaskList, TestnetPoints } from './pages/Provider';
import { Settings, NetworkSwitcher, BackupWallet, ChangePassword, ThemeSelector } from './pages/Settings';

type Screen =
  | 'welcome'
  | 'create-wallet'
  | 'show-mnemonic'
  | 'import-wallet'
  | 'unlock'
  | 'dashboard'
  | 'send'
  | 'receive'
  | 'connected-sites'
  | 'account-management'
  | 'provider-dashboard'
  | 'task-list'
  | 'testnet-points'
  | 'settings'
  | 'network-switcher'
  | 'backup-wallet'
  | 'change-password'
  | 'theme-selector';

interface WalletState {
  isInitialized: boolean;
  isLocked: boolean;
  currentAccount?: {
    address: string;
    name: string;
    balance: string;
  };
}

interface ConnectedSite {
  origin: string;
  appName: string;
  appIcon?: string;
  connectedAt: number;
}

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [walletState, setWalletState] = useState<WalletState>({
    isInitialized: false,
    isLocked: true,
  });
  const [loading, setLoading] = useState(true);
  const [mnemonic, setMnemonic] = useState('');
  const [connectedSites, setConnectedSites] = useState<ConnectedSite[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkId>('localhost');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

  const messageBridge = new MessageBridge();

  // Initialize: Check wallet state on mount
  useEffect(() => {
    checkWalletState();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const networkResult = await messageBridge.sendToBackground(MessageType.GET_NETWORK);
      setCurrentNetwork((networkResult.network as NetworkId) || 'localhost');

      const themeResult = await messageBridge.sendToBackground(MessageType.GET_THEME);
      setCurrentTheme(themeResult.theme || 'dark');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkWalletState = async () => {
    try {
      const state = await messageBridge.sendToBackground(MessageType.GET_STATE);

      setWalletState({
        isInitialized: state.isInitialized,
        isLocked: state.isLocked,
        currentAccount: state.currentAccount,
      });

      // Determine initial screen
      if (!state.isInitialized) {
        setCurrentScreen('welcome');
      } else if (state.isLocked) {
        setCurrentScreen('unlock');
      } else {
        setCurrentScreen('dashboard');
      }
    } catch (error) {
      console.error('Failed to get wallet state:', error);
      setCurrentScreen('welcome');
    } finally {
      setLoading(false);
    }
  };

  // Onboarding: Create new wallet
  const handleCreateWallet = async (name: string, password: string) => {
    try {
      const result = await messageBridge.sendToBackground(MessageType.CREATE_WALLET, {
        name,
        password,
      });

      setMnemonic(result.mnemonic);
      setCurrentScreen('show-mnemonic');
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet');
    }
  };

  // Onboarding: Import existing wallet
  const handleImportWallet = async (name: string, mnemonic: string, password: string) => {
    try {
      await messageBridge.sendToBackground(MessageType.IMPORT_WALLET, {
        name,
        mnemonic,
        password,
      });

      setWalletState({
        isInitialized: true,
        isLocked: false,
      });

      await checkWalletState();
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      alert('Failed to import wallet. Please check your recovery phrase.');
    }
  };

  // Unlock wallet
  const handleUnlock = async (password: string) => {
    try {
      await messageBridge.sendToBackground(MessageType.UNLOCK_WALLET, { password });

      setWalletState((prev) => ({ ...prev, isLocked: false }));
      await checkWalletState();
      setCurrentScreen('dashboard');
    } catch (error) {
      throw new Error('Incorrect password');
    }
  };

  // Lock wallet
  const handleLock = async () => {
    try {
      await messageBridge.sendToBackground(MessageType.LOCK_WALLET);
      setWalletState((prev) => ({ ...prev, isLocked: true }));
      setCurrentScreen('unlock');
    } catch (error) {
      console.error('Failed to lock wallet:', error);
    }
  };

  // Send transaction
  const handleSend = async (recipient: string, amount: string) => {
    try {
      await messageBridge.sendToBackground(MessageType.SEND_TRANSACTION, {
        recipient,
        amount,
      });

      // Refresh wallet state after transaction
      await checkWalletState();
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  // Load connected sites
  const loadConnectedSites = async () => {
    try {
      const sites = await messageBridge.sendToBackground(MessageType.GET_CONNECTED_SITES);
      setConnectedSites(sites || []);
    } catch (error) {
      console.error('Failed to load connected sites:', error);
    }
  };

  // Disconnect site
  const handleDisconnectSite = async (origin: string) => {
    try {
      await messageBridge.sendToBackground(MessageType.DISCONNECT_SITE, { origin });
      await loadConnectedSites();
    } catch (error) {
      console.error('Failed to disconnect site:', error);
    }
  };

  // Disconnect all sites
  const handleDisconnectAllSites = async () => {
    try {
      for (const site of connectedSites) {
        await messageBridge.sendToBackground(MessageType.DISCONNECT_SITE, { origin: site.origin });
      }
      setConnectedSites([]);
    } catch (error) {
      console.error('Failed to disconnect all sites:', error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: '400px',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f1f5f9',
        }}
      >
        Loading...
      </div>
    );
  }

  // Render appropriate screen
  switch (currentScreen) {
    case 'welcome':
      return (
        <Welcome
          onCreateWallet={() => setCurrentScreen('create-wallet')}
          onImportWallet={() => setCurrentScreen('import-wallet')}
        />
      );

    case 'create-wallet':
      return (
        <CreateWallet
          onBack={() => setCurrentScreen('welcome')}
          onCreate={handleCreateWallet}
        />
      );

    case 'show-mnemonic':
      return (
        <ShowMnemonic
          mnemonic={mnemonic}
          onContinue={async () => {
            await checkWalletState();
            setCurrentScreen('dashboard');
          }}
        />
      );

    case 'import-wallet':
      return (
        <ImportWallet
          onBack={() => setCurrentScreen('welcome')}
          onImport={handleImportWallet}
        />
      );

    case 'unlock':
      return <Unlock onUnlock={handleUnlock} />;

    case 'dashboard':
      return (
        <Dashboard
          account={{
            address: walletState.currentAccount?.address || '',
            name: walletState.currentAccount?.name || 'Account',
            balance: walletState.currentAccount?.balance || '0',
          }}
          currentNetwork={currentNetwork}
          onLock={handleLock}
          onSettings={() => setCurrentScreen('settings')}
          onSend={() => setCurrentScreen('send')}
          onReceive={() => setCurrentScreen('receive')}
          onProvider={() => setCurrentScreen('provider-dashboard')}
          onManageAccounts={() => setCurrentScreen('account-management')}
          onAccountSwitch={() => checkWalletState()}
          onNetworkClick={() => setCurrentScreen('network-switcher')}
        />
      );

    case 'send':
      return (
        <Send
          balance={walletState.currentAccount?.balance || '0'}
          onBack={() => setCurrentScreen('dashboard')}
          onSend={handleSend}
        />
      );

    case 'receive':
      return (
        <Receive
          address={walletState.currentAccount?.address || ''}
          onBack={() => setCurrentScreen('dashboard')}
        />
      );

    case 'connected-sites':
      return (
        <ConnectedSites
          sites={connectedSites}
          onDisconnect={handleDisconnectSite}
          onDisconnectAll={handleDisconnectAllSites}
          onBack={() => setCurrentScreen('dashboard')}
        />
      );

    case 'account-management':
      return (
        <AccountManagement
          currentAccountAddress={walletState.currentAccount?.address || ''}
          onBack={() => setCurrentScreen('dashboard')}
          onAccountSwitch={async () => {
            await checkWalletState();
            setCurrentScreen('dashboard');
          }}
        />
      );

    case 'provider-dashboard':
      return (
        <ProviderDashboard
          onBack={() => setCurrentScreen('dashboard')}
          onViewTasks={() => setCurrentScreen('task-list')}
          onViewPoints={() => setCurrentScreen('testnet-points')}
        />
      );

    case 'task-list':
      return (
        <TaskList
          onBack={() => setCurrentScreen('provider-dashboard')}
          onAcceptTask={async (taskId) => {
            try {
              const bridge = new MessageBridge();
              await bridge.sendMessage(MessageType.ACCEPT_TASK, { taskId });
              // Navigate back to provider dashboard after accepting
              setCurrentScreen('provider-dashboard');
            } catch (error) {
              console.error('Failed to accept task:', error);
            }
          }}
        />
      );

    case 'testnet-points':
      return (
        <TestnetPoints
          onBack={() => setCurrentScreen('provider-dashboard')}
          onViewLeaderboard={() => {
            // TODO: Implement leaderboard view
            console.log('View leaderboard');
          }}
        />
      );

    case 'settings':
      return (
        <Settings
          onBack={() => setCurrentScreen('dashboard')}
          onNetworkChange={() => setCurrentScreen('network-switcher')}
          onBackupWallet={() => setCurrentScreen('backup-wallet')}
          onChangePassword={() => setCurrentScreen('change-password')}
          onThemeChange={() => setCurrentScreen('theme-selector')}
          currentNetwork={currentNetwork}
          currentTheme={currentTheme}
        />
      );

    case 'network-switcher':
      return (
        <NetworkSwitcher
          onBack={() => setCurrentScreen('settings')}
          currentNetwork={currentNetwork}
          onNetworkChange={async (networkId, customRpcUrl?) => {
            try {
              await messageBridge.sendToBackground(MessageType.CHANGE_NETWORK, {
                networkId,
                customRpcUrl,
              });
              setCurrentNetwork(networkId);
              await checkWalletState(); // Refresh wallet state with new network
              setCurrentScreen('settings');
            } catch (error) {
              console.error('Failed to change network:', error);
              throw error;
            }
          }}
        />
      );

    case 'backup-wallet':
      return (
        <BackupWallet
          onBack={() => setCurrentScreen('settings')}
        />
      );

    case 'change-password':
      return (
        <ChangePassword
          onBack={() => setCurrentScreen('settings')}
          onSuccess={() => {
            setCurrentScreen('settings');
          }}
        />
      );

    case 'theme-selector':
      return (
        <ThemeSelector
          onBack={() => setCurrentScreen('settings')}
          currentTheme={currentTheme}
          onThemeChange={async (theme) => {
            try {
              await messageBridge.sendToBackground(MessageType.SET_THEME, { theme });
              setCurrentTheme(theme);
              setCurrentScreen('settings');
            } catch (error) {
              console.error('Failed to change theme:', error);
            }
          }}
        />
      );

    default:
      return <Welcome onCreateWallet={() => {}} onImportWallet={() => {}} />;
  }
};
