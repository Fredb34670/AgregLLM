# Implementation Plan - Firefox Extension Rejection Fixes

## Phase 1: Cleanup and Manifest Fixes
- [ ] Task: Remove all test files from `firefox-submission/`
    - [ ] Delete all files matching `*.test.js` in `firefox-submission/scripts/` and any other subdirectories.
- [ ] Task: Clean up `manifest.json` in `firefox-submission/`
    - [ ] Remove `data_collection_permissions` from `browser_specific_settings.gecko`.
    - [ ] Verify `strict_min_version` (140.0 seems very high, maybe lower it to a more reasonable version if needed, or keep it if intentional).
    - [ ] Ensure `permissions` and `content_scripts` match the required functionality without being overly broad.

## Phase 2: Syntax Verification
- [ ] Task: Verify no ESM/TS syntax in `firefox-submission/`
    - [ ] Check all `.js` files for `import`, `export`, or `as ` (TS type cast) statements.
    - [ ] If found, refactor to valid ES5/ES6 script syntax (e.g., using `browser.runtime.onMessage` instead of exports, or removing the statements if they were only for tests).

## Phase 3: Validation and Re-build (Optional)
- [ ] Task: Run a local validation (if any tool is available) or prepare for re-submission.
- [ ] Task: Conductor - User Manual Verification 'Cleanup and Manifest Fixes' (Protocol in workflow.md)
