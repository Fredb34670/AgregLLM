import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCloudStatus } from './cloud-status';
import { gdrive } from './google-drive';

// Mock gdrive
vi.mock('./google-drive', () => ({
  gdrive: {
    isAuthenticated: vi.fn(),
    login: vi.fn(),
  }
}));

describe('useCloudStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return isConnected: false when gdrive is not authenticated', () => {
    (gdrive.isAuthenticated as any).mockReturnValue(false);
    
    const { result } = renderHook(() => useCloudStatus());
    
    expect(result.current.isConnected).toBe(false);
  });

  it('should return isConnected: true when gdrive is authenticated', () => {
    (gdrive.isAuthenticated as any).mockReturnValue(true);
    
    const { result } = renderHook(() => useCloudStatus());
    
    expect(result.current.isConnected).toBe(true);
  });

  it('should update status when agregllm-gdrive-auth-success event is dispatched', () => {
    (gdrive.isAuthenticated as any).mockReturnValue(false);
    
    const { result } = renderHook(() => useCloudStatus());
    expect(result.current.isConnected).toBe(false);

    // Simulate auth success
    act(() => {
      (gdrive.isAuthenticated as any).mockReturnValue(true);
      window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should call gdrive.login when login is called', () => {
    const { result } = renderHook(() => useCloudStatus());
    
    act(() => {
      result.current.login();
    });

    expect(gdrive.login).toHaveBeenCalled();
  });
});
