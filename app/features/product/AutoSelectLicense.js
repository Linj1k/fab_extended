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
                const listItems = Array.from(list.children);
                
                listItems.forEach((option, index) => {
                    if (option.getAttribute('aria-selected') === "true") {
                        option.click();
                        parent.dataset.autoSelectLicense = true;
                        return;
                    }
                });

                if (parent.dataset.autoSelectLicense) return;
                // option with data-value = parent.dataset.autoSelectLicenseId
                listItems.forEach((option, index) => {
                    if (option.dataset.value === parent.dataset.autoSelectLicenseId) {
                        option.click();
                        parent.dataset.autoSelectLicense = true;
                        return;
                    }
                });

                if (parent.dataset.autoSelectLicense) return;
                list.children[0].click();
                parent.dataset.autoSelectLicense = true;
            }
        } else {
            var licenses = currentProductData.licenses;
            const personalLicense = licenses.find(license => license.slug === getSetting("Product_AutoSelectLicense","personal"));

            parent.dataset.autoSelectLicenseId = personalLicense.listingLicenseId;
            license.click();
        }
    }
}