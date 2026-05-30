# AgregLLM — Agent guidance

## Project structure

```
webapp/          React + TypeScript app (Vite, Tailwind, Shadcn UI)
extension/       Vanilla JS browser extension (MV2 Firefox, MV3 Chrome)
firefox-submission/  Static snapshot of extension source (for AMO)
conductor/       Project management docs, archived track specs/plans
```

Two independent entrypoints:
- **Webapp** (`webapp/src/main.tsx`) — GitHub Pages SPA, `BrowserRouter` with dynamic basename (`/AgregLLM` on prod, `/` on localhost)
- **Extension** (`extension/background.js` + `extension/scripts/content.js`) — content script detects LLM pages, background handles badge/context-menu

## Build order (required)

```powershell
cd webapp
npm install
npm run build           # tsc && vite build → webapp/dist/
cd ..
.\build-extension.ps1  # copies extension/ + webapp/dist/assets/ → dist-extensions/{firefox,chrome}/
```

Or all-in-one: `.\build-all.ps1` (builds webapp twice — local + GitHub Pages — then extensions).

## Key dev commands (run from `webapp/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm test` | Vitest (includes `../extension/**/*.test.{js,ts}`) |
| `npm run lint` | ESLint, zero-warnings policy |
| `npm run build:github` | `cross-env GITHUB_PAGES=true npm run build` |

## Architecture notes

- **Local-first data**: `@/lib/storage.ts` — conversations + folders in `localStorage`, with dynamic `import('./google-drive')` for auto-sync after every mutation.
- **Cloud sync**: Google Drive OAuth via GIS (`https://accounts.google.com/gsi/client`), stores data in `appDataFolder`.
- **Extension ↔ Webapp sync**: `extension/scripts/sync.js` injected on the webapp origin, copies `browser.storage.local` → `localStorage`. Triggers `agregllm-sync` custom event.
- **Extension is pure JS** (no transpilation, no bundling). Webapp is TypeScript + React, bundled by Vite.
- **Path alias**: `@/` → `webapp/src/`. Shadcn UI components in `@/components/ui/`.

## Testing quirks

- Vitest config in `vite.config.ts`: `jsdom` environment, includes `../extension/**/*.{test,spec}.{js,ts}` in addition to webapp tests.
- `setupTests.ts` mocks `localStorage` and `window.matchMedia` (required by Radix/Shadcn).
- `storage.test.ts` and related test files use the mock localStorage.

## Conventions

- All comments and commit messages in **French**.
- Prefer `const`/`let`, named exports, semicolons, single quotes.
- TypeScript `strict: true`, `noUnusedLocals`, `noUnusedParameters`.
- CI uses `gemini-dispatch.yml` for @gemini-cli commands on issues/PRs.

## CI/CD

- `deploy.yml` — builds webapp on push to `main` (paths: `webapp/**`, `docs/**`, `.github/workflows/deploy.yml`) and deploys to `gh-pages` branch.
- Extension is **not** CI-deployed; built locally with `build-extension.ps1`/`.sh` then manually submitted to stores.
