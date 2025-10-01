import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../packages/extension-ui/src/App';
describe('Wallet Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('shows welcome screen for new users', async () => {
        global.chrome.runtime.sendMessage.mockImplementation((_message, callback) => {
            callback({
                isInitialized: false,
                isLocked: true,
            });
        });
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('Welcome to GLIN Wallet')).toBeInTheDocument();
        });
        expect(screen.getByText('Create New Wallet')).toBeInTheDocument();
        expect(screen.getByText('Import Existing Wallet')).toBeInTheDocument();
    });
    it('shows unlock screen for initialized locked wallet', async () => {
        global.chrome.runtime.sendMessage.mockImplementation((_message, callback) => {
            callback({
                isInitialized: true,
                isLocked: true,
            });
        });
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText(/unlock/i)).toBeInTheDocument();
        });
    });
    it('navigates from welcome to create wallet', async () => {
        const user = userEvent.setup();
        global.chrome.runtime.sendMessage.mockImplementation((_message, callback) => {
            callback({
                isInitialized: false,
                isLocked: true,
            });
        });
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('Welcome to GLIN Wallet')).toBeInTheDocument();
        });
        const createButton = screen.getByText('Create New Wallet');
        await user.click(createButton);
        await waitFor(() => {
            expect(screen.getByText('Create Wallet')).toBeInTheDocument();
        });
    });
    it('validates password requirements on create wallet', async () => {
        const user = userEvent.setup();
        global.chrome.runtime.sendMessage.mockImplementation((_message, callback) => {
            callback({
                isInitialized: false,
                isLocked: true,
            });
        });
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('Welcome to GLIN Wallet')).toBeInTheDocument();
        });
        const createButton = screen.getByText('Create New Wallet');
        await user.click(createButton);
        await waitFor(() => {
            expect(screen.getByText('Create Wallet')).toBeInTheDocument();
        });
        // Should show validation requirements
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
});
//# sourceMappingURL=wallet-flow.test.js.map