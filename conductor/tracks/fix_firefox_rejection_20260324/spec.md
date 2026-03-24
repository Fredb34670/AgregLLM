# Specification - Firefox Extension Rejection Fixes

## Overview
This track aims to resolve the rejections encountered when submitting the AgregLLM extension to the Firefox Add-on Developer portal. The primary issues identified are JavaScript syntax errors and incorrect file inclusion in the submission package.

## Functional Requirements
- **FR1: Clean Submission Package**: The `firefox-submission/` directory must not contain any test files (`*.test.js`).
- **FR2: Valid JavaScript**: All JavaScript files in the submission package must be valid JavaScript compatible with the targeted Firefox manifest version.
- **FR3: Manifest Optimization**: The `manifest.json` in `firefox-submission/` should be cleaned up of non-standard or problematic fields.

## Non-Functional Requirements
- **NFR1: Compliance**: The extension must pass the automatic validation of the Firefox Add-on Developer portal.

## Acceptance Criteria
1. No `*.test.js` files are present in the `firefox-submission/` directory (including subdirectories).
2. The `manifest.json` in `firefox-submission/` uses standard fields and has a valid `manifest_version`.
3. The "Unexpected token as" error is resolved.
4. The "'import' and 'export' may appear only with 'sourceType: module'" error is resolved.

## Out of Scope
- Migrating the Firefox extension to Manifest V3 (unless required to fix rejections).
- Functional changes to the extension logic.
