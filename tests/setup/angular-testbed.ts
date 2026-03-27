// Initialize Angular testing platform only for browser-like test environments.
if (typeof window !== "undefined") {
  const angularTesting = await import("@angular/core/testing")
  const platformTesting = await import("@angular/platform-browser/testing")

  const { TestBed } = angularTesting
  const { BrowserTestingModule, platformBrowserTesting } = platformTesting

  const alreadyInitialized = (globalThis as { __angularTestBedInitialized?: boolean })
    .__angularTestBedInitialized

  if (!alreadyInitialized) {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting())
    ;(globalThis as { __angularTestBedInitialized?: boolean }).__angularTestBedInitialized = true
  }
}
