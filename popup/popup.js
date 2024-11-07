chrome.storage.sync.get('favorites', function(data) {
    console.log(data);
    var favorites = JSON.parse(data.favorites) || [];

    var favAmount = document.getElementById('fav-amount');
    favAmount.textContent = favorites.length;

    var favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';
    favorites.forEach(function(favorite) {
        const card = document.createElement('a');
        card.href = favorite.url;
        card.target = '_blank';
        card.classList.add('card', 'shadow-sm', 'p-2', 'mb-1', 'text-decoration-none');

        const cardRow = document.createElement('div');
        cardRow.classList.add('d-flex', 'align-items-center');

        // Créer l'image
        const img = document.createElement('img');
        img.src = favorite.image;
        img.classList.add('img-fluid', 'rounded-start');
        img.style.maxWidth = '100px';
        img.alt = favorite.title;
        cardRow.appendChild(img);

        // Créer la section de texte
        const textContainer = document.createElement('div');
        textContainer.classList.add('ms-3', 'flex-grow-1');

        // Ajouter le titre
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('mb-2');
        cardTitle.textContent = favorite.title;

        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-secondary', 'ms-1', 'p-0');

        const icon = document.createElement('img');
        icon.src = 'trash.svg';
        icon.alt = 'Remove from favorites';
        icon.style.width = '1rem';
        icon.style.height = '1rem';
        button.appendChild(icon);

        cardTitle.appendChild(button);

        textContainer.appendChild(cardTitle);

        // Ajouter la description
        const cardText = document.createElement('p');
        cardText.classList.add('text-muted', 'mt-2', 'mb-0');
        cardText.textContent = favorite.category;
        textContainer.appendChild(cardText);

        // Ajouter le conteneur de texte à la ligne
        cardRow.appendChild(textContainer);

        // Ajouter la ligne à la carte
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