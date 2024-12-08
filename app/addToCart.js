function addToCartThumbnail(thumbnail) {
    if (thumbnail && thumbnail.querySelector('#thumbnail-addToCartButton') === null) {
        var parent = thumbnail.parentNode;
        var currentUrl = parent.querySelector('.fabkit-Thumbnail-overlay.h2KfmOpM').href;
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
        var topRight = thumbnail.querySelector('.fabkit-Thumbnail-item.fabkit-Thumbnail--top-right.q2jjQjlm.YFuShsDk')

        // Create topRight div if it doesn't exist
        if (topRight === null) {
            var topRight = document.createElement("div");
            topRight.classList.add("fabkit-Thumbnail-item", "fabkit-Thumbnail--top-right", "q2jjQjlm", "YFuShsDk");
            thumbnail.appendChild(topRight);
        } else {
            contentDiv.classList.add("fabkit-Thumbnail-addToCartButton")
        }

        addToCartButton.style.display = "flex";
        addToCartButton.type = "button";
        addToCartButton.innerHTML = addToCartIcon;
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

            fabext_SendRequest("GET", "listings/"+uid, null, function(response) {
                if (response.readyState === 4 && response.status === 200) {
                    var data = JSON.parse(response.responseText);
                    console.log(data);

                    var licenses = data.licenses;
                    const personalLicense = licenses.find(license => license.slug === "personal");
                    const professionalLicense = licenses.find(license => license.slug === "professional");

                    console.log(personalLicense);

                    var listingLicenseId = licenses.length === 1 ? licenses[0].listingLicenseId :
                        confirm(`
Do you want to use the personal license?\n
- Yes: Personal license (${personalLicense.priceTier.price} ${personalLicense.priceTier.currencyCode})
- No: Professional license (${professionalLicense.priceTier.price} ${professionalLicense.priceTier.currencyCode})
`) ? personalLicense.listingLicenseId : professionalLicense.listingLicenseId;
                    
                    fabext_SendRequest("POST", "cart/items", JSON.stringify({
                        "listingLicense": listingLicenseId,
                    }), function(response) {
                        if (response.readyState === 4 && response.status === 201) {
                            if (devmode) {
                                console.log(`Item ${data.title} (${data.uid}) added to cart`);
                            }

                            addToCartButton.style.color = "#ADFF2F";
                            fabext_sendNotification(`<br>${data.title} added to cart!<p style='font-size: .5rem;'>To see the product in your cart, you need to refresh your page.</p>`,{
                                escapeMarkup: false,
                            });
                        }
                    });
                }
            });
        });


        iconDiv.appendChild(addToCartButton);
        contentDiv.appendChild(iconDiv);
        topRight.appendChild(contentDiv);
    }
}