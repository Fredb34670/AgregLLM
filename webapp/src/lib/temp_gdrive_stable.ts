// google-drive.ts - Service de synchronisation Cloud (V2 Améliorée)

const CLIENT_ID = "895428232613-4p8st94hs6b0a7k2j7ftl3dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private isInitializing: boolean = false;

  async init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    return new Promise<void>((resolve) => {
      // Charger le script Google Identity Services
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error !== undefined) {
              console.error("GDrive Auth Error:", response);
              return;
            }
            this.accessToken = response.access_token;
            // Stocker avec une date d'expiration (1 heure par defaut pour Google)
            const expiry = Date.now() + (response.expires_in * 1000);
            localStorage.setItem('agregllm_gdrive_token', response.access_token);
            localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
            
            window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
          },
        });
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  login() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    
    if (!token || !expiry) return false;
    
    // Verifier si le token est encore valide (avec une marge de 1 minute)
    return Date.now() < (parseInt(expiry) - 60000);
  }

  private async getValidToken() {
    if (this.isAuthenticated()) {
      return this.accessToken || localStorage.getItem('agregllm_gdrive_token');
    }
    return null;
  }

  async syncToDrive(data: string) {
    const token = await this.getValidToken();
    if (!token) {
      console.warn("AgregLLM: Cannot sync, not authenticated or token expired");
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { files } = await response.json();
      const existingFile = files?.find((f: any) => f.name === 'agregllm_backup.json');

      const metadata = {
        name: 'agregllm_backup.json',
        parents: ['appDataFolder']
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([data], { type: 'application/json' }));

      if (existingFile) {
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }
      return true;
    } catch (e) {
      console.error("AgregLLM: Sync to Drive failed", e);
      return false;
    }
  }

  async loadFromDrive(): Promise<string | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { files } = await response.json();
      const existingFile = files?.find((f: any) => f.name === 'agregllm_backup.json');

      if (existingFile) {
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return await fileResponse.text();
      }
    } catch (e) {
      console.error("AgregLLM: Load from Drive failed", e);
    }
    return null;
  }
}

export const gdrive = new GoogleDriveService();