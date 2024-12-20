function addToCartThumbnail(thumbnail) {
    if (getSetting("Thumbnail_AddToCart",true) === false) return;

    if (thumbnail && thumbnail.querySelector('#thumbnail-addToCartButton') === null) {
        var parent = thumbnail.parentElement;
        var currentUrl = parent.querySelector('.fabkit-Thumbnail-overlay');
        if (!currentUrl) return;
        currentUrl = currentUrl.href;
        var uid = currentUrl.split('/').pop();
        
        var contentDiv = document.createElement("div");
        contentDiv.classList.add("fabkit-Stack-root", "fabkit-Stack--align_center", "fabkit-scale--gapX-spacing-2", "fabkit-scale--gapY-spacing-2");
        contentDiv.id = "thumbnail-addToCartButton";
        contentDiv.style.display = "flex";
        contentDiv.style.justifyContent = "end";
        contentDiv.style.marginTop = "5px";

        var iconDiv = document.createElement("div");
        iconDiv.classList.add("fabkit-Badge-root", "fabkit-Badge--filled", "fabkit-Badge--gray", "fabkit-Badge--md", "fabkit-Badge--iconOnly", "fabkit-Badge--blurify", "Nj5DrLsA", "jfHwYlH0", "MoIH083o");

        var addToCartButton = document.createElement("button");
        var topRight = thumbnail.querySelector('.fabkit-Thumbnail-item.fabkit-Thumbnail--top-right')

        // Create topRight div if it doesn't exist
        if (topRight === null) {
            var topRight = document.createElement("div");
            topRight.classList.add("fabkit-Thumbnail-item", "fabkit-Thumbnail--top-right",  "q2jjQjlm", "YFuShsDk");
            thumbnail.appendChild(topRight);
        } else {
            contentDiv.classList.add("fabkit-Thumbnail-addToCartButton")
        }

        addToCartButton.style.display = "flex";
        addToCartButton.type = "button";
        addToCartButton.innerHTML = fabext_getIcon('shopping-cart','xs');
        addToCartButton.setAttribute("aria-label", "Add to cart");
        addToCartButton.title = "Add to cart";

        // Add data attributes to the addToCartButton
        addToCartButton.dataset.category = parent.parentNode.querySelector('.fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-secondary.fabkit-Text--md.fabkit-Text--regular.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-scale--gapX-spacing-2.fabkit-scale--gapY-spacing-2').innerText;
        addToCartButton.dataset.category = addToCartButton.dataset.category.split('\n').pop();
        addToCartButton.dataset.title = parent.parentNode.querySelector('.fabkit-Typography-ellipsisWrapper').innerText;
        addToCartButton.dataset.image = parent.querySelector('img').src;

        // Add event listener to the addToCartButton to add or remove favorite
        addToCartButton.addEventListener('click', function(e) {
            e.stopPropagation();

            fabext_SendRequest('GET', 'users/me/acquired-content?listing_ids='+uid, null, function(response) {
                if (response.readyState === 4 && response.status === 200) {
                    var acquiredData = JSON.parse(response.responseText);

                    if (acquiredData.length > 0) {
                        const acquiredContent = acquiredData[0].acquired;
                        if (acquiredContent) {
                            fabext_sendNotification("This product is already in your library!");
                            return;
                        }

                        
                        fabext_SendRequest("GET", "listings/"+uid, null, function(response) {
                            if (response.readyState === 4 && response.status === 200) {
                                var listingsData = JSON.parse(response.responseText);

                                var licenses = listingsData.licenses;
                                const personalLicense = licenses.find(license => license.slug === "personal");
                                const professionalLicense = licenses.find(license => license.slug === "professional");

                                var listingLicenseId = licenses.length === 1 ? licenses[0].listingLicenseId :
                                    confirm(`
Do you want to use the personal license?\n
- Yes: Personal license (${personalLicense.priceTier.price} ${personalLicense.priceTier.currencyCode})
- No: Professional license (${professionalLicense.priceTier.price} ${professionalLicense.priceTier.currencyCode})
`) ? personalLicense.listingLicenseId : professionalLicense.listingLicenseId;

                                fabext_SendRequest('GET', 'cart', null, function(response) {
                                    if (response.readyState === 4 && response.status === 200) {
                                        var CartData = JSON.parse(response.responseText);

                                        // find if the item is already in the cart
                                        var item = CartData.items.find(item => item.listingLicenseId === listingLicenseId);
                                        if (item) {
                                            fabext_sendNotification("This product is already in your cart!");
                                            return;
                                        }

                                        fabext_SendRequest("POST", "cart/items", JSON.stringify({
                                            "listingLicense": listingLicenseId,
                                        }), function(response) {
                                            if (response.readyState === 4 && response.status === 201) {
                                                fabext_Log(`Item ${listingsData.title} (${listingsData.uid}) added to cart`);

                                                addToCartButton.style.color = "#ADFF2F";
                                                brainUpdateCart()
                                                fabext_sendNotification(`<br>${listingsData.title} added to cart!<p style='font-size: .5rem;'>To see the product in your cart, you need to refresh your page.</p>`);
                                            }
                                        });
                                    }
                                })
                            }
                        });
                    }
                }
            });
        });


        iconDiv.appendChild(addToCartButton);
        contentDiv.appendChild(iconDiv);
        topRight.appendChild(contentDiv);
    }
}

