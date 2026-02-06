/**
 * Browser API Polyfill for Chrome/Firefox compatibility
 * Firefox natively supports the 'browser' namespace with Promises
 * Chrome uses 'chrome' namespace, so we create an alias
 */

// Create a cross-browser API namespace
if (typeof browser === 'undefined') {
  // Chrome/Edge - create browser alias to chrome
  globalThis.browser = chrome;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = browser;
}
