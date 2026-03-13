// google-drive.ts - Service de synchronisation Cloud (V9 Stable)

const CLIENT_ID = "895428232613-4p8st94hs6boa7k2j7ft13dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve) => {
      // Si GIS est déjà là
      if ((window as any).google?.accounts?.oauth2) {
        this.setupTokenClient();
        resolve();
        return;
      }

      // Sinon on charge le script
      const script = document.createElement('script');
      script.id = 'gdrive-gis-script';
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Petit délai pour laisser global 'google' s'enregistrer
        setTimeout(() => {
          this.setupTokenClient();
          resolve();
        }, 300);
      };
      script.onerror = () => {
        console.error("AgregLLM: Failed to load Google GIS script");
        resolve();
      };
      document.body.appendChild(script);
    });

    return this.initPromise;
  }

  private setupTokenClient() {
    const oauth2 = (window as any).google?.accounts?.oauth2;
    if (!oauth2) return;

    this.tokenClient = oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error !== undefined) {
          console.error("AgregLLM GDrive Error:", response.error);
          return;
        }
        
        const expiry = Date.now() + (response.expires_in * 1000);
        
        localStorage.setItem('agregllm_gdrive_token', response.access_token);
        localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
        
        window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
      },
    });
  }

  login() {
    console.log("AgregLLM Debug: Login requested");
    const redirectUri = "https://fredb34670.github.io/AgregLLM/";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
                    `client_id=${CLIENT_ID}&` + 
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` + 
                    `response_type=token&` + 
                    `scope=${encodeURIComponent(SCOPES)}&` + 
                    `prompt=consent`;
    
    const isExtension = typeof window !== 'undefined' && 
                       (window.location.protocol === 'chrome-extension:' || 
                        window.location.protocol === 'moz-extension:');
    
    if (isExtension) {
      console.log("AgregLLM Debug: Extension context, forcing separate window via browser.windows.create");
      const api = (window as any).browser || (window as any).chrome;
      if (api && api.windows && api.windows.create) {
        // Cette méthode GARANTIT une fenêtre séparée (popup)
        api.windows.create({
          url: authUrl,
          type: "popup",
          width: 500,
          height: 650
        });
        return;
      }
    }

    // Fallback Web ou si l'API n'est pas dispo
    window.open(authUrl, "AgregLLMAuth", "width=500,height=650,status=no,menubar=no,toolbar=no");
  }

  logout() {
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    localStorage.removeItem('agregllm_gdrive_user');
    
    // Déclencher un événement de synchronisation pour l'extension si présente
    window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
    
    // Notifier l'extension via le storage (détecté par sync.js)
    const api = (window as any).browser || (window as any).chrome;
    if (api && api.storage && api.storage.local) {
       api.storage.local.set({ 
           gdrive_token: null,
           gdrive_expiry: null,
           gdrive_user: null
       });
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    if (!token || !expiry) return false;
    return Date.now() < (parseInt(expiry) - 60000);
  }

  async getUserInfo(): Promise<{ name: string; email: string } | null> {
    const token = localStorage.getItem('agregllm_gdrive_token');
    if (!token) return null;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return null;
      const data = await response.json();
      
      // Sauvegarder les infos pour ne pas les redemander
      localStorage.setItem('agregllm_gdrive_user', JSON.stringify({ name: data.name || data.email, email: data.email }));
      
      return {
        name: data.name || data.email,
        email: data.email
      };
    } catch (e) {
      console.error('Error fetching user info:', e);
      // Essayer de charger depuis le cache
      const cached = localStorage.getItem('agregllm_gdrive_user');
      return cached ? JSON.parse(cached) : null;
    }
  }

  async syncToDrive(data: string): Promise<boolean> {
    const token = localStorage.getItem('agregllm_gdrive_token');
    if (!token) return false;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const files = resData.files || [];
      const existingFile = files.find((f: any) => f.name === 'agregllm_backup.json');

      const metadata = { name: 'agregllm_backup.json', parents: ['appDataFolder'] };
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([data], { type: 'application/json' }));

      const url = existingFile 
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      await fetch(url, {
        method: existingFile ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async loadFromDrive(): Promise<string | null> {
    const token = localStorage.getItem('agregllm_gdrive_token');
    if (!token) return null;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const files = resData.files || [];
      const existingFile = files.find((f: any) => f.name === 'agregllm_backup.json');

      if (existingFile) {
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return await fileResponse.text();
      }
    } catch (e) { }
    return null;
  }

  // Auto-sync: synchronise automatiquement si connecté
  async autoSync(data: string): Promise<void> {
    if (!this.isAuthenticated()) return;
    
    // Éviter de synchroniser trop souvent (debounce)
    const lastSync = localStorage.getItem('agregllm_last_sync');
    const now = Date.now();
    if (lastSync && (now - parseInt(lastSync)) < 5000) {
      // Moins de 5 secondes depuis la dernière sync, on attend
      return;
    }
    
    const success = await this.syncToDrive(data);
    if (success) {
      localStorage.setItem('agregllm_last_sync', now.toString());
      console.log('Auto-sync Google Drive: OK');
    }
  }

  // Charger automatiquement au démarrage
  async autoLoad(): Promise<string | null> {
    if (!this.isAuthenticated()) return null;
    
    console.log('Auto-loading from Google Drive...');
    return await this.loadFromDrive();
  }
}

export const gdrive = new GoogleDriveService();
