
function initStorage() {
    chrome.storage.sync.get(['favorites'], function(result) {
        if (!result.favorites) {
            var favorites = getFavorites();
            fabext_Log('Favorites currently is ', result.favorites);
            chrome.storage.sync.set({favorites: JSON.stringify(favorites)}, function() {
                fabext_Log('Favorites is set to ', favorites);
            });
        } else {
            // check if favorite have created_at field or not and add if not
            var favorites = JSON.parse(result.favorites) || [];
            if (favorites.length > 0) {
                favorites = favorites.map(function(favorite) {
                    if (!favorite.created_at) {
                        favorite.created_at = new Date().toISOString();
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
    chrome.storage.sync.set({favorites: favorites}, function() {
        fabext_Log('Favorites is set to ' + favorites);
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
function saveFavorite(heartButton,url,notify) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!isInFavorite(url)) {
        favorites.push({
            id: url.split('/').pop(),
            url: url,
            title: heartButton.dataset.title,
            category: heartButton.dataset.category,
            image: heartButton.dataset.image,
            created_at: new Date().toISOString()
        });

        fabext_Log(favorites);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        updateStorage()
    }
}
function removeFavorite(url,notify) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (isInFavorite(url)) {
        var index = favorites.findIndex(function(favorite) {
            return favorite.url === url;
        });
        console.log(url, index);
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        updateStorage()
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

    if (isInFavorite(url)) {
        heartButton.style.color = 'red';
        heartButton.innerHTML = fabext_getIcon('heart-filled', md ? 'md' : 'xs');
    } else {
        heartButton.style.color = 'inherit';
        heartButton.innerHTML = fabext_getIcon('heart', md ? 'md' : 'xs');
    }
}