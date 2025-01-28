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
                if (getSetting("Product_VideoPlayer_Order","first") === "first") {
                    carousel.insertBefore(video, carousel.firstChild);
                } else {
                    carousel.appendChild(video);
                }
            });
        }
        carouselDiv.dataset.searchForVideo = true;
    }
}