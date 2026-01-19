// google-drive.ts - Service de synchronisation Cloud (V7 Correction Init)

const CLIENT_ID = "895428232613-4p8st94hs6b0a7k2j7ftl3dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve) => {
      console.log("AgregLLM GDrive: Initialisation V7...");
      
      const scriptId = 'gdrive-gis-script';
      if (document.getElementById(scriptId)) {
        this.waitForGoogle(() => {
          this.setupTokenClient();
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("AgregLLM GDrive: Script chargé");
        this.waitForGoogle(() => {
          this.setupTokenClient();
          resolve();
        });
      };
      document.body.appendChild(script);
    });

    return this.initPromise;
  }

  private waitForGoogle(callback: () => void) {
    if ((window as any).google?.accounts?.oauth2) {
      callback();
    } else {
      setTimeout(() => this.waitForGoogle(callback), 100);
    }
  }

  private setupTokenClient() {
    if (this.tokenClient) return;

    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        console.log("AgregLLM GDrive: Callback reçu", response);
        if (response.error !== undefined) {
          console.error("GDrive Error:", response.error);
          return;
        }
        
        this.accessToken = response.access_token;
        const expiry = Date.now() + (response.expires_in * 1000);
        localStorage.setItem('agregllm_gdrive_token', response.access_token);
        localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
        
        console.log("AgregLLM GDrive: Authentification réussie");
        window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
      },
    });
    console.log("AgregLLM GDrive: Client configuré");
  }

  login() {
    if (!this.tokenClient) {
      console.error("AgregLLM GDrive: Client non prêt");
      this.init().then(() => this.tokenClient?.requestAccessToken({ prompt: 'consent' }));
      return;
    }
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('agregllm_gdrive_token');
    localStorage.removeItem('agregllm_gdrive_expiry');
    window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agregllm_gdrive_token');
    const expiry = localStorage.getItem('agregllm_gdrive_expiry');
    return !!token && !!expiry && Date.now() < parseInt(expiry);
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
