const Version = chrome.runtime.getManifest().version;
var GithubManifest;

var FabAPIUrl = 'https://www.fab.com/i/';
var FabData;

const trashIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--md edsicon edsicon-trash" aria-hidden="true"></i>`
const heartMdIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--md edsicon edsicon-heart" aria-hidden="true"></i>`
const heartIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--xs edsicon edsicon-heart" aria-hidden="true"></i>`
const heartFilledIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--xs edsicon edsicon-heart-filled" aria-hidden="true"></i>`
const heartFilledMdIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--md edsicon edsicon-heart-filled" aria-hidden="true"></i>`
const openIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--md edsicon edsicon-link" aria-hidden="true"></i>`
const VideoIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--md edsicon edsicon-video" aria-hidden="true"></i>`

const addToCartIcon = `<i class="fabkit-Icon-root fabkit-Icon--intent-inherit fabkit-Icon--xs edsicon edsicon-shopping-cart" aria-hidden="true"></i>`

function getEmbededVideoId(href) {
    var link = null;
    var type = null;
    
    // regex for youtube
    var youtube = href.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([^&?#]+)/);
    if (youtube) {
        if (href.includes('list=')) {
            link = "https://www.youtube.com/embed/videoseries?list=" + youtube[1];
            type = 'youtube_playlist';
        } else {
            type = 'youtube';
            link = "https://www.youtube.com/embed/" + youtube[1];
        }
    }

    // regex for vimeo
    var vimeo = href.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\?.*)?$/);
    if (vimeo && !href.includes('vimeo.com/album/')) {
        type = 'vimeo';
        link = "https://player.vimeo.com/video/"+vimeo[1];
    }

    // regex for dailymotion
    var dailymotion = href.match(/(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/(\w+)/);
    if (dailymotion) {
        type = 'dailymotion';
        link = "https://geo.dailymotion.com/player.html?video="+dailymotion[1];
    }

    // regex for soundcloud
    var soundcloud = href.match(/(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/([\w-]+)\/([\w-]+)/);
    if (soundcloud) {
        type = 'soundcloud';
        link = "https://w.soundcloud.com/player/?url="+href;
    }
    
    return {
        type: type,
        link: link
    };
}

var devmode = false;

function fabext_Log(...msg) {
    if (devmode) {
        console.log(msg);
    }
}

function fabext_GetCSRFToken() {
    var cookie = document.cookie;
    var csrfToken = cookie.match(/fab_csrftoken=([^;]+)/);
    if (csrfToken) {
        return csrfToken[1];
    }
    return null;
}

function fabext_SendRequest(method, url, data, callback) {
    fabext_Log('[Fab Extended] Request:', method, url, data);

    var xhr = new XMLHttpRequest();
    xhr.open(method, FabAPIUrl+url, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("x-csrftoken", fabext_GetCSRFToken());
    xhr.onreadystatechange = function() {
        callback(xhr);

        if (xhr.readyState === 4) {
            fabext_Log('[Fab Extended] Response:', method, url, data, xhr.responseText);
        }
    };
    xhr.send(data);
}

function fabext_sendNotification(text, customOptions) {
    var defaultOptions = {
        text: `Fab Extented <span style='font-size: .65rem;'>${Version}</span><br>${text}`,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        offset: {
            y: "5em"
        },
        style: {
          background: "linear-gradient(to right, #404044, #101014)",
          borderRadius: "6px",
        },
        escapeMarkup: false,
    }
    if (customOptions) {
        defaultOptions = Object.assign(defaultOptions, customOptions);
    }

    Toastify(defaultOptions).showToast();
}

function fabext_checkUpToDate() {
    console.log('[Fab Extended] Checking for updates');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/Linj1k/fab_extended/refs/heads/main/manifest.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var response = JSON.parse(xhr.responseText);
            GithubManifest = response

            if (response.version != Version) {
                console.log('[Fab Extended] New version available:', response.version);

                var lastVersion = localStorage.getItem('fabext_lastVersion');
                if (lastVersion != response.version) {
                    localStorage.setItem('fabext_lastVersion', response.version);
                    fabext_sendNotification(`A new update will be available soon: ${response.version}`, {
                        onClick: function() {
                            window.open('https://github.com/Linj1k/fab_extended/releases');
                        }
                    });
                }
            } else {
                console.log('[Fab Extended] Up to date', response.version);
            }
        }
    };
    xhr.send();
}

console.log('[Fab Extended] loaded');
fabext_checkUpToDate();