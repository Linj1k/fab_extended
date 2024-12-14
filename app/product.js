var currentProductData = null;
var currentSellerData = null;
function addElementsDom() {
    if(window.location.href.includes("/listings/")) {
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
                    addProductCoverBackground();
                }
            });
        } else if(currentProductData != "loading") {
            AutoSelectLicense();
        }

        addFavoriteButtonProduct();
        searchForLinks();
    } else if(window.location.href.includes("/sellers/")) {
        addSellerCoverBackground();
    } else {
        addProductCoverBackground(true);
        addSellerCoverBackground(true);
    }

    var productThumbnails = document.querySelectorAll('.fabkit-Stack-root.fabkit-scale--gapX-layout-3.fabkit-scale--gapY-layout-3.fabkit-Stack--column > .fabkit-scale--radius-3');
    productThumbnails.forEach(function(thumbnail) {
        if (thumbnail.tagName !== 'DIV') return;

        addFavoriteButtonThumbnail(thumbnail)
        addToCartThumbnail(thumbnail)
    });
}

function AutoSelectLicense() {
    if (getSetting("Product_AutoSelectLicense","personal") === "off") return;

    var license = document.querySelector('.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-Stack--justify_space-between.fabkit-InputContainer-root.fabkit-InputContainer--md');
    if (license) {
        const parent = license.parentElement;
        if (parent.dataset.autoSelectLicense) return;

        if (license.getAttribute('aria-expanded') !== 'false') {
            var licenseOptions = document.querySelector('.fabkit-Dropdown-container');
            if (licenseOptions) {
                licenseOptions = licenseOptions.children[0];

                const list = licenseOptions.children[1];

                // option with data-value = parent.dataset.autoSelectLicenseId
                Array.from(list.children).forEach((option, index) => {
                    if (option.dataset.value === parent.dataset.autoSelectLicenseId) {
                        option.click();
                        parent.dataset.autoSelectLicense = true;
                        return;
                    }
                });

                if (!parent.dataset.autoSelectLicense) {
                    list.children[0].click();
                    parent.dataset.autoSelectLicense = true;
                }
            }
        } else {
            var licenses = currentProductData.licenses;
            const personalLicense = licenses.find(license => license.slug === getSetting("Product_AutoSelectLicense","personal"));

            parent.dataset.autoSelectLicenseId = personalLicense.listingLicenseId;
            license.click();
        }
    }
}

var searchForLinksTimeout = null;
function searchForLinks() {
    clearTimeout(searchForLinksTimeout);
    searchForLinksTimeout = setTimeout(() => {
        var DescriptionDiv = document.querySelector('.fabkit-Stack-root.fabkit-scale--gapX-layout-5.fabkit-scale--gapY-layout-5.fabkit-Stack--column');
        if (DescriptionDiv && getSetting("Product_DescriptionLogoLink",true)) {
            var links = DescriptionDiv.querySelectorAll('a');
            links.forEach(function(link) {
                if (link.innerText.trim() === "") return;
                if (link.dataset.searchForLinks) return;

                const href = link.href.trim().replace('www.','');
                var text;

                if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?fab\.com/) || href.startsWith('https://unrealengine.com/marketplace')) {
                    text = fabext_getIcon('fab', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://discord.gg') || href.startsWith('https://discord.com/invite/')) {
                    text = fabext_getIcon('discord', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://instagram.com')) {
                    text = fabext_getIcon('instagram', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://facebook.com')) {
                    text = fabext_getIcon('facebook', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://twitter.com') || href.startsWith('https://x.com')) {
                    text = fabext_getIcon('twitter-x', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://linkedin.com')) {
                    text = fabext_getIcon('linkedin', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://youtube.com') && !href.includes('playlist') && !href.includes('watch?v')) {
                    text = fabext_getIcon('youtube', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://twitch.tv')) {
                    text = fabext_getIcon('twitch', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://reddit.com')) {
                    text = fabext_getIcon('reddit', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://tiktok.com/')) {
                    text = fabext_getIcon('tiktok', 'xs') + link.innerHTML;
                } else if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?epicgames\.com/)) {
                    text = fabext_getIcon('epic-games', 'xs') + link.innerHTML;
                } else if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?unrealengine\.com/)) {
                    text = fabext_getIcon('unreal-engine', 'xs') + link.innerHTML;
                } else if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?unity\.com/)) {
                    text = fabext_getIcon('unity', 'xs') + link.innerHTML;
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?artstation\.com/)) {
                    text = fabext_getIcon('artstation', 'xs') + link.innerHTML;
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?github\.com/)) {
                    text = fabext_getIcon('github', 'xs') + link.innerHTML;
                } else if (href.startsWith('https://skfb.ly') || href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?sketchfab\.com/)) {
                    text = fabext_getIcon('sketchfab', 'xs') + link.innerHTML;
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?itch\.io/)) {
                    text = fabext_getIcon('gamepad', 'xs') + link.innerHTML;
                } else if(href.startsWith('mailto:')) {
                    text = fabext_getIcon('envelope', 'xs') + link.innerHTML;
                }

                if (text) {
                    link.dataset.searchForLinks = true;
                    link.style.marginLeft = "5px";
                    link.innerHTML = text;
                }
            });
        }

        searchForVideo();
    }, 100);
}

