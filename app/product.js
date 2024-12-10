function addElementsDom() {
    if(window.location.href.includes("/listings/")) {
        addFavoriteButtonProduct()
        AutoSelectLicense();
        searchForVideo();
    }

    var productThumbnails = document.querySelectorAll('.fabkit-scale--radius-3');
    productThumbnails.forEach(function(thumbnail) {
        if (thumbnail.tagName !== 'DIV') return;

        addFavoriteButtonThumbnail(thumbnail)
        addToCartThumbnail(thumbnail)
    });
}

function AutoSelectLicense() {
    var license = document.querySelector('.fabkit-Stack-root.fabkit-Stack--align_center.fabkit-Stack--justify_space-between.fabkit-InputContainer-root.fabkit-InputContainer--md');
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

var searchForVideoTimeout = null;
function searchForVideo() {
    clearTimeout(searchForVideoTimeout);
    searchForVideoTimeout = setTimeout(() => {
        var DescriptionDiv = document.querySelector('.fabkit-Stack-root.fabkit-scale--gapX-layout-5.fabkit-scale--gapY-layout-5.fabkit-Stack--column');

        if (DescriptionDiv) {
            var carouselDiv = document.querySelector('.fabkit-Stack-root.fabkit-scale--gapX-layout-6.fabkit-scale--gapY-layout-6.fabkit-Stack--column');
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
            const videoToAppend = [];

            var links = DescriptionDiv.querySelectorAll('a');
            links.forEach(function(link) {
                if (link.dataset.searchForVideo) return;
                var href = link.href;
                var embed = getEmbededVideoId(href)

                if (embed && embed.link) {
                    // add the icon to the link
                    link.innerHTML = VideoIcon + link.innerHTML;
                    link.dataset.searchForVideo = true;

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
                        video.frameborder = "0";
                        video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                        video.referrerpolicy = "strict-origin-when-cross-origin";
                        divVideo.appendChild(video);
                    }

                    // add a div to block the video
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

                        var video = document.createElement('iframe');
                        video.style.width = "100%";
                        video.style.height = "100%";
                        video.src = embed.link;
                        video.title = "Video player";
                        video.frameborder = "0";
                        video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                        video.referrerpolicy = "strict-origin-when-cross-origin";
                        carouselBig.appendChild(video);
                    };
                    divVideo.appendChild(divBlock);

                    videoToAppend.push(liVdeo);
                }
            });

            if (videoToAppend.length > 0) {
                // add the video to the carousel (revert the order)
                videoToAppend.reverse().forEach(function(video) {
                    carousel.insertBefore(video, carousel.firstChild);
                });
            }
        }
    }, 100);
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
    //         // Checks if the JSON string is complete
    //         if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
    //             FabData = JSON.parse(data);
    //         } else {
    //             throw new Error("The JSON string is incomplete or badly formed.");
    //         }
    //     } catch (e) {
    //         console.error("JSON parsing error :", e);
    //     }
    //     fabext_Log( typeof FabData, FabData );
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