// google-drive.ts - Service de synchronisation Cloud via Google Drive API

const CLIENT_ID = "895428232613-4p8st94hs6boa7k2j7ft13dglikdhs0f.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;

  async init() {
    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => {
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error !== undefined) throw response;
            this.accessToken = response.access_token;
            localStorage.setItem('agregllm_gdrive_token', response.access_token);
            window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
          },
        });
        resolve();
      };
      document.body.appendChild(script);

      const gapiScript = document.createElement('script');
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = () => {
        (window as any).gapi.load('client', async () => {
          await (window as any).gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
          });
        });
      };
      document.body.appendChild(gapiScript);
    });
  }

  login() {
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('agregllm_gdrive_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken || !!localStorage.getItem('agregllm_gdrive_token');
  }

  private async getValidToken() {
    return this.accessToken || localStorage.getItem('agregllm_gdrive_token');
  }

  async syncToDrive(data: string) {
    const token = await this.getValidToken();
    if (!token) return;

    try {
      // 1. Chercher si le fichier existe déjà dans appDataFolder
      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { files } = await response.json();
      const existingFile = files.find((f: any) => f.name === 'agregllm_backup.json');

      const metadata = {
        name: 'agregllm_backup.json',
        parents: ['appDataFolder']
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([data], { type: 'application/json' }));

      if (existingFile) {
        // Mise à jour
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        // Création
        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }
      console.log("AgregLLM: Sync to Drive successful");
    } catch (e) {
      console.error("AgregLLM: Sync to Drive failed", e);
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
      const existingFile = files.find((f: any) => f.name === 'agregllm_backup.json');

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
