console.log('Background script loaded');
const defaultSettings = {
  "Product_AutoSelectLicense": 'personal',
  "Product_DescriptionLogoLink": true,
  "Product_VideoPlayer": true,
  "Product_MaxVideos": 0,
  "Product_VideoPlayer_Order": "first",
  "Product_TechnicalDetails": true,
  "Product_SellerDetails": true,
  "Product_CoverBackground": 'product',
  "Thumbnail_AddToCart": true,
  "Thumbnail_AutoClaimFree": "cart",
  "Seller_CoverBackground": true,
};

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(['settings'], function(data) {
    if (!data.settings) {
      chrome.storage.sync.set({ settings: JSON.stringify(defaultSettings) });
    } else {
      const settings = JSON.parse(data.settings);
      const newSettings = { ...defaultSettings, ...settings };
      chrome.storage.sync.set({ settings: JSON.stringify(newSettings) });
    }
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'open-favorites') {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/favorites/page.html') });
    } else if (request.action === 'open-settings') {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/settings/page.html') });
    } else if (request.action === 'reset-settings') {
      chrome.storage.sync.set({ settings: JSON.stringify(defaultSettings) });
      sendResponse({ settings: JSON.stringify(defaultSettings) });
    }
});