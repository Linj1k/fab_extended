var settings = [];

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['settings'], function(data) {
        settings = data.settings ? JSON.parse(data.settings || []) : [];
        console.log('settings', data, settings);

        const settingsElements = document.querySelectorAll('[data-setting]');
        settingsElements.forEach((setting) => {
            const key = setting.id;
            const value = settings[key];
            console.log('setting', key, value);

            if (setting.type === 'checkbox') {
                setting.checked = value;
            } else {
                setting.value = value;
            }

            setting.addEventListener('change', function() {
                settings[key] = setting.type === 'checkbox' ? setting.checked : setting.value;
                chrome.storage.sync.set({ settings: JSON.stringify(settings) });
            });
        });
    });
});