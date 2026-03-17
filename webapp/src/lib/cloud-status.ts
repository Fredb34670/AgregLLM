import { useState, useEffect } from 'react';
import { gdrive } from './google-drive';

export function useCloudStatus() {
  const [isConnected, setIsConnected] = useState(gdrive.isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsConnected(gdrive.isAuthenticated());
    };

    window.addEventListener('agregllm-gdrive-auth-success', handleAuthChange);
    return () => {
      window.removeEventListener('agregllm-gdrive-auth-success', handleAuthChange);
    };
  }, []);

  return {
    isConnected,
    login: () => gdrive.login(),
    logout: () => gdrive.logout(),
  };
}
