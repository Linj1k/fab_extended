var url;
setInterval(function() {
    if (url !== window.location.href) {
        var productTitle = document.querySelector('.fabkit-Typography-root.fabkit-typography--align-start.fabkit-typography--intent-primary.fabkit-Heading--lg.nkhb3MLS');
        if (productTitle) {
            url = window.location.href;
            var heartButton = document.createElement("button");
            heartButton.innerHTML = "❤️";
            heartButton.id = "product-heartButton";
            heartButton.classList.add("fabkit-Button-root", "fabkit-Button--icon", "fabkit-Button--sm", "fabkit-Button--ghost", "fabkit-MegaMenu-iconButton");
            heartButton.type = "button";
            heartButton.setAttribute("aria-label", "Ajouter aux favoris");

            heartButton.addEventListener('click', function() {
                var currentUrl = window.location.href;
                if (isInFavorite(currentUrl)) {
                    removeFavorite(currentUrl,true);
                } else {
                    saveFavorite(currentUrl,true);
                }
                updateHeartButton(heartButton, currentUrl);
            });

            productTitle.appendChild(heartButton);
            updateHeartButton()
        }
    }
},1000);