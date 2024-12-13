function initSettings() {
    fabext_Log('initSettings');
    chrome.storage.sync.get(['settings'], function(result) {
        var settings = JSON.parse(result.settings) || [];
        localStorage.setItem('fabext_settings', JSON.stringify(settings));
        fabext_Log('Settings currently is ', settings);
    });
}
initSettings();

function getSettings() {
    return JSON.parse(localStorage.getItem('fabext_settings')) || [];
}
function getSetting(type,defaultVal) {
    var settings = getSettings();
    if (settings[type] !== undefined) {
        return settings[type];
    }
    return defaultVal;
}