function searchForVideo() {
    if (getSetting("Product_VideoPlayer",true) === false) return;

    var DescriptionDiv = document.querySelector('.fabkit-Stack-root.fabkit-scale--gapX-layout-5.fabkit-scale--gapY-layout-5.fabkit-Stack--column');
    if (DescriptionDiv) {
        var carouselDiv = document.querySelector('.fabkit-Stack-root.fabkit-scale--gapX-layout-6.fabkit-scale--gapY-layout-6.fabkit-Stack--column');
        if (carouselDiv && carouselDiv.dataset.searchForVideo) return;

        var carouselBig = carouselDiv.children[0];
        var carousel = carouselDiv.children[1];
        if (!carousel) {
            carousel = document.createElement('div');
            carousel.className = "fabkit-Stack-root fabkit-Stack--align_center fabkit-scale--gapX-layout-4 fabkit-scale--gapY-layout-4 fabkit-Stack--fullWidth _lPWHTqD";
            carouselDiv.appendChild(carousel);

            const carouselOl = document.createElement('ol');
            carouselOl.className = "fabkit-Stack-root fabkit-Stack--align_center fabkit-scale--gapX-layout-4 fabkit-scale--gapY-layout-4 fabkit-Stack--fullWidth gxEZLyeW";
            carousel.appendChild(carouselOl);
            carousel = carouselOl;
            
            // copy the image from big carousel to the small carousel
            var img = carouselBig.querySelector('img');
            if (img) {
                var li = document.createElement('li');
                var div = document.createElement('div');
                div.className = "fabkit-Thumbnail-root fabkit-Thumbnail--16/9 fabkit-scale--radius-2 FJXTLkFZ";
                div.style.position = "relative";
                li.appendChild(div);
                var imgCopy = img.cloneNode(true);
                div.appendChild(imgCopy);

                // add a div to block the image
                var divBlock = document.createElement('div');
                divBlock.style.position = "absolute";
                divBlock.style.top = "0";
                divBlock.style.left = "0";
                divBlock.style.width = "100%";
                divBlock.style.height = "100%";
                divBlock.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    carouselBig = carouselDiv.children[0];
                    while (carouselBig.firstChild) {
                        carouselBig.removeChild(carouselBig.firstChild);
                    }

                    var img = imgCopy.cloneNode(true);
                    carouselBig.appendChild(img);
                };
                div.appendChild(divBlock);

                carousel.appendChild(li);
            }
        } else {
            carousel = carousel.querySelector('ol');
        }
        // search all the links in the description
        const maxVideos = getSetting("Product_MaxVideos", 0);
        const videoToAppend = [];

        var links = DescriptionDiv.querySelectorAll('a');
        Array.from(links).some(function(link) {
            if (maxVideos > 0 && videoToAppend.length >= maxVideos){
                console.log('maxVideos reached');
                return true;
            };
            if (!link.dataset.searchForVideo) {
                var href = link.href;
                var text = link.innerText;
                var embed = getEmbededVideoId(href)

                if (embed && embed.link) {
                    link.dataset.searchForVideo = true;

                    // add the icon to the link
                    link.innerHTML = fabext_getIcon('video','xs') + link.innerHTML;

                    // add the video to the carousel
                    var liVdeo = document.createElement('li');

                    var divVideo = document.createElement('div');
                    divVideo.className = "fabkit-Thumbnail-root fabkit-Thumbnail--16/9 fabkit-scale--radius-2 FJXTLkFZ";
                    divVideo.style.position = "relative";
                    liVdeo.appendChild(divVideo);

                    if (embed.type === 'soundcloud') {
                        var soundcloudIcon = document.createElement('img');
                        soundcloudIcon.src = "https://a-v2.sndcdn.com/assets/images/brand-1b72dd82.svg";
                        soundcloudIcon.style.position = "absolute";
                        soundcloudIcon.style.top = "0";
                        soundcloudIcon.style.left = "0";
                        soundcloudIcon.style.width = "100%";
                        soundcloudIcon.style.height = "100%";
                        soundcloudIcon.style.padding = "20px";
                        soundcloudIcon.style.objectFit = "contain";
                        divVideo.appendChild(soundcloudIcon);
                    } else {
                        var video = document.createElement('iframe');
                        video.src = embed.link;
                        video.title = "Video player";
                        video.style.width = "200%";
                        video.style.height = "200%";
                        video.frameborder = "0";
                        video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                        video.referrerpolicy = "strict-origin-when-cross-origin";
                        divVideo.appendChild(video);

                        if (embed.type === 'youtube_playlist') {
                            var playlistIcon = document.createElement('div');
                            playlistIcon.innerHTML = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-id-23"></use><path d="m 22.53,21.42 0,6.85 5.66,-3.42 -5.66,-3.42 0,0 z m -11.33,0 9.06,0 0,2.28 -9.06,0 0,-2.28 0,0 z m 0,-9.14 13.6,0 0,2.28 -13.6,0 0,-2.28 0,0 z m 0,4.57 13.6,0 0,2.28 -13.6,0 0,-2.28 0,0 z" fill="#fff" id="ytp-id-23"></path></svg>';
                            playlistIcon.classList.add('fabext-playlist-icon');
                            divVideo.appendChild(playlistIcon);
                        }
                    }

                    // add a text to the video
                    if (text != href) {
                        var divText = document.createElement('div');
                        divText.style.position = "absolute";
                        divText.style.bottom = "0";
                        divText.style.left = "0";
                        divText.style.width = "100%";
                        divText.style.height = "15px";
                        divText.style.fontSize = "10px";
                        divText.style.paddingLeft = "3px";
                        divText.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                        divText.style.color = "white";
                        divText.style.display = "flex";
                        divText.style.justifyContent = "left";
                        divText.style.alignItems = "center";
                        divText.innerHTML = text;
                        divVideo.appendChild(divText);
                    }

                    // add a div to block the video
                    var divBlock = document.createElement('div');
                    divBlock.style.position = "absolute";
                    divBlock.style.top = "0";
                    divBlock.style.left = "0";
                    divBlock.style.width = "100%";
                    divBlock.style.height = "100%";
                    divBlock.title = text;
                    divBlock.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        carouselBig = carouselDiv.children[0];
                        while (carouselBig.firstChild) {
                            carouselBig.removeChild(carouselBig.firstChild);
                        }

                        var video = document.createElement('iframe');
                        video.style.width = "100%";
                        video.style.height = "100%";
                        video.src = embed.link;
                        video.title = "Video player";
                        video.frameborder = "0";
                        video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                        video.referrerpolicy = "strict-origin-when-cross-origin";
                        video.allowFullscreen = true;
                        carouselBig.appendChild(video);
                    };
                    divVideo.appendChild(divBlock);

                    videoToAppend.push(liVdeo);
                }
            };
        });

        if (videoToAppend.length > 0) {
            // add the video to the carousel (revert the order)
            videoToAppend.reverse().forEach(function(video) {
                carousel.insertBefore(video, carousel.firstChild);
            });
        }
        carouselDiv.dataset.searchForVideo = true;
    }
}

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

