const productThumbnailsClass = '.fabkit-Stack-root.fabkit-scale--gapX-layout-3.fabkit-scale--gapY-layout-3.fabkit-Stack--column > .fabkit-scale--radius-3';
function addElementsThumbnail() {
    var productThumbnails = document.querySelectorAll(productThumbnailsClass);
    productThumbnails.forEach(function(thumbnail) {
        if (thumbnail.tagName !== 'DIV') return;

        addFavoriteButtonThumbnail(thumbnail)
        addToCartThumbnail(thumbnail)
    });
}