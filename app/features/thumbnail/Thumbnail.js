const productThumbnailsClass = '.fabkit-Stack-root > .fabkit-Thumbnail-root';
function addElementsThumbnail() {
    var productThumbnails = document.querySelectorAll(productThumbnailsClass);
    productThumbnails.forEach(function(thumbnail) {
        if (thumbnail.tagName !== 'DIV') return;
        let parent = thumbnail.parentElement;
        if (!parent) return;
        if (!parent.querySelector('.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-scale--gapX-spacing-2.fabkit-scale--gapY-spacing-2')) return;

        addFavoriteButtonThumbnail(thumbnail)
        //addToCartThumbnail(thumbnail)
    });
}