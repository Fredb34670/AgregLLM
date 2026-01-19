// google-drive.ts - Service de synchronisation Cloud (V4 Ultra-Robuste)

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
      
      const scriptId = 'gdrive-gis-script';
      if (document.getElementById(scriptId)) {
        console.log("AgregLLM GDrive: Script déjà présent");
        this.setupTokenClient();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("AgregLLM GDrive: Script GIS chargé physiquement");
        this.setupTokenClient();
        resolve();
      };
      script.onerror = (err) => {
        console.error("AgregLLM GDrive: Erreur critique chargement script", err);
        this.initPromise = null;
        resolve();
      };
      document.body.appendChild(script);
    });

    return this.initPromise;
  }

  private setupTokenClient() {
    try {
      if (!(window as any).google?.accounts?.oauth2) {
        console.warn("AgregLLM GDrive: API Google non disponible, nouvel essai dans 500ms");
        setTimeout(() => this.setupTokenClient(), 500);
        return;
      }

      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          console.log("AgregLLM GDrive: Réponse OAuth reçue", response);
          if (response.error !== undefined) {
            console.error("AgregLLM GDrive: Erreur OAuth", response.error);
            return;
          }
          
          this.accessToken = response.access_token;
          const expiresIn = response.expires_in || 3600;
          const expiry = Date.now() + (expiresIn * 1000);
          
          localStorage.setItem('agregllm_gdrive_token', response.access_token);
          localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
          
          console.log("AgregLLM GDrive: Token sauvegardé avec succès");
          window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
        },
      });
      console.log("AgregLLM GDrive: Client Token initialisé");
    } catch (e) {
      console.error("AgregLLM GDrive: Erreur setupTokenClient", e);
    }
  }

  login() {
    console.log("AgregLLM GDrive: Ouverture de la popup Google...");
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      this.init().then(() => {
        if (this.tokenClient) this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    console.log("AgregLLM GDrive: Session supprimée");
    window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    
    if (!token || !expiry) return false;
    
    // Valide si expiration > maintenant + 1 min
    const isValide = Date.now() < (parseInt(expiry) - 60000);
    return isValide;
  }

  private async getValidToken() {
    if (this.isAuthenticated()) {
      return this.accessToken || localStorage.getItem('agregllm_gdrive_token');
    }
    return null;
  }

  async syncToDrive(data: string): Promise<boolean> {
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
      console.error("AgregLLM GDrive: Échec Sync", e);
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
      console.error("AgregLLM GDrive: Échec Load", e);
    }
    return null;
  }
}

export const gdrive = new GoogleDriveService();