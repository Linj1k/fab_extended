const validFormat = [
    { name: "Unreal Engine", value: "unreal-engine" },
    { name: "Unity", value: "unity" },
    { name: "UEFN", value: "uefn" },
];

function addTechnicalDetails() {
    const uid = window.location.pathname.split('/').pop();

    const listingsFormat = document.querySelector('#listings-formats');
    if (listingsFormat) {
        // find the Unreal Engine version (in img alt)
        const img = listingsFormat.querySelectorAll('img');
        img.forEach(function(image) {
            const format = validFormat.find(format => image.alt.toLowerCase().includes(format.name.toLowerCase()));
            if (format) {
                if (image.parentElement.querySelector('#product-technicalDetails') || image.parentElement.dataset.technicalDetails) return;

                image.parentElement.dataset.technicalDetails = true;
                fabext_SendRequest('GET', 'listings/'+uid+"/asset-formats/"+format.value, null, function(response) {
                    if (response.readyState === 4 && response.status === 200) {
                        const unrealEngineData = JSON.parse(response.responseText);
                        const technicalDetailsData = unrealEngineData.technicalDetails;

                        const technicalDetailsContent = document.createElement('div');
                        technicalDetailsContent.id = 'product-technicalDetails';
                        technicalDetailsContent.classList.add('fabkit-Typography-root', 'fabkit-Typography--align-start', 'fabkit-Typography--intent-primary', 'fabkit-Typography--ellipsis', 'fabkit-Text--lg', 'fabkit-Text--regular');
                        technicalDetailsContent.style.width = '100%';
                        technicalDetailsContent.style.marginTop = '10px';
                        technicalDetailsContent.style.display = 'contents';

                        const title = document.createElement('span');
                        title.classList.add('fabkit-Typography-root',"fabkit-Typography--align-start","fabkit-Typography--intent-secondary")
                        title.innerText = 'Technical Details:';
                        title.style.alignSelf = 'flex-start';
                        technicalDetailsContent.appendChild(title);

                        const technicalDetailsText = document.createElement('div');
                        technicalDetailsText.innerHTML = technicalDetailsData;
                        technicalDetailsText.classList.add('fabkit-RichContent-root', 'fabkit-prose-prose');
                        technicalDetailsText.style.width = '100%';
                        technicalDetailsContent.appendChild(technicalDetailsText);

                        image.parentElement.appendChild(technicalDetailsContent);
                    }
                });
                return
            }
        });
    }
}