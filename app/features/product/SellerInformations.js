function addSellerInformationToDetails() {
    if (getSetting("Product_SellerDetails",true) === false) return;

    if (currentSellerData != "loading" && typeof currentSellerData === "object") {
        currentSellerData = "loading";
        fabext_SendRequest("GET", "sellers/"+currentProductData.user.sellerName+"/profile", null, function(response) {
            if (response.readyState === 4 && response.status === 200) {
                currentSellerData = JSON.parse(response.responseText);
                fabext_Log(currentSellerData);

                const productDetails = document.querySelectorAll('.fabkit-Surface-root.fabkit-Surface--emphasis-background-elevated-low-transparent.fabkit-scale--gutterX-spacing-8.fabkit-scale--gutterY-spacing-8.fabkit-Stack-root.fabkit-scale--gapX-spacing-5.fabkit-scale--gapY-spacing-5.fabkit-Stack--column')[1];
                if (productDetails) {
                    const List = productDetails.querySelector('.fabkit-Stack-root.fabkit-scale--gapX-spacing-3.fabkit-scale--gapY-spacing-3.fabkit-Stack--column');
                    if (!List || List.dataset.sellerinfo === window.location.href) return;    
                    
                    const appendData = (title, data, href) => {
                        var seller = document.createElement('div');
                        seller.className = "jpigE2gQ fabkit-Grid-root";
            
                        var sellerTitle = document.createElement('div');
                        sellerTitle.className = "fabkit-Typography-root fabkit-Typography--align-start fabkit-Typography--intent-secondary fabkit-Text--md fabkit-Text--regular";
                        sellerTitle.innerHTML = title;
                        seller.appendChild(sellerTitle);
            
                        var sellerLink = document.createElement('a');
                        sellerLink.href = href || data || "#";
                        sellerLink.className = "fabkit-Typography-root fabkit-Typography--align-start fabkit-Typography--intent-primary fabkit-Text--sm fabkit-Text--regular";
                        sellerLink.innerHTML = data;
                        seller.appendChild(sellerLink);
            
                        List.appendChild(seller);
                    }
            
                    appendData('Support email', currentSellerData.supportEmail, 'mailto:'+currentSellerData.supportEmail);

                    // add social links after the product details
                    var socialLinks = document.createElement('div');
                    socialLinks.className = "fabkit-Stack-root fabkit-Stack--align_center fabkit-scale--gapX-spacing-3 fabkit-scale--gapY-spacing-3 fabkit-Stack--row fabkit-Stack--wrap";
                    socialLinks.style.marginTop = "10px";
                    socialLinks.style.justifyContent = "center";
                    productDetails.appendChild(socialLinks);

                    [
                        {name: "Website", url: currentSellerData.website, icon: "globe"},
                        {name: "Artstation", url: currentSellerData.artstation},
                        {name: "X.com", url: currentSellerData.twitter, icon: "twitter-x"},
                        {name: "Facebook", url: currentSellerData.facebook},
                        {name: "Instagram", url: currentSellerData.instagram},
                        {name: "LinkedIn", url: currentSellerData.linkedin},
                        {name: "YouTube", url: currentSellerData.youtube},
                    ].forEach(function(social) {
                        if (!social.url) return;
                        var socialLink = document.createElement('a');
                        socialLink.href = social.url;
                        socialLink.target = "_blank";
                        socialLink.rel = "noopener noreferrer";
                        socialLink.className = "fabkit-Typography-root fabkit-Typography--align_start fabkit-Typography--intent-primary fabkit-Text--sm fabkit-Text--regular fabext-social-link";
                        socialLink.innerHTML = fabext_getIcon(social.icon || social.name.toLowerCase(), 'md');
                        socialLink.title = social.name;
                        socialLinks.appendChild(socialLink);
                    });

                    List.dataset.sellerinfo = window.location.href;
                }
            }
        });
    }
}