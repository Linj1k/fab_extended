
function initStorage() {
    chrome.storage.sync.get(['favorites'], function(result) {
        console.log('Favorites currently is ' + result.favorites);
        if (!result.favorites) {
            var favorites = JSON.stringify(getFavorites());
            chrome.storage.sync.set({favorites: favorites}, function() {
                console.log('Favorites is set to ' + favorites);
            });
        } else {
            localStorage.setItem('favorites', result.favorites || JSON.stringify([]));
        }
    });
}
function updateStorage() {
    var favorites = localStorage.getItem('favorites');
    chrome.storage.sync.set({favorites: favorites}, function() {
        console.log('Favorites is set to ' + favorites);
    });
}
function clearStorage() {
    chrome.storage.sync.clear(function() {
        console.log('Storage cleared');
    });
}
initStorage();

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}
function saveFavorite(url,notify) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!isInFavorite(url)) {
        var category = "";
        var breadcrumb = document.getElementsByClassName("fabkit-Breadcrumb-root")[0];
        for (var i = 0; i < breadcrumb.children[0].children.length; i++) {
            if (breadcrumb.children[0].children[i].classList.contains("fabkit-Breadcrumb-separator")) continue;

            category += breadcrumb.children[0].children[i].innerText;
            if (i < breadcrumb.children[0].children.length - 1) {
                category += " > ";
            }
        }

        favorites.push({
            id: url.split('/').pop(),
            url: url,
            title: document.title.replace(" | Fab", ""),
            category: category,
            image:  document.getElementsByClassName("fabkit-Thumbnail-root fabkit-Thumbnail--16/9 fabkit-scale--radius-4")[0].children[0].src,
        });

        console.log(favorites);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        updateHeartButton()
        updateStorage()
    }
}
function removeFavorite(url,notify) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (isInFavorite(url)) {
        var index = favorites.indexOf(url);
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        updateStorage()
        updateHeartButton()
    }
}
function isInFavorite(url) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(function(favorite) {
        return favorite.url === url;
    });
}
function updateHeartButton() {
    var heartButton = document.getElementById('product-heartButton');
    if (!heartButton) return;
    var url = window.location.href;

    if (isInFavorite(url)) {
        heartButton.style.color = 'red';
    } else {
        heartButton.style.color = 'inherit';
    }
}