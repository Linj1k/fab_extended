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
                var iconName = null;

                if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?fab\.com/) || href.startsWith('https://unrealengine.com/marketplace')) {
                    iconName = 'fab';
                } else if (href.startsWith('https://discord.gg') || href.startsWith('https://discord.com/invite/')) {
                    iconName = 'discord';
                } else if (href.startsWith('https://instagram.com')) {
                    iconName = 'instagram';
                } else if (href.startsWith('https://facebook.com')) {
                    iconName = 'facebook';
                } else if (href.startsWith('https://twitter.com') || href.startsWith('https://x.com')) {
                    iconName = 'twitter-x';
                } else if (href.startsWith('https://linkedin.com')) {
                    iconName = 'linkedin';
                } else if (href.startsWith('https://youtube.com') && !href.includes('playlist') && !href.includes('watch?v')) {
                    iconName = 'youtube';
                } else if (href.startsWith('https://twitch.tv')) {
                    iconName = 'twitch';
                } else if (href.startsWith('https://reddit.com')) {
                    iconName = 'reddit';
                } else if (href.startsWith('https://tiktok.com/')) {
                    iconName = 'tiktok';
                } else if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?epicgames\.com/)) {
                    iconName = 'epic-games';
                } else if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?unrealengine\.com/)) {
                    iconName = 'unreal-engine';
                } else if (href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?unity\.com/)) {
                    iconName = 'unity';
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?artstation\.com/)) {
                    iconName = 'artstation';
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?github\.com/)) {
                    iconName = 'github';
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?google\.com/)) {
                    iconName = 'google';
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?dropbox\.com/)) {
                    iconName = 'dropbox';
                } else if (href.startsWith('https://skfb.ly') || href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?sketchfab\.com/)) {
                    iconName = 'sketchfab';
                } else if(href.match(/https?:\/\/([a-zA-Z0-9-]+\.)?itch\.io/)) {
                    iconName = 'gamepad';
                } else if(href.startsWith('mailto:')) {
                    iconName = 'envelope';
                }

                if (iconName) {
                    link.dataset.searchForLinks = true;
                    link.style.marginLeft = "5px";
                    link.insertBefore(fabext_getIconHtml(iconName, 'xs'), link.firstChild);
                }
            });
        }

        searchForVideo();
    }, 100);
}