function addProductCoverBackground(remove = false) {
    const main = document.querySelector('div#root > div > main');
    var cover = main.querySelector('.fabext-product-cover');

    if (remove) {if (cover) {cover.remove();} return;}

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
            image = currentProductData.medias[0].mediaUrl;
            break;
    }

    if (!image) {if (cover) {cover.remove();} return;}

    if (!cover) {
        cover = document.createElement('div');
        cover.className = "fabext-product-cover";

        var gradient = document.createElement('div');
        gradient.className = "fabext-product-cover-gradient";
        cover.appendChild(gradient);

        main.insertBefore(cover, main.firstChild);
    }
    
    if (cover && image) {
        cover.style.backgroundImage = "url('"+image+"')";
    }
}

function addSellerCoverBackground(remove = false) {
    const main = document.querySelector('div#root > div > main');
    var cover = main.querySelector('.fabext-product-cover');

    if (remove) {if (cover) {cover.remove();} return;}

    var coverSetting = getSetting("Seller_CoverBackground",true);
    if (coverSetting === false) return;

    const imageDiv = document.querySelector('div.fabkit-Surface-root.fabkit-scale--radius-4.fabkit-Stack-root.fabkit-Stack--justify_center.fabkit-Stack--column');
    var image = getComputedStyle(imageDiv).getPropertyValue('--ProfileHeader_backgroundImage');

    if (!cover) {
        cover = document.createElement('div');
        cover.className = "fabext-product-cover";

        var gradient = document.createElement('div');
        gradient.className = "fabext-product-cover-gradient";
        cover.appendChild(gradient);

        main.insertBefore(cover, main.firstChild);
    }
    
    if (cover && image) {
        cover.style.backgroundImage = image;
    }
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