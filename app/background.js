console.log('Background script loaded');
const defaultSettings = {
  "Product_AutoSelectLicense": 'personal',
  "Product_DescriptionLogoLink": true,
  "Product_VideoPlayer": true,
  "Product_TechnicalDetails": true,
  "Product_SellerDetails": true,
  "Thumbnail_AddToCart": true,
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
    }
});