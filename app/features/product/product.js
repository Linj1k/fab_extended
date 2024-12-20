var currentProductData = null;
function addElementsProduct() {
    var uid = (window.location.href).split('/').pop();
    if (currentProductData != "loading" && uid !== currentProductData?.uid) {
        currentProductData = null;
    }

    if (currentProductData == null) {
        currentProductData = "loading";
        fabext_SendRequest("GET", "listings/"+uid, null, function(response) {
            if (response.readyState === 4 && response.status === 200) {
                currentProductData = JSON.parse(response.responseText);

                fabext_Log(currentProductData);
                AutoSelectLicense();
                addSellerInformationToDetails();
                addSellerCoverBackground(true);
                addProductCoverBackground();
            }
        });
    } else if(currentProductData != "loading") {
        AutoSelectLicense();
    }

    addFavoriteButtonProduct();
    searchForLinks();
    addSellerCoverBackground(true);
    AutoClaim_Dom(true);
}