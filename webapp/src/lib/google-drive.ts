// google-drive.ts - Service de synchronisation Cloud (V5 Diagnostic)

const CLIENT_ID = "895428232613-4p8st94hs6b0a7k2j7ftl3dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve) => {
      console.log("AgregLLM GDrive: Lancement de l'initialisation...");
      
      const scriptId = 'gdrive-gis-script';
      if (document.getElementById(scriptId)) {
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
        console.log("AgregLLM GDrive: Script Google chargé dans le DOM");
        this.setupTokenClient();
        resolve();
      };
      script.onerror = (err) => {
        console.error("AgregLLM GDrive: Échec du chargement du script distant", err);
        resolve();
      };
      document.body.appendChild(script);
    });

    return this.initPromise;
  }

  private setupTokenClient() {
    try {
      if (!(window as any).google?.accounts?.oauth2) {
        console.log("AgregLLM GDrive: oauth2 non prêt, attente...");
        setTimeout(() => this.setupTokenClient(), 200);
        return;
      }

      console.log("AgregLLM GDrive: Configuration du TokenClient...");
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          console.log("AgregLLM GDrive: >>> RÉPONSE GOOGLE REÇUE <<<", response);
          
          if (response.error !== undefined) {
            console.error("AgregLLM GDrive: Erreur Google Auth:", response.error);
            alert("Erreur Google : " + response.error);
            return;
          }
          
          this.accessToken = response.access_token;
          const expiry = Date.now() + (response.expires_in * 1000);
          
          localStorage.setItem('agregllm_gdrive_token', response.access_token);
          localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
          
          console.log("AgregLLM GDrive: Token stocké en local. Expiration :", new Date(expiry).toLocaleTimeString());
          
          // Déclencher l'événement pour l'UI
          window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
        },
      });
      console.log("AgregLLM GDrive: TokenClient configuré et prêt");
    } catch (e) {
      console.error("AgregLLM GDrive: Erreur fatale setup", e);
    }
  }

  login() {
    console.log("AgregLLM GDrive: Clic sur Connexion détecté");
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      console.warn("AgregLLM GDrive: TokenClient absent, tentative de ré-init");
      this.init().then(() => this.tokenClient?.requestAccessToken({ prompt: 'consent' }));
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
    console.log("AgregLLM GDrive: Déconnexion effectuée");
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    
    if (!token || !expiry) return false;
    return Date.now() < (parseInt(expiry) - 60000);
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
      console.error("AgregLLM GDrive: Erreur de synchronisation", e);
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
    } catch (e) {
      console.error("AgregLLM GDrive: Erreur de lecture", e);
    }
    return null;
  }
}

export const gdrive = new GoogleDriveService();
