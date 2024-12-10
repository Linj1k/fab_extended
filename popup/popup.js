var searchTimeout = null;
document.addEventListener('DOMContentLoaded', function() {
    const favoritesList = document.getElementById('favorites-list');

    // Add event listener to the "Open Favorites" button
    const openInNewTab = document.getElementById('openInNewTab');
    if (openInNewTab) {
        openInNewTab.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: 'open-favorites'});
        });
    }

    // Get the favorites from the storage
    chrome.storage.sync.get('favorites', function(data) {
        // Get the favorites from the storage
        var favorites = JSON.parse(data.favorites) || [];
    
        // Update the amount of favorites
        var favAmount = document.getElementById('fav-amount');
        favAmount.textContent = favorites.length;
    
        // Update the favorites list
        var favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = '';
    
        favorites.sort(function(a, b) {
            return new Date(b.created_at) - new Date(a.created_at);
        });
    
        favorites.forEach(function(favorite) {
            const card = document.createElement('a');
            var url = favorite.url;
    
            card.href = url;
            card.target = '_blank';
            card.classList.add('card', 'shadow-sm', 'p-2', 'mb-1', 'text-decoration-none');
    
            const cardRow = document.createElement('div');
            cardRow.classList.add('d-flex', 'align-items-center');
    
            const img = document.createElement('img');
            img.id = "favorite-image";
            img.src = favorite.image;
            img.classList.add('img-fluid', 'rounded-start', "favorite-image");
            img.style.maxWidth = '100px';
            img.alt = favorite.title;
            cardRow.appendChild(img);
    
            const textContainer = document.createElement('div');
            textContainer.classList.add('ms-2', 'flex-grow-1');
    
            const cardHeader = document.createElement('div');
            cardHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center');
    
            const cardTitle = document.createElement('h5');
            cardTitle.id = "favorite-title";
            cardTitle.classList.add('mb-1', "fs-7");
            cardTitle.textContent = favorite.title;
    
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-secondary', 'ms-1', 'p-0');
    
            const icon = document.createElement('img');
            icon.src = 'trash.svg';
            icon.alt = 'Remove from favorites';
            icon.style.width = '1rem';
            icon.style.height = '1rem';
            button.appendChild(icon);
    
            cardHeader.appendChild(cardTitle);
            cardHeader.appendChild(button);
    
            textContainer.appendChild(cardHeader);
    
            const cardText = document.createElement('p');
            cardText.id = "favorite-category";
            cardText.classList.add('text-muted', 'mt-0', 'mb-0', 'fs-8');
            cardText.textContent = favorite.category;
            textContainer.appendChild(cardText);
    
            const cardCreatedAt = document.createElement('p');
            cardCreatedAt.id = "favorite-created-at";
            cardCreatedAt.classList.add('text-muted', 'mt-0', 'mb-0', 'fs-9');
            cardCreatedAt.textContent = "Favorited on: "+(new Date(favorite.created_at).toLocaleString());
            textContainer.appendChild(cardCreatedAt);
    
            cardRow.appendChild(textContainer);
    
            card.appendChild(cardRow);
    
            favoritesList.appendChild(card);
    
            button.addEventListener('click', function(e) {
                e.preventDefault()
                favorites = favorites.filter(function(fav) {
                    return fav.id !== favorite.id;
                });
                chrome.storage.sync.set({favorites: JSON.stringify(favorites)}, function() {
                    console.log('Favorites is set to ' + JSON.stringify(favorites));
                });
                favAmount.textContent = favorites.length;
                card.remove();
            });
        });
    });

    const search = async (query) => {
        const filter = query.toUpperCase();

        const favorites = favoritesList.getElementsByTagName('a');
        for (let i = 0; i < favorites.length; i++) {
            const favorite = favorites[i];
            
            // search in all text content of the favorite
            const title = favorite.querySelector('#favorite-title').textContent;
            const category = favorite.querySelector('#favorite-category').textContent;
            const date = favorite.querySelector('#favorite-created-at').textContent;
            const text = (`${title} ${category} ${date}`).toUpperCase();

            if (text.indexOf(filter) > -1) {
                favorite.style.display = 'block';
            } else {
                favorite.style.display = 'none';
            }
        }
    };

    const searchBar = document.getElementById('search-input');
    searchBar.addEventListener('input', function() {
        // add a delay before searching to avoid searching on every key press
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            search(searchBar.value);
        }, 300);
    });
});