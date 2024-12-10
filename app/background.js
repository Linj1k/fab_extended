console.log('Background script loaded');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'open-favorites') {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/page.html') });
    }
});