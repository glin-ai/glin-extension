import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
// Cleanup after each test
afterEach(() => {
    cleanup();
});
// Mock chrome API
global.chrome = {
    runtime: {
        sendMessage: vi.fn(),
        onMessage: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
        },
        id: 'test-extension-id',
    },
    storage: {
        local: {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
        },
    },
    tabs: {
        query: vi.fn(),
        sendMessage: vi.fn(),
    },
};
//# sourceMappingURL=vitest.setup.js.map