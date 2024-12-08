function addElementsDom() {
    addFavoriteButtonProduct()

    var productThumbnails = document.querySelectorAll('.fabkit-scale--radius-3.Vq2qCiz2');
    productThumbnails.forEach(function(thumbnail) {
        addFavoriteButtonThumbnail(thumbnail)
        addToCartThumbnail(thumbnail)
    });
}

const observer = new MutationObserver((mutations) => {
    /**
     * Retrieves data preloaded in the DOM (I didn't use it in the end, but I prefer to keep the code just in case.)
    */
    // let data = document.querySelector("#js-dom-data-prefetched-data");
    // if (data) {
    //     data = data.innerHTML.replace('<!--', '').replace('-->', '');
    //     // html decode
    //     data = data.replace(/&#34;/g, '"')
    //         .replace(/&#39;/g, "'")
    //         .replace(/&lt;/g, '<')
    //         .replace(/&gt;/g, '>')
    //         .replace(/&amp;/g, '&')
    //     try {
    //         // Vérifie si la chaîne JSON est complète
    //         if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
    //             FabData = JSON.parse(data);
    //         } else {
    //             throw new Error("La chaîne JSON est incomplète ou mal formée.");
    //         }
    //     } catch (e) {
    //         console.error("Erreur lors du parsing JSON :", e);
    //     }
    //     // console.log( typeof FabData, FabData );
    // }

    let shouldAddElements = false;
    for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
            shouldAddElements = true;
            break;
        }
    }

    if (shouldAddElements) {
        observer.disconnect();
        addElementsDom();
        addFavoriteButtonToNavbar();
        addTechnicalDetails();
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});