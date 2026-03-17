import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CloudNotificationBanner } from './CloudNotificationBanner';
import { useCloudStatus } from '../lib/cloud-status';

// Mock useCloudStatus
vi.mock('../lib/cloud-status', () => ({
  useCloudStatus: vi.fn(),
}));

describe('CloudNotificationBanner', () => {
  it('should render nothing when isConnected is true', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: true,
      login: vi.fn(),
    });

    const { container } = render(<CloudNotificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the banner when isConnected is false', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: false,
      login: vi.fn(),
    });

    render(<CloudNotificationBanner />);
    
    expect(screen.getByText(/Attention : discussions sauvegardées localement/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeDefined();
  });

  it('should call login when the connect button is clicked', () => {
    const loginMock = vi.fn();
    (useCloudStatus as any).mockReturnValue({
      isConnected: false,
      login: loginMock,
    });

    render(<CloudNotificationBanner />);
    
    const button = screen.getByRole('button', { name: /Se connecter/i });
    fireEvent.click(button);
    
    expect(loginMock).toHaveBeenCalled();
  });
});
