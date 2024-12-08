function addElementsDom() {
    addFavoriteButtonProduct()
    AutoSelectLicense();

    var productThumbnails = document.querySelectorAll('.fabkit-scale--radius-3.Vq2qCiz2');
    productThumbnails.forEach(function(thumbnail) {
        addFavoriteButtonThumbnail(thumbnail)
        addToCartThumbnail(thumbnail)
    });
}

function AutoSelectLicense() {
    var license = document.querySelector('.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-Stack--justify_space-between.fabkit-InputContainer-root.fabkit-InputContainer--md.q2wDXY2x');
    if (license) {
        const parent = license.parentElement;
        if (parent.dataset.autoSelectLicense) return;
        var uid = (window.location.href).split('/').pop();

        if (!parent.dataset.autoSelectLicenseRequested) {
            parent.dataset.autoSelectLicenseRequested = true;
            fabext_SendRequest("GET", "listings/"+uid, null, function(response) {
                if (response.readyState === 4 && response.status === 200) {
                    var listingsData = JSON.parse(response.responseText);
    
                    var licenses = listingsData.licenses;
                    const personalLicenseIndex = licenses.findIndex(license => license.slug === "personal");

                    parent.dataset.autoSelectLicenseIndex = personalLicenseIndex;
                    license.click();
                }
            });
        }

        if (license.getAttribute('aria-expanded') !== 'false') {
            var licenseOptions = document.querySelector('.fabkit-Dropdown-container');
            if (licenseOptions) {
                licenseOptions = licenseOptions.children[0];

                const list = licenseOptions.children[1];
                if (list.children[parent.dataset.autoSelectLicenseIndex]) {
                    list.children[parent.dataset.autoSelectLicenseIndex].click();
                } else {
                    list.children[0].click();
                }
                parent.dataset.autoSelectLicense = true;
            }
        }
    }
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