function ClearCartButton() {
    const createClearButton = (parent) => {
        var clearCartButton = parent.querySelector('#clearCartButton');
        if (!clearCartButton) {
            parent.style.display = 'flex';
            parent.style.justifyContent = 'space-between';
            parent.style.alignItems = 'center';

            clearCartButton = document.createElement('button');
            clearCartButton.id = 'clearCartButton';
            clearCartButton.classList.add('fabkit-Button-root', 'fabkit-Button--ghost', 'fabkit-Button--md', 'fabkit-Button--icon', 'fabkit-Button--danger', 'fabkit-Button--fullWidth', 'fabkit-Button--iconOnly', 'fabkit-Button--blurify');
            clearCartButton.innerHTML = fabext_getIcon('trash', 'md');
            clearCartButton.style.marginTop = '10px';
            clearCartButton.onclick = ClearCart;

            parent.appendChild(clearCartButton);
        }
    }

    if(window.location.href.includes("/cart")) {
        const cartTitle = document.querySelector('.fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-primary.fabkit-Typography--ellipsis.fabkit-Heading--2xl');
        // fabext_Log("/cart", cartTitle)
        if(cartTitle) {
            createClearButton(cartTitle);
        };
    }

    const cartPopup = document.querySelector('.fabkit-Dropdown-container.fabkit-MegaMenu-navMenuContent')
    if (cartPopup) {
        const cartTitle = cartPopup.querySelector('.fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-primary.fabkit-Heading--lg');
        const items = cartPopup.querySelectorAll('a.fabkit-Stack-root.fabkit-scale--gapX-layout-5.fabkit-scale--gapY-layout-5.fabkit-Stack--fullWidth');
        // fabext_Log("Cart Popup", cartTitle, items)
        if(!cartTitle || !items) return;

        createClearButton(cartTitle)
    }
}

function ClearCart() {
    if (!confirm('Do you really want to clear your cart? (The page will be refreshed after)')) return;

    fabext_SendRequest('GET', 'cart', null, function(response) {
        if (response.readyState === 4 && response.status === 200) {
            var CartData = JSON.parse(response.responseText);

            var success = 0
            const onSuccess = (item) => {
                success++;
                if (CartData.items.length === success)
                    window.location.reload(); // Todo: replace with brainUpdateCart() function
            }

            CartData.items.forEach(item => {
                fabext_SendRequest('DELETE', 'cart/items/'+item.uid, null, function(response) {
                    if (response.readyState === 4) {
                        onSuccess(item)

                        if (response.status === 204)
                            fabext_Log(`Item ${item.title} (${item.uid}) removed from cart`);
                    }
                });
            });
        }
    });
}

/**
 * TODO: Find a way to update the basket without refreshing the page
*/
function brainUpdateCart() {
}