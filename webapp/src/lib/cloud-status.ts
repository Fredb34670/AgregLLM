import { useState, useEffect } from 'react';
import { gdrive } from './google-drive';

export function useCloudStatus() {
  const [isConnected, setIsConnected] = useState(() => {
    const auth = gdrive.isAuthenticated();
    console.log("useCloudStatus: Initial auth status:", auth);
    return auth;
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const auth = gdrive.isAuthenticated();
      console.log("useCloudStatus: Auth change event detected, new status:", auth);
      setIsConnected(auth);
    };

    window.addEventListener('agregllm-gdrive-auth-success', handleAuthChange);
    // Également écouter les changements de storage (pour les autres onglets)
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('agregllm-gdrive-auth-success', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return {
    isConnected,
    login: () => {
      console.log("useCloudStatus: Triggering login");
      gdrive.login();
    },
    logout: () => {
      console.log("useCloudStatus: Triggering logout");
      gdrive.logout();
    },
  };
}
