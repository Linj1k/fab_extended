function createFavoritePopup() {
    var popup = document.getElementById('favorite-popup')
    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = "favorite-popup";

    var headerDiv = document.createElement("div");
    headerDiv.classList.add("favorite-popup-header");
    popup.appendChild(headerDiv);

    var title = document.createElement("span");
    title.innerHTML = "Favorites";
    headerDiv.appendChild(title);

    var headerButtons = document.createElement("div");
    headerButtons.classList.add("favorite-popup-header-buttons");
    headerDiv.appendChild(headerButtons);

    // add button to open favorites in a new tab in rigth of the header
    var openButton = document.createElement("button");
    openButton.innerHTML = fabext_getIcon('link');
    openButton.title = "Open favorites in a new tab";
    openButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: 'open-favorites'});
    });
    headerButtons.appendChild(openButton);

    // Create the clear button in the header
    var clearButton = document.createElement("button");
    clearButton.innerHTML = fabext_getIcon('trash');
    clearButton.classList.add("favorite-popup-clear-button");
    clearButton.title = "Clear favorites";
    clearButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your favorites?')) {
            localStorage.setItem('favorites', JSON.stringify([]));
            updateStorage();
        }
    });
    headerButtons.appendChild(clearButton);

    var contentDiv = document.createElement("div");
    contentDiv.classList.add("favorite-popup-content");
    popup.appendChild(contentDiv);

    // Load function to load the favorites from localStorage
    popup.load = function() {
        contentDiv.innerHTML = "";
        var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        // sort favorites by created_at
        favorites.sort(function(a, b) {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        favorites.forEach(function(favorite) {
            var item = document.createElement("a");
            item.classList.add("favorite-popup-item")
            var url = favorite.url.split('https://www.fab.com')[2] || favorite.url;
            item.href = url;

            var removeButton = document.createElement("button");
            removeButton.innerHTML = fabext_getIcon('heart-filled');
            removeButton.style.color = 'red';
            removeButton.style.marginLeft = '5px';
            removeButton.style.marginRight = '5px';
            removeButton.title = "Remove from favorites";
            removeButton.dataset.url = favorite.url;
            removeButton.addEventListener('click', function(e) {
                e.preventDefault();
                removeFavorite(favorite.url,true);
                item.remove();
            });
            item.appendChild(removeButton);

            // Create the image div for the item
            var imageDiv = document.createElement("div");
            imageDiv.classList.add("favorite-popup-item-image","fabkit-Thumbnail-root","fabkit-Thumbnail--16/9","fabkit-scale--radius-2","Vq2qCiz2")

            var image = document.createElement("img");
            image.src = favorite.image;
            
            imageDiv.appendChild(image);
            item.appendChild(imageDiv);

            // Create the content div for the item
            var content = document.createElement("div");
            content.classList.add("favorite-popup-item-content");
            item.appendChild(content);
            
            // Create the header div for the item with the title and remove button
            var header = document.createElement("div");
            header.classList.add("favorite-popup-item-header");
            content.appendChild(header);

            // Create the title span in the header
            var title = document.createElement("span");
            title.innerHTML = favorite.title;
            header.appendChild(title);

            // Create the remove button in the header
            // var removeButton = document.createElement("button");
            // removeButton.innerHTML = fabext_getIcon('heart-filled');
            // removeButton.style.color = 'red';

            // removeButton.title = "Remove from favorites";
            // removeButton.dataset.url = favorite.url;
            // removeButton.addEventListener('click', function(e) {
            //     e.preventDefault();
            //     removeFavorite(favorite.url,true);
            //     item.remove();
            // });
            // header.appendChild(removeButton);

            // Create the category span
            var category = document.createElement("span");
            category.innerHTML = favorite.category;
            content.appendChild(category);

            var created_at = document.createElement("span");
            created_at.classList.add("favorite-popup-item-created_at");
            created_at.innerHTML = "Favorited on: "+(new Date(favorite.created_at).toLocaleString());
            content.appendChild(created_at);

            contentDiv.appendChild(item);
        });
    }
    popup.load()

    return popup;
}

function addFavoriteButtonToNavbar() {
    if (document.getElementById('favorite-button') === null) {
        var actions = document.querySelector('.fabkit-MegaMenu-actions');
        if (actions) {
            var favoriteButton = document.createElement("button");
            favoriteButton.innerHTML = fabext_getIcon('heart');
            favoriteButton.id = "favorite-button";
            favoriteButton.classList.add("fabkit-Button-root", "fabkit-Button--icon", "fabkit-Button--sm", "fabkit-Button--ghost", "fabkit-MegaMenu-iconButton");
            favoriteButton.type = "button";
            favoriteButton.setAttribute("aria-label", "Favorites");
            favoriteButton.title = "Favorites";
            
            var popup = createFavoritePopup()
            
            // Add event listener to the favoriteButton to show or hide the popup
            var hideTimeout;
            favoriteButton.addEventListener('mouseenter', function() {
                clearTimeout(hideTimeout);
                popup.style.display = 'block';
            });

            favoriteButton.addEventListener('mouseleave', function() {
                hideTimeout = setTimeout(function() {
                    popup.style.display = 'none';
                }, 100);
            });

            // Add event listener to the popup to show or hide the popup
            popup.addEventListener('mouseenter', function() {
                clearTimeout(hideTimeout);
                popup.style.display = 'block';
            });

            popup.addEventListener('mouseleave', function() {
                hideTimeout = setTimeout(function() {
                    popup.style.display = 'none';
                }, 100);
            });

            actions.insertBefore(favoriteButton, actions.firstChild);
            document.querySelector("body").appendChild(popup);
        }
    }
}

function addFavoriteButtonProduct() {
    if (document.getElementById('product-heartButton') === null) {
        var productTitle = document.querySelector('.fabkit-Stack-root.fabkit-Stack--align_start.fabkit-scale--gapX-layout-6.fabkit-scale--gapY-layout-6.fabkit-Stack--column > .fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-primary.fabkit-Heading--lg');
        if (productTitle) {
            var currentDiv = productTitle.parentNode;
            
            var heartButton = document.createElement("button");
            heartButton.innerHTML = fabext_getIcon('heart', 'xs');
            heartButton.id = "product-heartButton";
            heartButton.classList.add("fabkit-Button-root", "fabkit-Button--icon", "fabkit-Button--sm", "fabkit-Button--ghost", "fabkit-MegaMenu-iconButton");
            heartButton.type = "button";
            heartButton.setAttribute("aria-label", "Add to favorite");
            heartButton.title = "Add to favorite";
            heartButton.dataset.url = window.location.href;

            // Add data attributes to the heartButton
            var category = "";
            var breadcrumb = document.getElementsByClassName("fabkit-Breadcrumb-root")[0];
            for (var i = 0; i < breadcrumb.children[0].children.length; i++) {
                if (breadcrumb.children[0].children[i].classList.contains("fabkit-Breadcrumb-separator")) continue;

                category += breadcrumb.children[0].children[i].innerText;
                if (i < breadcrumb.children[0].children.length - 1) {
                    category += " > ";
                }
            }

            heartButton.dataset.category = category;
            heartButton.dataset.title = document.title.replace(" | Fab", "");
            heartButton.dataset.image = document.getElementsByClassName("fabkit-Thumbnail-root fabkit-Thumbnail--16/9 fabkit-scale--radius-4")[0].children[0].src;

            // Add event listener to the heartButton to add or remove favorite
            heartButton.addEventListener('click', function(e) {
                e.preventDefault();

                var currentUrl = window.location.href;
                if (isInFavorite(currentUrl)) {
                    removeFavorite(currentUrl,true);
                } else {
                    saveFavorite(heartButton,currentUrl,true);
                }
                updateHeartButton(heartButton, currentUrl,true);
            });

            var newDiv = document.createElement("div");
            newDiv.style.display = "flex";
            newDiv.appendChild(heartButton);
            newDiv.appendChild(productTitle);

            if (currentDiv.contains(productTitle)) {
                currentDiv.insertBefore(newDiv, productTitle);
            } else {
                currentDiv.appendChild(newDiv);
            }
            
            
            updateHeartButton(heartButton, window.location.href,true)
        }
    }
}

function addFavoriteButtonThumbnail(thumbnail) {
    if (thumbnail && thumbnail.querySelector('#thumbnail-heartButton') === null) {
        var parent = thumbnail.parentElement;
        var currentUrl = parent.querySelector('.fabkit-Thumbnail-overlay');
        if (!currentUrl) return;
        currentUrl = currentUrl.href;

        const categoryElement = parent.parentElement.querySelector('.fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-secondary.fabkit-Text--md.fabkit-Text--regular.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-scale--gapX-spacing-2.fabkit-scale--gapY-spacing-2');
        if (!categoryElement) return;
        
        var contentDiv = document.createElement("div");
        contentDiv.classList.add("fabkit-Stack-root", "fabkit-Stack--align_center", "fabkit-scale--gapX-spacing-2", "fabkit-scale--gapY-spacing-2");
        contentDiv.id = "thumbnail-heartButton";
        contentDiv.style.display = "flex";
        contentDiv.style.justifyContent = "end";

        var iconDiv = document.createElement("div");
        iconDiv.classList.add("fabkit-Badge-root", "fabkit-Badge--filled", "fabkit-Badge--gray", "fabkit-Badge--md", "fabkit-Badge--iconOnly", "fabkit-Badge--blurify", "Nj5DrLsA", "jfHwYlH0", "MoIH083o");

        var heartButton = document.createElement("button");
        var topRight = thumbnail.querySelector('.fabkit-Thumbnail-item.fabkit-Thumbnail--top-right')

        // Create topRight div if it doesn't exist
        if (topRight === null) {
            var topRight = document.createElement("div");
            topRight.classList.add("fabkit-Thumbnail-item", "fabkit-Thumbnail--top-right",  "q2jjQjlm", "YFuShsDk");
            thumbnail.appendChild(topRight);
        } else {
            contentDiv.classList.add("fabkit-Thumbnail-heartButton")
        }

        heartButton.style.display = "flex";
        heartButton.type = "button";
        heartButton.innerHTML = fabext_getIcon('heart', 'xs');
        heartButton.setAttribute("aria-label", "Add to favorite");
        heartButton.title = "Add to favorite";

        // Add data attributes to the heartButton
        heartButton.dataset.category = categoryElement.innerText;
        heartButton.dataset.category = heartButton.dataset.category.split('\n').pop();
        heartButton.dataset.title = parent.parentElement.querySelector('.fabkit-Typography-ellipsisWrapper').innerText;
        heartButton.dataset.image = parent.querySelector('img').src;


        // Add event listener to the heartButton to add or remove favorite
        heartButton.addEventListener('click', function(e) {
            e.stopPropagation();

            if (isInFavorite(currentUrl)) {
                removeFavorite(currentUrl,true);
            } else {
                saveFavorite(heartButton,currentUrl,true);
            }
            updateHeartButton(heartButton, currentUrl);
        });
        updateHeartButton(heartButton, currentUrl)


        iconDiv.appendChild(heartButton);
        contentDiv.appendChild(iconDiv);
        topRight.appendChild(contentDiv);
    }
}