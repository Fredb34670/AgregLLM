// google-drive.ts - Service de synchronisation Cloud (V3 Robuste)

const CLIENT_ID = "895428232613-4p8st94hs6b0a7k2j7ftl3dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve) => {
      console.log("AgregLLM GDrive: Initialisation...");
      
      // Charger le script Google Identity Services
      if (document.getElementById('gdrive-gis-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'gdrive-gis-script';
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("AgregLLM GDrive: Script GIS chargé");
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            console.log("AgregLLM GDrive: Auth callback reçu", response);
            if (response.error !== undefined) {
              console.error("GDrive Auth Error:", response);
              return;
            }
            this.accessToken = response.access_token;
            const expiresIn = response.expires_in || 3600;
            const expiry = Date.now() + (expiresIn * 1000);
            
            localStorage.setItem('agregllm_gdrive_token', response.access_token);
            localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
            
            console.log("AgregLLM GDrive: Token stocké, expiration dans", expiresIn, "s");
            window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
          },
        });
        resolve();
      };
      script.onerror = (err) => {
        console.error("AgregLLM GDrive: Erreur chargement script", err);
        this.initPromise = null;
        resolve();
      };
      document.body.appendChild(script);
    });

    return this.initPromise;
  }

  login() {
    console.log("AgregLLM GDrive: Tentative de connexion...");
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      console.error("AgregLLM GDrive: tokenClient non initialisé");
      this.init().then(() => this.tokenClient?.requestAccessToken({ prompt: 'consent' }));
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    console.log("AgregLLM GDrive: Déconnecté");
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    
    if (!token || !expiry) return false;
    
    const isValid = Date.now() < (parseInt(expiry) - 60000);
    return isValid;
  }

  private async getValidToken() {
    if (this.isAuthenticated()) {
      return this.accessToken || localStorage.getItem('agregllm_gdrive_token');
    }
    return null;
  }

  async syncToDrive(data: string) {
    const token = await this.getValidToken();
    if (!token) return false;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const files = resData.files || [];
      const existingFile = files.find((f: any) => f.name === 'agregllm_backup.json');

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
      console.error("AgregLLM Sync Error:", e);
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
      const resData = await response.json();
      const files = resData.files || [];
      const existingFile = files.find((f: any) => f.name === 'agregllm_backup.json');

      if (existingFile) {
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return await fileResponse.text();
      }
    } catch (e) {
      console.error("AgregLLM Load Error:", e);
    }
    return null;
  }
}

export const gdrive = new GoogleDriveService();
