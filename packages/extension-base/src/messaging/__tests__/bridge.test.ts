import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageBridge } from '../bridge';
import { MessageType } from '../types';

describe('MessageBridge', () => {
  let bridge: MessageBridge;

  beforeEach(() => {
    bridge = new MessageBridge();
    vi.clearAllMocks();
  });

  it('sends message to background', async () => {
    const mockResponse = { success: true, data: 'test' };

    (global.chrome.runtime.sendMessage as any).mockImplementation(
      (_message: any, callback: Function) => {
        callback(mockResponse);
      }
    );

    const result = await bridge.sendToBackground(MessageType.GET_STATE);

    expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it('sends message with payload', async () => {
    const mockResponse = { success: true };
    const payload = { password: 'test123' };

    (global.chrome.runtime.sendMessage as any).mockImplementation(
      (_message: any, callback: Function) => {
        callback(mockResponse);
      }
    );

    const result = await bridge.sendToBackground(MessageType.UNLOCK_WALLET, payload);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: MessageType.UNLOCK_WALLET,
        payload,
      }),
      expect.any(Function)
    );
    expect(result).toEqual(mockResponse);
  });

  it('handles timeout', async () => {
    vi.useFakeTimers();

    (global.chrome.runtime.sendMessage as any).mockImplementation(() => {
      // Never call callback
    });

    const promise = bridge.sendToBackground(MessageType.GET_STATE);

    vi.advanceTimersByTime(30000); // Advance past timeout

    await expect(promise).rejects.toThrow('Request timeout');

    vi.useRealTimers();
  });

  it('handles error response', async () => {
    const errorResponse = {
      type: MessageType.ERROR,
      error: 'Something went wrong',
    };

    (global.chrome.runtime.sendMessage as any).mockImplementation(
      (_message: any, callback: Function) => {
        callback(errorResponse);
      }
    );

    await expect(bridge.sendToBackground(MessageType.GET_STATE)).rejects.toThrow(
      'Something went wrong'
    );
  });
});
