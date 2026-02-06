// Browser API polyfill for Chrome/Firefox compatibility
if (typeof browser === 'undefined') {
  globalThis.browser = chrome;
}

console.log('Background script loaded');
const defaultSettings = {
  "Index_CoverBackground": true,
  "Product_AutoSelectLicense": 'personal',
  "Product_DescriptionLogoLink": true,
  "Product_VideoPlayer": true,
  "Product_MaxVideos": 0,
  "Product_VideoPlayer_Order": "first",
  "Product_TechnicalDetails": false,
  "Product_SellerDetails": true,
  "Product_CoverBackground": 'product',
  "Thumbnail_AddToCart": false,
  "Thumbnail_AutoClaimFree": "claim",
  "Seller_CoverBackground": true,
  "Favorites_State": true,
};

browser.runtime.onInstalled.addListener(function() {
  browser.storage.sync.get(['settings'], function(data) {
    if (!data.settings) {
      browser.storage.sync.set({ settings: JSON.stringify(defaultSettings) });
    } else {
      const settings = JSON.parse(data.settings);
      const newSettings = { ...defaultSettings, ...settings };
      browser.storage.sync.set({ settings: JSON.stringify(newSettings) });
    }
  });
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'open-favorites') {
      browser.tabs.create({ url: browser.runtime.getURL('popup/favorites/page.html') });
    } else if (request.action === 'open-settings') {
      browser.tabs.create({ url: browser.runtime.getURL('popup/settings/page.html') });
    } else if (request.action === 'reset-settings') {
      browser.storage.sync.set({ settings: JSON.stringify(defaultSettings) });
      sendResponse({ settings: JSON.stringify(defaultSettings) });
    }
});