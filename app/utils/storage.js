
function initStorage() {
    chrome.storage.sync.get(['favorites', 'folders'], function(result) {
        // Initialize folders if not exists
        if (!result.folders) {
            var defaultFolders = [];
            chrome.storage.sync.set({folders: JSON.stringify(defaultFolders)}, function() {
                fabext_Log('Folders initialized to ', defaultFolders);
            });
            localStorage.setItem('folders', JSON.stringify(defaultFolders));
        } else {
            localStorage.setItem('folders', result.folders);
            fabext_Log('Folders currently is ', JSON.parse(result.folders));
        }

        // Initialize favorites
        if (!result.favorites) {
            var favorites = getFavorites();
            fabext_Log('Favorites currently is ', result.favorites);
            chrome.storage.sync.set({favorites: JSON.stringify(favorites)}, function() {
                fabext_Log('Favorites is set to ', favorites);
            });
        } else {
            // check if favorite have created_at field or not and add if not
            // also migrate favorites without folder field (retrocompatibility)
            var favorites = JSON.parse(result.favorites) || [];
            if (favorites.length > 0) {
                favorites = favorites.map(function(favorite) {
                    if (!favorite.created_at) {
                        favorite.created_at = new Date().toISOString();
                    }
                    // Add folder field for retrocompatibility (null = uncategorized/root)
                    if (!favorite.hasOwnProperty('folder')) {
                        favorite.folder = null;
                    }
                    return favorite;
                });
            }

            localStorage.setItem('favorites', JSON.stringify(favorites));
            fabext_Log('Favorites currently is ', favorites);
        }
    });
}
function updateStorage() {
    var favorites = localStorage.getItem('favorites');
    var folders = localStorage.getItem('folders');
    
    chrome.storage.sync.set({
        favorites: favorites,
        folders: folders
    }, function() {
        fabext_Log('Favorites is set to ' + favorites);
        fabext_Log('Folders is set to ' + folders);
    });

    var popup = document.querySelector('#favorite-popup');
    if (popup) {
        popup.load()
    }
    updateHeartButton(document.getElementById('product-heartButton'), window.location.href, true)
}
function clearStorage() {
    chrome.storage.sync.clear(function() {
        fabext_Log('Storage cleared');
    });
    updateHeartButton(document.getElementById('product-heartButton'), window.location.href, true)
}
initStorage();

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}
function saveFavorite(heartButton,url,notify,folderId = null) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!isInFavorite(url)) {
        favorites.push({
            id: url.split('/').pop(),
            url: url,
            title: heartButton.dataset.title,
            category: heartButton.dataset.category,
            image: heartButton.dataset.image,
            created_at: new Date().toISOString(),
            folder: folderId  // null = uncategorized/root folder
        });

        fabext_Log(favorites);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        updateStorage()
        const favoriteBagde = document.getElementById('favorite-badge');
        if (favoriteBagde) {
            favoriteBagde.innerHTML = favorites.length;
        }
    }
}
function removeFavorite(url,notify) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (isInFavorite(url)) {
        var index = favorites.findIndex(function(favorite) {
            return favorite && favorite.url === url;
        });
        fabext_Log(url, index);
        if (index !== -1) {
            favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));

        updateStorage()

        
        const favoriteBagde = document.getElementById('favorite-badge');
        if (favoriteBagde) {
            favoriteBagde.innerHTML = favorites.length;
        }
    }
}
function isInFavorite(url) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(function(favorite) {
        return favorite.url === url;
    });
}
function updateHeartButton(heartButton,url,md = false) {
    if (!heartButton || !url) return;
    let span = heartButton.querySelector('span');
    if (!span) return;

    if (isInFavorite(url)) {
        span.style.color = 'red';
        span.innerHTML = fabext_getIcon('heart-filled', md ? 'md' : 'sm');
    } else {
        span.style.color = 'inherit';
        span.innerHTML = fabext_getIcon('heart', md ? 'md' : 'sm');
    }
}

// ========== FOLDER MANAGEMENT FUNCTIONS ==========

function getFolders() {
    return JSON.parse(localStorage.getItem('folders')) || [];
}

function createFolder(name, color = '#8B5CF6') {
    var folders = getFolders();
    var newFolder = {
        id: Date.now().toString(),
        name: name,
        color: color,
        created_at: new Date().toISOString()
    };
    folders.push(newFolder);
    localStorage.setItem('folders', JSON.stringify(folders));
    updateStorage();
    return newFolder;
}

function updateFolder(folderId, name, color) {
    var folders = getFolders();
    var folderIndex = folders.findIndex(f => f != null && f.id === folderId);
    if (folderIndex !== -1) {
        if (name) folders[folderIndex].name = name;
        if (color) folders[folderIndex].color = color;
        localStorage.setItem('folders', JSON.stringify(folders));
        updateStorage();
        return folders[folderIndex];
    }
    return null;
}

function deleteFolder(folderId) {
    var folders = getFolders();
    var favorites = getFavorites();
    
    // Move all favorites from this folder to uncategorized (null)
    favorites = favorites.map(function(favorite) {
        if (favorite.folder === folderId) {
            favorite.folder = null;
        }
        return favorite;
    });
    
    // Remove the folder (filter out null/undefined folders too)
    folders = folders.filter(f => f != null && f.id !== folderId);
    
    localStorage.setItem('folders', JSON.stringify(folders));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateStorage();
}

function moveFavoriteToFolder(favoriteUrl, folderId) {
    var favorites = getFavorites();
    var favoriteIndex = favorites.findIndex(f => f != null && f.url === favoriteUrl);
    if (favoriteIndex !== -1) {
        favorites[favoriteIndex].folder = folderId;
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateStorage();
        return favorites[favoriteIndex];
    }
    return null;
}

function getFavoritesByFolder(folderId) {
    var favorites = getFavorites();
    return favorites.filter(f => f != null && f.folder === folderId);
}