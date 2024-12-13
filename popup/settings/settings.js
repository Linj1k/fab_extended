var settings = [];

const loadSettings = () => {
    const settingsElements = document.querySelectorAll('[data-setting]');
    settingsElements.forEach((setting) => {
        const key = setting.id;
        const value = settings[key];

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
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['settings'], function(data) {
        settings = data.settings ? JSON.parse(data.settings || []) : [];
        console.log('settings', settings);
        loadSettings();

        document.getElementById('reset').addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all settings?')) {
                chrome.runtime.sendMessage({action: 'reset-settings'}, function(response) {
                    settings = JSON.parse(response.settings);
                    loadSettings();
                });
            }
        })
    });
});