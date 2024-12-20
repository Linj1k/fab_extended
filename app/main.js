
function addElementsDom() {
    ClearCartButton()
    addElementsThumbnail()
    addIndexCoverBackground(window.location.href === "https://www.fab.com")

    if(window.location.href.includes("/listings/")) {
        addElementsProduct();
        return;
    } else if(window.location.href.includes("/sellers/")) {
        addElementsSeller();
        return;
    }
    
    const canShowAutoClaim = !(window.location.href == "https://www.fab.com" || window.location.href.includes("/channels/") || window.location.href.includes("/category/") || window.location.href.includes("/blade/") || window.location.href.includes("/search"));
    AutoClaim_Dom(canShowAutoClaim);
    addProductCoverBackground(true);
    addSellerCoverBackground(true);
}

const observer = new MutationObserver((mutations) => {
    /**
     * Retrieves data preloaded in the DOM (I didn't use it in the end, but I prefer to keep the code just in case.)
    */
    let data = document.querySelector("#js-json-data-prefetched-data");
    if (data) {
        data = data.innerText.trim()
        try {
            // Checks if the JSON string is complete
            if (data.startsWith('{') && data.endsWith('}')) {
                FabData = JSON.parse(data);
            } else {
                throw new Error("The JSON string is incomplete or badly formed.");
            }
        } catch (e) {
            console.error("JSON parsing error :", e);
        }
        // fabext_Log( typeof FabData, FabData );
    }

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