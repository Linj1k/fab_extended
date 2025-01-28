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