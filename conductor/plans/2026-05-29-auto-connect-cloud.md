# Connexion Cloud Automatique — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connecter automatiquement l'utilisateur à Google Drive au chargement s'il a déjà autorisé l'application.

**Architecture:** Ajouter une méthode `trySilentAuth()` à `GoogleDriveService` qui appelle `requestAccessToken({ prompt: 'none' })` de GIS (Google Identity Services). Si l'utilisateur a une session Google active et a déjà autorisé l'app, le token est obtenu sans popup. Appeler cette méthode au démarrage depuis `App.tsx` et `Settings.tsx`.

**Tech Stack:** Google Identity Services (GIS), TypeScript, React 18

---

### Task 1: Ajouter `trySilentAuth()` à `google-drive.ts`

**Files:**
- Modify: `webapp/src/lib/google-drive.ts`

- [ ] **Step 1: Ajouter le champ `silentAuthResolver` et modifier le callback du token client**

```typescript
// Après la ligne 7: private initPromise: Promise<void> | null = null;
private silentAuthResolver: ((value: boolean) => void) | null = null;
```

Dans la méthode `setupTokenClient()` (lignes 36-59), modifier le callback pour résoudre la promesse :

```typescript
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
          this.silentAuthResolver?.(false);
          this.silentAuthResolver = null;
          return;
        }

        const expiry = Date.now() + (response.expires_in * 1000);

        localStorage.setItem('agregllm_gdrive_token', response.access_token);
        localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());

        this.silentAuthResolver?.(true);
        this.silentAuthResolver = null;

        window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
      },
    });
  }
```

- [ ] **Step 2: Ajouter la méthode `trySilentAuth()`**

Ajouter après la méthode `login()` (après ligne 68) :

```typescript
  async trySilentAuth(): Promise<boolean> {
    if (!this.tokenClient) {
      await this.init();
      if (!this.tokenClient) return false;
    }

    if (this.isAuthenticated()) return true;

    return new Promise((resolve) => {
      this.silentAuthResolver = resolve;
      try {
        this.tokenClient!.requestAccessToken({ prompt: 'none' });
      } catch {
        this.silentAuthResolver = null;
        resolve(false);
      }
    });
  }
```

- [ ] **Step 3: Vérifier que le fichier est syntaxiquement correct**

Run: `cd webapp && npx tsc --noEmit src/lib/google-drive.ts`
Expected: No errors

---

### Task 2: Appeler `trySilentAuth()` dans `App.tsx`

**Files:**
- Modify: `webapp/src/App.tsx`

- [ ] **Step 1: Modifier `initCloud()` pour tenter l'auth silencieuse avant le `isAuthenticated()`**

Remplacer le bloc `initCloud` (lignes 153-169) :

```typescript
    const initCloud = async () => {
      try {
        await gdrive.init();
        await gdrive.trySilentAuth(); // Nouvelle ligne
        if (gdrive.isAuthenticated()) {
          console.log("AgregLLM: Cloud connected, starting background sync...");
          const cloudData = await gdrive.loadFromDrive();
          if (cloudData) {
            storage.importData(cloudData);
            // Déclencher un événement pour rafraichir l'UI
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch (e) {
        console.error("AgregLLM: GDrive init failed", e);
      }
    };
```

- [ ] **Step 2: Build check**

Run: `cd webapp && npx tsc --noEmit`
Expected: No type errors

---

### Task 3: Appeler `trySilentAuth()` dans `Settings.tsx`

**Files:**
- Modify: `webapp/src/components/Settings.tsx`

- [ ] **Step 1: Essayer l'auth silencieuse dans le `useEffect` de montage**

Modifier le `useEffect` des lignes 22-49 pour appeler `trySilentAuth()` avant la vérification :

```typescript
  useEffect(() => {
    gdrive.init();

    // Tentative de connexion silencieuse au chargement
    gdrive.trySilentAuth().then((success) => {
      if (success) {
        gdrive.getUserInfo().then(setUserInfo);
      } else if (gdrive.isAuthenticated()) {
        gdrive.getUserInfo().then(setUserInfo);
      }
    });

    // Écouter l'événement de connexion réussie
    const handleAuthSuccess = async () => {
      if (gdrive.isAuthenticated()) {
        const info = await gdrive.getUserInfo();
        setUserInfo(info);
      } else {
        setUserInfo(null);
      }
    };

    window.addEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);

    // Force le rafraichissement toutes les secondes pour l'état du bouton
    const interval = setInterval(() => setTick(t => t + 1), 1000);

    return () => {
      window.removeEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
      clearInterval(interval);
    };
  }, []);
```

- [ ] **Step 2: Build check**

Run: `cd webapp && npx tsc --noEmit`
Expected: No type errors

---

### Task 4: Vérification finale

- [ ] **Step 1: Vérifier tests existants**

Run: `cd webapp && npm test`
Expected: All existing tests pass (aucun changement de comportement fonctionnel, les tests mockent localStorage et n'utilisent pas GIS)

- [ ] **Step 2: Lint**

Run: `cd webapp && npm run lint`
Expected: No warnings
