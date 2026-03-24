# Implementation Plan - Fix Firefox Addon Validation Errors

## Phase 1: Investigation and Test-Driven Cleanup
- [ ] Task: Create a test to verify the absence of test files in the submission package.
- [ ] Task: Ensure `firefox-submission/` is absolutely clean.
- [ ] Task: Fix the build script `build-extension.ps1` to prevent future inclusion.

## Phase 2: Manifest Optimization
- [ ] Task: Correct `manifest.json` in `firefox-submission/`.
- [ ] Task: Verify manifest validity with a local tool.

## Phase 3: Final Verification and Checkpointing
- [ ] Task: Conductor - User Manual Verification 'Cleanup and Manifest Fixes' (Protocol in workflow.md)
- [ ] Task: Provide the user with the final clean ZIP for manual upload.
