function addCoverBackground(className = "fabext-cover-background", image = null) {
    const main = document.querySelector('div#root > div > main');
    if (!main) return;

    var cover = main.querySelector("."+className);
    if (!image) {
        if (cover) cover.remove();
        return;
    }

    if (!cover) {
        cover = document.createElement('div');
        cover.classList.add(className,"fabext-cover");

        var gradient = document.createElement('div');
        gradient.className = "fabext-cover-gradient";
        cover.appendChild(gradient);

        main.insertBefore(cover, main.firstChild);
    } else {
        // fabext-cover-animation
        if (cover.animationTimeout) {
            clearTimeout(cover.animationTimeout);
        }
        cover.classList.remove("fabext-cover-animation");
        void cover.offsetWidth; // Trigger reflow to restart animation
        cover.classList.add("fabext-cover-animation");
        cover.animationTimeout = setTimeout(() => {
            cover.classList.remove("fabext-cover-animation");
        }, 2100);
    }

    cover.style.backgroundImage = "url('"+image+"')";

    return cover;
}

function addIndexCoverBackground(remove = false) {
    if (remove) {
        addCoverBackground('fabext-index-cover', null);
        return;
    }

    var coverSetting = getSetting("Index_CoverBackground",true);
    if (coverSetting === false) return;

    const ul = document.querySelector('section.fabkit-Stack-root.fabkit-scale--gapX-layout-4.fabkit-scale--gapY-layout-4 > div.fabkit-BladesColumns-column.fabkit-BladesColumns-grow > ul.fabkit-Carousel-container');
    if (!ul) return;
    
    // get the li aria-hidden="false"
    var li = ul.querySelector('li[aria-hidden="false"]');
    if (!li) return;
    var image = getComputedStyle(li).getPropertyValue('--Carousel_src');
    // remove the url() and the quotes
    image = image.slice(4, -1);

    addCoverBackground('fabext-index-cover', image);
}

function addProductCoverBackground(remove = false) {
    if (remove) {
        addCoverBackground('fabext-product-cover', null);
        return;
    }

    var coverSetting = getSetting("Product_CoverBackground","product");
    if (coverSetting === "off") return;
    if (coverSetting === "seller" && currentProductData.user.coverImageUrl == null) {
        coverSetting = "product";
    };

    var image;
    switch (coverSetting) {
        case "seller":
            image = currentProductData.user.coverImageUrl;
            break;
        default:
            const imageDiv = document.querySelector('div.fabkit-Stack-root.fabkit-scale--gapX-layout-6.fabkit-scale--gapY-layout-6.fabkit-Stack--column img');
            if (!imageDiv) return;

            image = imageDiv.src;
            break;
    }

    addCoverBackground('fabext-product-cover', image);
}

function addSellerCoverBackground(remove = false) {
    if (remove) {
        addCoverBackground('fabext-seller-cover', null);
        return;
    }

    var coverSetting = getSetting("Seller_CoverBackground",true);
    if (coverSetting === false) return;

    const imageDiv = document.querySelector('div.fabkit-Surface-root.fabkit-scale--radius-4.fabkit-Stack-root.fabkit-Stack--justify_center.fabkit-Stack--column');
    var image = getComputedStyle(imageDiv).getPropertyValue('--ProfileHeader_backgroundImage');
    // remove the url() and the quotes
    image = image.slice(4, -1);

    addCoverBackground('fabext-seller-cover', image);
}