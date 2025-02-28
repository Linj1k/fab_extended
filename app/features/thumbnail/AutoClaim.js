var AutoClaimDomTimeout = null;
function AutoClaim_Dom(remove) {
    if (remove) {
        var AutoClaimButton = document.querySelector("button#AutoClaimButton");
        if (AutoClaimButton !== null) {
            AutoClaimButton.remove();
        }
        return;
    }
    
    if (getSetting("Thumbnail_AutoClaimFree","cart") === "off") return;
    
    clearTimeout(AutoClaimDomTimeout);
    AutoClaimDomTimeout = setTimeout(function() {
        var AutoClaimButton = document.querySelector("button#AutoClaimButton");
        if (AutoClaimButton === null) {
            AutoClaimButton = document.createElement("button");
            AutoClaimButton.id = "AutoClaimButton";
            AutoClaimButton.textContent = "Auto Claim";
            AutoClaimButton.onclick = AutoClaim_Button;
            document.body.appendChild(AutoClaimButton);
        }
    }, 500);
}

function AutoClaim_Button(e) {
    e.preventDefault();
    const button = e.target;
    button.disabled = true;

    var productsUID = [];
    var productThumbnails = document.querySelectorAll(productThumbnailsClass);
    productThumbnails.forEach(function(thumbnail) {
        if (thumbnail.tagName !== 'DIV') return;
        let parent = thumbnail.parentElement;
        if (!parent) return;
        if (!parent.querySelector('.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-scale--gapX-spacing-2.fabkit-scale--gapY-spacing-2')) return;

        // check if the product is free
        const productPrice = thumbnail.parentElement.querySelector('.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-scale--gapX-spacing-2.fabkit-scale--gapY-spacing-2 > .fabkit-Stack-root.fabkit-scale--gapX-spacing-1.fabkit-scale--gapY-spacing-1 > .fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-primary.fabkit-Text--sm.fabkit-Text--regular');
        if (productPrice === null) return;
        const productPriceText = productPrice.textContent;
        if (productPriceText.includes(",") || productPriceText.includes(".")) return;
        var link = thumbnail.querySelector('a.fabkit-Thumbnail-overlay');
        if (link === null) return;
        link = link.href;

        const uid = link.split('/').pop();
        productsUID.push(uid);
    });
    if (productsUID.length === 0) {
        fabext_sendNotification(`No recoverable products found!`)
        button.disabled = false;
        return;
    };

    if (!confirm(`Do you really want to claim all the free products (${productsUID.length}) currently displayed on the page?`)) {
        button.disabled = false;
        return;
    };
    const setting = getSetting("Thumbnail_AutoClaimFree","cart");

    var claimed = [];
    var success = 0;
    const onClaimed = function(uid, product) {
        claimed.push({
            uid: uid,
            product: product,
            success: product ? true : false
        });
        if (product) success++;

        if (claimed.length === productsUID.length) {
            button.disabled = false;

            // show notification with all only success claimed products titles
            var notification = claimed.filter(product => product.success).map(product => product.product.title).join("<br>");
            fabext_sendNotification(`AutoClaim: (${success}/${productsUID.length}) products ${setting === "cart" ? "added to cart" : "claimed"}<p style='font-size: .5rem;'>To see the product in your cart, you need to refresh your page.</p><br>${notification}`, {
                duration: 10000
            });
        }
    }

    fabext_SendRequest('GET', 'cart', null, function(response) {
        if (response.readyState === 4 && response.status === 200) {
            var CartData = JSON.parse(response.responseText);
            
            productsUID.forEach(function(uid, index) {
                fabext_SendRequest("GET", "listings/"+uid, null, function(response) {
                    if (response.readyState === 4 && response.status === 200) {
                        var listingsData = JSON.parse(response.responseText);

                        var licenses = listingsData.licenses;
                        // find the free license
                        var discountedLicense = null;
                        var freeLicense = licenses.find(license => license.priceTier.price === 0);
                        if (!freeLicense) {
                            // discountedPrice
                            discountedLicense = licenses.find(license => license.priceTier.discountedPrice == 0);
                            if (!discountedLicense) {
                                fabext_sendNotification(`${listingsData.title} cannot be claimed for free!`);
                                onClaimed(uid,listingsData);
                                return;
                            }
                            
                            freeLicense = discountedLicense;
                        }
                        const listingLicenseId = freeLicense.listingLicenseId;

                        if (setting === "cart" || discountedLicense) {
                            // find if the item is already in the cart
                            var item = CartData.items.find(item => item.listingLicenseId === listingLicenseId);
                            if (item) {
                                onClaimed(uid);
                                return;
                            }

                            
                            fabext_SendRequest("POST", "cart/items", JSON.stringify({
                                "listingLicense": listingLicenseId,
                            }), function(response) {
                                if (response.readyState === 4) {
                                    onClaimed(uid,listingsData);
                                }
                            });
                        } else {
                            fabext_SendRequest("POST", "listings/"+listingsData.uid+"/add-to-library", JSON.stringify({
                                "offer_id": freeLicense.offerId,
                            }), function(response) {
                                if (response.readyState === 4) {
                                    onClaimed(uid,listingsData);
                                }
                            });
                        }
                    } else if (response.readyState === 4) {
                        fabext_sendNotification(`${listingsData.title} cannot be claimed for free!`);
                        onClaimed(uid);
                    }
                });
            });
        }
    });
}