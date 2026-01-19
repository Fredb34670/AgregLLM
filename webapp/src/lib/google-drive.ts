// google-drive.ts - Service de synchronisation Cloud (V9 Stable)

const CLIENT_ID = "895428232613-4p8st94hs6b0a7k2j7ftl3dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve) => {
      if ((window as any).google?.accounts?.oauth2) {
        this.setupTokenClient();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'gdrive-gis-script';
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.setupTokenClient();
        resolve();
      };
      script.onerror = () => resolve();
      document.body.appendChild(script);
    });

    return this.initPromise;
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
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
    else {
      this.init().then(() => this.tokenClient?.requestAccessToken({ prompt: 'consent' }));
    }
  }

  logout() {
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
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
}

export const gdrive = new GoogleDriveService();
