# Connexion Cloud Automatique — Design

## Problème

Actuellement l'utilisateur doit cliquer sur "Se connecter" dans les paramètres pour lier son compte Google, même s'il est déjà connecté à Google dans son navigateur et a déjà autorisé AgregLLM.

## Solution

Ajouter une tentative silencieuse d'obtention du token OAuth au chargement de l'application, via `requestAccessToken({ prompt: 'none' })` de Google Identity Services. Si l'utilisateur a une session Google active et a déjà autorisé l'application, un token est retourné sans popup. Sinon, l'échec est silencieux et le bouton "Se connecter" reste affiché.

## Changements

### `webapp/src/lib/google-drive.ts`
- Nouveau champ `silentAuthResolver: ((value: boolean) => void) | null`
- Dans le `callback` du token client : résoudre `silentAuthResolver` avec `true` (succès) ou `false` (erreur)
- Nouvelle méthode `trySilentAuth(): Promise<boolean>` : appelle `requestAccessToken({ prompt: 'none' })`, retourne `true` si le token a été obtenu

### `webapp/src/App.tsx`
- Dans `initCloud()`, appeler `await gdrive.trySilentAuth()` avant le `if (gdrive.isAuthenticated())`

### `webapp/src/components/Settings.tsx`
- Dans le `useEffect` de montage, appeler `gdrive.trySilentAuth()` et mettre à jour `userInfo` si succès
