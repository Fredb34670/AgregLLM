// google-drive.ts - Service de synchronisation Cloud (V8 - Mode Alerte)

const CLIENT_ID = "895428232613-4p8st94hs6b0a7k2j7ftl3dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;

  async init(): Promise<void> {
    return new Promise<void>((resolve) => {
      if ((window as any).google?.accounts?.oauth2) {
        this.setupTokenClient();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.setupTokenClient();
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  private setupTokenClient() {
    if (!(window as any).google?.accounts?.oauth2) {
      setTimeout(() => this.setupTokenClient(), 200);
      return;
    }

    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error !== undefined) {
          alert("Erreur Google : " + response.error);
          return;
        }
        
        this.accessToken = response.access_token;
        const expiry = Date.now() + (3500 * 1000); // 1h environ
        
        localStorage.setItem('agregllm_gdrive_token', response.access_token);
        localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
        
        alert("Connexion Google réussie !");
        window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
      },
    });
  }

  login() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      alert("Le client Google n'est pas encore prêt. Réessayez dans 2 secondes.");
      this.init();
    }
  }

  logout() {
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    alert("Déconnecté de Google Drive");
    window.location.reload();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
  }

  async syncToDrive(data: string) {
    const token = localStorage.getItem('agregllm_gdrive_token');
    if (!token) return false;
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const existingFile = resData.files?.find((f: any) => f.name === 'agregllm_backup.json');
      const metadata = { name: 'agregllm_backup.json', parents: ['appDataFolder'] };
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([data], { type: 'application/json' }));
      const url = existingFile ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart` : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      await fetch(url, { method: existingFile ? 'PATCH' : 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      return true;
    } catch (e) { return false; }
  }

  async loadFromDrive(): Promise<string | null> {
    const token = localStorage.getItem('agregllm_gdrive_token');
    if (!token) return null;
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const existingFile = resData.files?.find((f: any) => f.name === 'agregllm_backup.json');
      if (existingFile) {
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return await fileResponse.text();
      }
    } catch (e) { }
    return null;
  }
}

export const gdrive = new GoogleDriveService();