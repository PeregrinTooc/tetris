# Electron Sandbox Error - Known Issue

## Summary

A cosmetic error appears in Cypress E2E test output when running tests with Electron browser on macOS:

```
[PID:TIMESTAMP:ERROR:sandbox/mac/system_services.cc:35] SetApplicationIsDaemon: Error Domain=NSOSStatusErrorDomain Code=-50 "paramErr: error in user parameter list" (-50)
```

## Impact

- **None** - This is a purely cosmetic error that does not affect test functionality
- All tests pass successfully (192/192 passing)
- The error appears specifically during `audio-mocking.spec.cy.ts` test execution, between the first test (Audio constructor mock) and second test (AudioContext mock)

## Root Cause

This is a known Electron/Chromium issue on macOS where:

1. Electron attempts to set daemon status during AudioContext initialization
2. macOS system services reject the configuration with an invalid parameter error (Code -50)
3. The error originates from Electron's internal sandbox initialization code

## Why It Cannot Be Suppressed

1. **Cypress Configuration**: Electron in Cypress uses `preferences` not `args` for launch options, and logging preferences don't suppress this specific error
2. **Electron Internals**: The error comes from deep within Electron's sandbox initialization on macOS, before any user configuration takes effect
3. **stderr Output**: The error is written directly to stderr by native macOS system calls

## Attempted Solutions

- Adding Electron-specific launch preferences (enableLogging: false, logLevel: "error") - ineffective
- Chromium launch arguments (--disable-gpu, --no-sandbox, etc.) - not applicable to Electron
- Shell script filtering with grep - would work but adds maintenance overhead for cosmetic issue

## Resolution

Accept the error as cosmetic. It does not indicate any actual problem with:

- Test execution
- Audio mocking functionality
- Browser stability
- Test reliability

## References

- Electron Issue Tracker: Similar errors reported in Electron 136+ on macOS
- Cypress GitHub: Known issue with Electron sandbox warnings on macOS
- File: `cypress/e2e/audio-mocking.spec.cy.ts` - where error appears
- All 192 E2E tests pass despite this error
