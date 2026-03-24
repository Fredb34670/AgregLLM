# Specification - Fix Firefox Addon Submission Errors

## Overview
The AgregLLM extension is being rejected by the Firefox Add-on Developer portal due to JavaScript syntax errors in files that should not be included in the final package (specifically test files). This track focuses on cleaning up the submission package to ensure it contains only valid, necessary code.

## Functional Requirements
- **FR1: Exclude Test Files**: All files matching `*.test.js` must be excluded from the `firefox-submission/` directory and any final archive.
- **FR2: Valid Script Validation**: Ensure all scripts included in the `firefox-submission/` directory are valid JavaScript according to the Manifest V2 standard used for Firefox.
- **FR3: Clean Submission Package**: The submission process must generate a clean package that passes Firefox's automatic validation.

## Non-Functional Requirements
- **NFR1: Compliance**: The extension must pass the automatic validation of the Firefox Add-on Developer portal.

## Acceptance Criteria
1. The `scripts/sync.test.js` and other `*.test.js` files are NOT present in the `firefox-submission/` directory.
2. The `firefox-submission/` directory contains only valid JavaScript files compatible with the targeted Firefox environment.
3. The extension passes the "Manual Upload" validation on the Firefox Add-on Developer portal.

## Out of Scope
- Migrating the Firefox extension to Manifest V3 (unless required to fix rejections).
- Functional changes to the extension logic.
