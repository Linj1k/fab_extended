// Auto-scroll function for drag and drop
var autoScrollInterval = null;
function setupAutoScrollForPopup(container) {
    const scrollSpeed = 10;
    const scrollZone = 50; // pixels from edge to trigger scroll

    container.addEventListener('dragover', function(e) {
        const rect = container.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const containerHeight = rect.height;

        // Clear any existing interval
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }

        // Scroll up
        if (mouseY < scrollZone && container.scrollTop > 0) {
            autoScrollInterval = setInterval(function() {
                container.scrollTop -= scrollSpeed;
                if (container.scrollTop <= 0) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                }
            }, 20);
        }
        // Scroll down
        else if (mouseY > containerHeight - scrollZone && container.scrollTop < container.scrollHeight - containerHeight) {
            autoScrollInterval = setInterval(function() {
                container.scrollTop += scrollSpeed;
                if (container.scrollTop >= container.scrollHeight - containerHeight) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                }
            }, 20);
        }
    });

    // Stop scrolling when drag ends
    container.addEventListener('dragleave', function(e) {
        // Only stop if leaving the container, not when entering a child
        if (!container.contains(e.relatedTarget)) {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
        }
    });

    container.addEventListener('drop', function() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    });

    container.addEventListener('dragend', function() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    });
}

function createFavoritePopup() {
    var popup = document.getElementById('favorite-popup')
    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = "favorite-popup";

    var headerDiv = document.createElement("div");
    headerDiv.classList.add("favorite-popup-header");
    popup.appendChild(headerDiv);

    var title = document.createElement("span");
    title.innerHTML = "Favorites";
    headerDiv.appendChild(title);

    var headerButtons = document.createElement("div");
    headerButtons.classList.add("favorite-popup-header-buttons");
    headerDiv.appendChild(headerButtons);

    // add button to create new folder
    var addFolderButton = document.createElement("button");
    addFolderButton.innerHTML = fabext_getIcon('folder-plus');
    addFolderButton.title = "New folder";
    addFolderButton.addEventListener('click', function() {
        showCreateFolderModal(function() {
            popup.load();
        });
    });
    headerButtons.appendChild(addFolderButton);

    // add button to open favorites in a new tab in right of the header
    var openButton = document.createElement("button");
    openButton.innerHTML = fabext_getIcon('link');
    openButton.title = "Open favorites in a new tab";
    openButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: 'open-favorites'});
    });
    headerButtons.appendChild(openButton);

    // Create the clear button in the header
    var clearButton = document.createElement("button");
    clearButton.innerHTML = fabext_getIcon('trash');
    clearButton.classList.add("favorite-popup-clear-button");
    clearButton.title = "Clear favorites";
    clearButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your favorites?')) {
            localStorage.setItem('favorites', JSON.stringify([]));
            updateStorage();
        }
    });
    headerButtons.appendChild(clearButton);

    // add button to open settings in a new tab in rigth of the header
    var openButtonSetting = document.createElement("button");
    openButtonSetting.innerHTML = fabext_getIcon('cog');
    openButtonSetting.title = "Open Settings in a new tab";
    openButtonSetting.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: 'open-settings'});
    });
    headerButtons.appendChild(openButtonSetting);

    // Create search bar
    var searchContainer = document.createElement("div");
    searchContainer.style.cssText = `
        position: relative;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;

    var searchIconWrapper = document.createElement("div");
    searchIconWrapper.innerHTML = fabext_getIcon("magnifier", "sm");
    searchIconWrapper.style.cssText = `
        position: absolute;
        left: 28px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
    `;
    searchContainer.appendChild(searchIconWrapper);

    var searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "favorite-popup-search";
    searchInput.placeholder = "Search for a product, category, date";
    searchInput.style.cssText = `
        width: 100%;
        padding: 10px 12px 10px 36px;
        background: rgba(30, 30, 30, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
    `;
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#a855f7';
        this.style.background = 'rgba(40, 40, 40, 0.9)';
    });
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        this.style.background = 'rgba(30, 30, 30, 0.8)';
    });
    searchContainer.appendChild(searchInput);
    popup.appendChild(searchContainer);

    var contentDiv = document.createElement("div");
    contentDiv.classList.add("favorite-popup-content");
    popup.appendChild(contentDiv);
    
    // Setup auto-scroll for drag and drop
    setupAutoScrollForPopup(contentDiv);

    // Search functionality
    var searchTimeout = null;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            var filter = searchInput.value.toUpperCase();
            var favorites = contentDiv.getElementsByClassName('favorite-popup-item');
            var folderSections = contentDiv.getElementsByClassName('favorite-folder-section');
            
            // If search is empty, show all
            if (filter === '') {
                for (var i = 0; i < favorites.length; i++) {
                    favorites[i].style.display = 'block';
                }
                for (var i = 0; i < folderSections.length; i++) {
                    folderSections[i].style.display = 'block';
                }
                return;
            }
            
            // Search in favorites and track which folders have matches
            var foldersWithMatches = new Set();
            
            for (var i = 0; i < favorites.length; i++) {
                var favorite = favorites[i];
                var title = favorite.querySelector('h5').textContent || '';
                var category = favorite.querySelectorAll('p')[0] ? favorite.querySelectorAll('p')[0].textContent : '';
                var date = favorite.querySelectorAll('p')[1] ? favorite.querySelectorAll('p')[1].textContent : '';
                var text = (title + ' ' + category + ' ' + date).toUpperCase();
                
                if (text.indexOf(filter) > -1) {
                    favorite.style.display = 'block';
                    // Track which folder section this favorite belongs to
                    var folderSection = favorite.closest('.favorite-folder-section');
                    if (folderSection) {
                        foldersWithMatches.add(folderSection);
                    }
                } else {
                    favorite.style.display = 'none';
                }
            }
            
            // Show/hide folder sections based on whether they have matching favorites
            for (var i = 0; i < folderSections.length; i++) {
                if (foldersWithMatches.has(folderSections[i])) {
                    folderSections[i].style.display = 'block';
                    // Auto-expand folders with matches
                    var folderContent = folderSections[i].querySelector('.favorite-folder-content');
                    if (folderContent) {
                        folderContent.style.display = 'block';
                    }
                } else {
                    folderSections[i].style.display = 'none';
                }
            }
        }, 300);
    });

    // Helper function to create folder section with header and actions
    function createFolderSection(folderData, folderFavorites, folderIndex, isUncategorized = false) {
        var sectionHeader = document.createElement("div");
        sectionHeader.classList.add("favorite-folder-header");
        sectionHeader.style.display = 'flex';
        sectionHeader.style.alignItems = 'center';
        sectionHeader.style.justifyContent = 'space-between';
        
        if (!isUncategorized) {
            sectionHeader.draggable = true;
            sectionHeader.dataset.folderId = folderData.id;
            sectionHeader.dataset.folderIndex = folderIndex;
            sectionHeader.style.borderLeftColor = folderData.color;
            sectionHeader.style.cursor = 'move';
        }
        
        var folderInfo = document.createElement('span');
        folderInfo.style.cssText = isUncategorized 
            ? 'opacity: 0.7; flex: 1; cursor: pointer;'
            : 'display: flex; align-items: center; gap: 6px; flex: 1; cursor: pointer;';
        folderInfo.classList.add(isUncategorized ? 'uncategorized-toggle' : 'folder-toggle-popup');
        
        var folderIcon = isUncategorized 
            ? fabext_getIcon('folder',"md","folder-chevron")
            : fabext_getIcon('square-grid-2x2',"xs")+' '+fabext_getIcon('folder',"md","folder-chevron");
        
        folderInfo.innerHTML = folderIcon + ' ' + folderData.name + ' (' + folderFavorites.length + ')';
        folderInfo.style.color = folderData.color;
        
        var folderActions = document.createElement('div');
        folderActions.style.cssText = 'display: flex; gap: 8px; align-items: center;';
        
        // Copy button
        var copyBtn = document.createElement('button');
        copyBtn.innerHTML = fabext_getIcon('square-on-tilted-square', 'sm');
        copyBtn.title = 'Copy all links';
        copyBtn.style.cssText = 'padding: 6px 10px; background: transparent; color: #3b82f6; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
        copyBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(59, 130, 246, 0.2)';
            this.style.transform = 'scale(1.1)';
        });
        copyBtn.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.transform = 'scale(1)';
        });
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var links = folderData.name + ":\n\n" + folderFavorites.map(function(fav) { return fav.url; }).join('\n');
            
            navigator.clipboard.writeText(links).then(function() {
                var originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '✓';
                copyBtn.style.color = '#10b981';
                setTimeout(function() {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.color = '#3b82f6';
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy links: ', err);
                alert('Failed to copy links to clipboard');
            });
        });
        folderActions.appendChild(copyBtn);
        
        // Delete button (only for non-uncategorized folders)
        if (!isUncategorized) {
            var deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = fabext_getIcon('trash', 'sm');
            deleteBtn.title = 'Delete folder';
            deleteBtn.style.cssText = 'padding: 6px 10px; background: transparent; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
            deleteBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(220, 38, 38, 0.2)';
                this.style.transform = 'scale(1.1)';
            });
            deleteBtn.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
                this.style.transform = 'scale(1)';
            });
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('Delete folder "' + folderData.name + '"? Favorites will be moved to Uncategorized.')) {
                    deleteFolder(folderData.id);
                    popup.load();
                }
            });
            folderActions.appendChild(deleteBtn);
        }
        
        sectionHeader.appendChild(folderInfo);
        sectionHeader.appendChild(folderActions);
        
        return { header: sectionHeader, toggle: folderInfo };
    }

    // Load function to load the favorites from localStorage
    popup.load = function() {
        contentDiv.innerHTML = "";
        // Reset search bar
        searchInput.value = '';
        
        var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        var folders = JSON.parse(localStorage.getItem('folders')) || [];

        // sort favorites by created_at
        favorites.sort(function(a, b) {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        // Group favorites by folder
        var uncategorizedFavorites = favorites.filter(f => !f.folder);
        var folderGroups = {};
        
        // Filter out null/undefined folders and create groups
        folders = folders.filter(f => f != null);
        
        folders.forEach(function(folder) {
            if (folder && folder.id) {
                folderGroups[folder.id] = {
                    folder: folder,
                    favorites: favorites.filter(f => f.folder === folder.id)
                };
            }
        });

        // Display uncategorized favorites first
        if (uncategorizedFavorites.length > 0) {
            var uncategorizedSection = document.createElement("div");
            uncategorizedSection.classList.add("favorite-folder-section");
            
            var uncategorizedData = {
                name: 'Uncategorized',
                color: '#888',
                id: null
            };
            
            var headerElements = createFolderSection(uncategorizedData, uncategorizedFavorites, null, true);
            var sectionHeader = headerElements.header;
            var uncategorizedToggle = headerElements.toggle;
            
            uncategorizedSection.appendChild(sectionHeader);

            var sectionContent = document.createElement("div");
            sectionContent.classList.add("favorite-folder-content");
            sectionContent.style.display = 'none'; // Fermé par défaut
            uncategorizedSection.appendChild(sectionContent);

            // Toggle accordion
            uncategorizedToggle.addEventListener('click', function() {
                var chevron = sectionHeader.querySelector('.folder-chevron');
                if (sectionContent.style.display === 'none') {
                    sectionContent.style.display = 'block';
                    chevron.classList.remove('edsicon-folder');
                    chevron.classList.add('edsicon-folder-filled');
                } else {
                    sectionContent.style.display = 'none';
                    chevron.classList.remove('edsicon-folder-filled');
                    chevron.classList.add('edsicon-folder');
                }
            });

            // Add drop zone for uncategorized
            sectionHeader.addEventListener('dragover', function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                this.style.background = 'rgba(255,255,255,0.15)';
                return false;
            });

            sectionHeader.addEventListener('dragleave', function(e) {
                this.style.background = '';
            });

            sectionHeader.addEventListener('drop', function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.preventDefault();
                this.style.background = '';

                var draggedType = e.dataTransfer.getData('type');
                
                if (draggedType === 'favorite') {
                    var favoriteUrl = e.dataTransfer.getData('favoriteUrl');
                    moveFavoriteToFolder(favoriteUrl, null); // null = uncategorized
                    popup.load();
                }

                return false;
            });

            uncategorizedFavorites.forEach(function(favorite) {
                sectionContent.appendChild(createFavoriteItem(favorite));
            });

            contentDiv.appendChild(uncategorizedSection);
        }

        // Display folders with their favorites (show all folders even if empty)
        folders.forEach(function(folder, folderIndex) {
            if (!folder || !folder.id) return; // Skip null/invalid folders
            
            var folderSection = document.createElement("div");
            folderSection.classList.add("favorite-folder-section");
            
            var folderData = {
                name: folder.name,
                color: folder.color,
                id: folder.id
            };
            
            var headerElements = createFolderSection(folderData, folderGroups[folder.id].favorites, folderIndex, false);
            var sectionHeader = headerElements.header;
            var folderToggle = headerElements.toggle;
            
            folderSection.appendChild(sectionHeader);
            
            // Drag and drop handlers
            sectionHeader.addEventListener('dragstart', function(e) {
                var dragType = e.dataTransfer.types;
                // Only allow folder dragging if not dragging a favorite
                if (!dragType.includes('favoriteurl')) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('folderId', this.dataset.folderId);
                    e.dataTransfer.setData('folderIndex', this.dataset.folderIndex);
                    e.dataTransfer.setData('type', 'folder');
                    this.style.opacity = '0.5';
                }
            });

            sectionHeader.addEventListener('dragend', function(e) {
                this.style.opacity = '1';
            });

            sectionHeader.addEventListener('dragover', function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                this.style.background = 'rgba(255,255,255,0.15)';
                return false;
            });

            sectionHeader.addEventListener('dragleave', function(e) {
                this.style.background = '';
            });

            sectionHeader.addEventListener('drop', function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.preventDefault();
                this.style.background = '';

                var draggedType = e.dataTransfer.getData('type');
                
                // Handle favorite drop
                if (draggedType === 'favorite') {
                    var favoriteUrl = e.dataTransfer.getData('favoriteUrl');
                    var targetFolderId = this.dataset.folderId;
                    
                    moveFavoriteToFolder(favoriteUrl, targetFolderId);
                    popup.load();
                    return false;
                }

                // Handle folder reordering
                var draggedIndex = parseInt(e.dataTransfer.getData('folderIndex'));
                var targetIndex = parseInt(this.dataset.folderIndex);

                if (draggedIndex !== targetIndex) {
                    // Reorder folders
                    var draggedFolder = folders[draggedIndex];
                    folders.splice(draggedIndex, 1);
                    folders.splice(targetIndex, 0, draggedFolder);

                    // Save reordered folders
                    localStorage.setItem('folders', JSON.stringify(folders));
                    updateStorage();
                    popup.load();
                }

                return false;
            });

            var sectionContent = document.createElement("div");
            sectionContent.classList.add("favorite-folder-content");
            sectionContent.style.display = 'none'; // Fermé par défaut
            folderSection.appendChild(sectionContent);

            // Toggle folder content on click (accordion)
            folderToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                var chevron = sectionHeader.querySelector('.folder-chevron');
                if (sectionContent.style.display === 'none') {
                    sectionContent.style.display = 'block';
                    chevron.classList.remove('edsicon-folder');
                    chevron.classList.add('edsicon-folder-filled');
                } else {
                    sectionContent.style.display = 'none';
                    chevron.classList.remove('edsicon-folder-filled');
                    chevron.classList.add('edsicon-folder');
                }
            });

            folderGroups[folder.id].favorites.forEach(function(favorite) {
                sectionContent.appendChild(createFavoriteItem(favorite));
            });

            contentDiv.appendChild(folderSection);
        });
    }

    // Helper function to create favorite item
    function createFavoriteItem(favorite) {
        var card = document.createElement("a");
        var url = favorite.url.split('https://www.fab.com')[2] || favorite.url;
        card.href = url;
        card.target = '_blank';
        card.classList.add("favorite-popup-item");
        card.draggable = true;
        card.dataset.favoriteUrl = favorite.url;
        card.dataset.favoriteId = favorite.id;
        
        // Apply modern card styles
        card.style.cssText = `
            display: block;
            background: rgba(17, 17, 17, 0.9);
            backdrop-filter: blur(10px);
            border: 2px solid #374151;
            border-radius: 12px;
            padding: 10px;
            transition: all 0.3s ease;
            text-decoration: none;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
            margin-bottom: 8px;
            cursor: grab;
        `;

        var cardRow = document.createElement('div');
        cardRow.style.cssText = 'display: flex; align-items: center; gap: 12px;';

        // Image
        var img = document.createElement('img');
        img.src = favorite.image;
        img.alt = favorite.title;
        img.style.cssText = `
            width: 80px !important;
            height: 80px !important;
            object-fit: cover;
            border-radius: 8px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(55, 65, 81, 0.5);
        `;
        cardRow.appendChild(img);

        // Text container
        var textContainer = document.createElement('div');
        textContainer.style.cssText = 'flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;';

        // Header with title and remove button
        var cardHeader = document.createElement('div');
        cardHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: start; gap: 8px;';

        var cardTitle = document.createElement('h5');
        cardTitle.textContent = favorite.title;
        cardTitle.style.cssText = `
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            line-height: 1.3;
        `;

        var removeButton = document.createElement('button');
        removeButton.innerHTML = fabext_getIcon('heart-filled', 'sm');
        removeButton.title = "Remove from favorites";
        removeButton.style.cssText = `
            flex-shrink: 0;
            padding: 8px;
            background: transparent;
            border: none;
            color: #ef4444;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        removeButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.background = 'rgba(239, 68, 68, 0.2)';
        });
        removeButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = 'transparent';
        });
        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            removeFavorite(favorite.url, true);
            popup.load();
        });

        cardHeader.appendChild(cardTitle);
        cardHeader.appendChild(removeButton);
        textContainer.appendChild(cardHeader);

        // Category
        var cardCategory = document.createElement('p');
        cardCategory.textContent = favorite.category;
        cardCategory.style.cssText = `
            color: #9ca3af;
            font-size: 11px;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        textContainer.appendChild(cardCategory);

        // Created at
        var cardCreatedAt = document.createElement('p');
        cardCreatedAt.textContent = "Favorited on: " + (new Date(favorite.created_at).toLocaleString());
        cardCreatedAt.style.cssText = `
            color: #6b7280;
            font-size: 10px;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        textContainer.appendChild(cardCreatedAt);

        cardRow.appendChild(textContainer);
        card.appendChild(cardRow);

        // Hover effect
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = '#a855f7';
            this.style.transform = 'translateY(-2px) scale(1.01)';
            this.style.boxShadow = '0 20px 25px -5px rgba(168, 85, 247, 0.2), 0 10px 10px -5px rgba(168, 85, 247, 0.15)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '#374151';
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)';
        });

        // Drag and drop handlers for favorites
        card.addEventListener('dragstart', function(e) {
            e.stopPropagation();
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('favoriteUrl', this.dataset.favoriteUrl);
            e.dataTransfer.setData('favoriteId', this.dataset.favoriteId);
            e.dataTransfer.setData('type', 'favorite');
            this.style.opacity = '0.5';
            this.style.cursor = 'grabbing';
        });

        card.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            this.style.cursor = 'grab';
        });

        // Prevent default link behavior when dragging
        card.addEventListener('click', function(e) {
            if (card.dataset.isDragging === 'true') {
                e.preventDefault();
                card.dataset.isDragging = 'false';
            }
        });

        // Add context menu for moving to folder
        card.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showMoveToFolderContextMenu(e, favorite);
        });

        return card;
    }

    // Helper function to show context menu for moving favorite to folder
    function showMoveToFolderContextMenu(event, favorite) {
        // Remove existing context menu if any
        var existingMenu = document.getElementById('folder-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        var contextMenu = document.createElement('div');
        contextMenu.id = 'folder-context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            min-width: 200px;
        `;

        var menuHeader = document.createElement('div');
        menuHeader.textContent = 'Move to folder';
        menuHeader.style.cssText = `
            padding: 8px 12px;
            color: #888;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        `;
        contextMenu.appendChild(menuHeader);

        var folders = JSON.parse(localStorage.getItem('folders')) || [];

        // Option: Move to uncategorized
        var uncategorizedOption = document.createElement('div');
        uncategorizedOption.innerHTML = fabext_getIcon('folder', 'sm') + ' Uncategorized';
        uncategorizedOption.style.cssText = `
            padding: 8px 12px;
            color: #fff;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            transition: background 0.2s;
        `;
        uncategorizedOption.addEventListener('mouseenter', function() {
            this.style.background = '#2a2a2a';
        });
        uncategorizedOption.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
        uncategorizedOption.addEventListener('click', function() {
            moveFavoriteToFolder(favorite.url, null);
            contextMenu.remove();
            popup.load();
        });
        contextMenu.appendChild(uncategorizedOption);

        // Display folders
        folders.forEach(function(folder) {
            if (!folder || !folder.id) return; // Skip null/invalid folders
            
            var folderOption = document.createElement('div');
            folderOption.innerHTML = fabext_getIcon('folder-filled', 'sm') + ' ' + folder.name;
            folderOption.style.cssText = `
                padding: 8px 12px;
                color: ${folder.color};
                cursor: pointer;
                border-radius: 6px;
                font-size: 14px;
                transition: background 0.2s;
            `;
            folderOption.addEventListener('mouseenter', function() {
                this.style.background = '#2a2a2a';
            });
            folderOption.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
            });
            folderOption.addEventListener('click', function() {
                moveFavoriteToFolder(favorite.url, folder.id);
                contextMenu.remove();
                popup.load();
            });
            contextMenu.appendChild(folderOption);
        });

        document.body.appendChild(contextMenu);

        // Close context menu on click outside
        setTimeout(function() {
            document.addEventListener('click', function closeMenu() {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    }

    popup.load()

    return popup;
}

function addFavoriteButtonToNavbar() {
    if (getSetting("Favorites_State",true) == false) return;

    if (document.getElementById('favorite-button') === null) {
        var actions = document.querySelector('.fabkit-MegaMenu-actions');
        if (actions) {
            var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

            var spanFavorite = document.createElement("span");
            spanFavorite.classList.add("fabkit-StickyElement-root", "fabkit-StickyElement--top-right", "fabkit-StickyElement--show");

            var favoriteButton = document.createElement("button");
            favoriteButton.innerHTML = fabext_getIcon('heart');
            favoriteButton.id = "favorite-button";
            favoriteButton.classList.add("fabkit-Button-root", "fabkit-Button--icon", "fabkit-Button--sm", "fabkit-Button--ghost", "fabkit-MegaMenu-iconButton");
            favoriteButton.type = "button";
            favoriteButton.setAttribute("aria-label", "Favorites");
            favoriteButton.title = "Favorites";
            spanFavorite.appendChild(favoriteButton);

            var badge = document.createElement("span");
            badge.classList.add("fabkit-Badge-root", "fabkit-Badge--filled", "fabkit-Badge--primary", "fabkit-Badge--sm", "Slx1EfM1", "fabkit-StickyElement-element");
            badge.id = "favorite-badge";
            badge.innerText = favorites.length;
            badge.style.transform = "translate(6px, -2px)";
            badge.style.pointerEvents = "none";
            spanFavorite.appendChild(badge);
            
            var popup = createFavoritePopup()
            
            // Add event listener to the favoriteButton to show or hide the popup
            var hideTimeout;
            favoriteButton.addEventListener('mouseenter', function() {
                clearTimeout(hideTimeout);
                popup.style.display = 'flex';
            });

            favoriteButton.addEventListener('mouseleave', function() {
                hideTimeout = setTimeout(function() {
                    popup.style.display = 'none';
                }, 100);
            });

            // Add event listener to the popup to show or hide the popup
            popup.addEventListener('mouseenter', function() {
                clearTimeout(hideTimeout);
                popup.style.display = 'flex';
            });

            popup.addEventListener('mouseleave', function() {
                hideTimeout = setTimeout(function() {
                    popup.style.display = 'none';
                }, 100);
            });

            actions.insertBefore(spanFavorite, actions.firstChild);
            document.querySelector("body").appendChild(popup);
        }
    }
}

function addFavoriteButtonProduct() {
    if (getSetting("Favorites_State",true) == false) return;

    if (document.getElementById('product-heartButton') === null) {
        var productTitle = document.querySelector('.fabkit-Stack-root.fabkit-Stack--align_start.fabkit-scale--gapX-layout-6.fabkit-scale--gapY-layout-6.fabkit-Stack--column > .fabkit-Typography-root.fabkit-Typography--align-start.fabkit-Typography--intent-primary.fabkit-Heading--lg');
        if (productTitle) {
            var currentDiv = productTitle.parentNode;
            
            var heartButton = document.createElement("button");
            // heartButton.innerHTML = fabext_getIcon('heart', 'md');
            heartButton.id = "product-heartButton";
            heartButton.classList.add("fabkit-Button-root", "fabkit-Button--icon", "fabkit-Button--sm", "fabkit-Button--ghost", "fabkit-MegaMenu-iconButton");
            heartButton.type = "button";
            heartButton.setAttribute("aria-label", "Add to favorite");
            heartButton.title = "Add to favorite";
            heartButton.dataset.url = window.location.href;

            // Add data attributes to the heartButton
            var category = "";
            var breadcrumb = document.getElementsByClassName("fabkit-Breadcrumb-root")[0];
            for (var i = 0; i < breadcrumb.children[0].children.length; i++) {
                if (breadcrumb.children[0].children[i].classList.contains("fabkit-Breadcrumb-separator")) continue;

                category += breadcrumb.children[0].children[i].innerText;
                if (i < breadcrumb.children[0].children.length - 1) {
                    category += " > ";
                }
            }

            heartButton.dataset.category = category;
            heartButton.dataset.title = document.title.replace(" | Fab", "");
            heartButton.dataset.image = document.getElementsByClassName("fabkit-Thumbnail-root fabkit-Thumbnail--16/9 fabkit-scale--radius-4")[0].children[0].src;

            // span
            var span = document.createElement("span");
            span.classList.add("fabkit-Button-label");
            span.innerHTML = fabext_getIcon('heart','md');
            heartButton.appendChild(span);

            // Add event listener to the heartButton to add or remove favorite
            heartButton.addEventListener('click', function(e) {
                e.preventDefault();

                var currentUrl = window.location.href;
                if (isInFavorite(currentUrl)) {
                    removeFavorite(currentUrl,true);
                } else {
                    // Show folder selection modal when adding to favorites
                    showFolderSelectionModal(heartButton, currentUrl);
                }
                updateHeartButton(heartButton, currentUrl,true);
            });

            var newDiv = document.createElement("div");
            newDiv.style.display = "flex";
            newDiv.appendChild(heartButton);
            newDiv.appendChild(productTitle);

            if (currentDiv.contains(productTitle)) {
                currentDiv.insertBefore(newDiv, productTitle);
            } else {
                currentDiv.appendChild(newDiv);
            }
            
            
            updateHeartButton(heartButton, window.location.href,true)
        }
    }
}

function addFavoriteButtonThumbnail(thumbnail) {
    if (getSetting("Favorites_State",true) == false) return;

    if (thumbnail && thumbnail.querySelector('#thumbnail-heartButton') === null) {
        var parent = thumbnail.parentElement;
        var currentUrl = parent.querySelector('.fabkit-Thumbnail-overlay');
        if (!currentUrl) return;
        currentUrl = currentUrl.href;

        const categoryElement = parent.parentElement.querySelector('.fabkit-Thumbnail-item.fabkit-Thumbnail--bottom-left > .fabkit-Badge-root.fabkit-Badge--filled.fabkit-Badge--gray.fabkit-Badge--md.fabkit-Badge--blurify > .fabkit-Badge-label');
        if (!categoryElement) return;

        var heartButton = document.createElement("button");
        var topRight = thumbnail.querySelector('.fabkit-Thumbnail-item.fabkit-Thumbnail--top-right')

        // Create topRight div if it doesn't exist
        if (topRight === null) {
            var topRight = document.createElement("div");
            topRight.classList.add("fabkit-Thumbnail-item", "fabkit-Thumbnail--top-right", "Cla8eRIg", "N2MpToNm");
            thumbnail.appendChild(topRight);
        }

        heartButton.classList.add("fabkit-Button-root", "fabkit-Button--icon", "fabkit-Button--rounded", "fabkit-Button--sm", "fabkit-Button--blurry");
        heartButton.id = "thumbnail-heartButton";
        heartButton.type = "button";
        heartButton.style.marginLeft = "5px";
        heartButton.setAttribute("aria-label", "Add to favorite");
        heartButton.title = "Add to favorite";

        // Add data attributes to the heartButton
        heartButton.dataset.category = categoryElement.innerText;
        heartButton.dataset.category = heartButton.dataset.category.split('\n').pop();
        heartButton.dataset.title = parent.parentElement.querySelector('.fabkit-Typography-ellipsisWrapper').innerText;
        heartButton.dataset.image = parent.querySelector('img').src;

        var span = document.createElement("span");
        span.classList.add("fabkit-Button-label");
        span.innerHTML = fabext_getIcon('heart','sm');


        // Add event listener to the heartButton to add or remove favorite
        heartButton.addEventListener('click', function(e) {
            e.stopPropagation();

            if (isInFavorite(currentUrl)) {
                removeFavorite(currentUrl,true);
            } else {
                // Show folder selection modal when adding to favorites
                showFolderSelectionModal(heartButton, currentUrl);
            }
            updateHeartButton(heartButton, currentUrl);
        });
        updateHeartButton(heartButton, currentUrl)


        heartButton.appendChild(span);
        topRight.appendChild(heartButton);
    }
}

// ========== FOLDER SELECTION MODAL ==========

function showFolderSelectionModal(heartButton, url) {
    // Remove any existing modal first
    var existingModal = document.getElementById('folder-selection-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    var modal = document.createElement("div");
    modal.id = "folder-selection-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
    `;

    var modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background: #1a1a1a;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;

    var modalHeader = document.createElement("h3");
    modalHeader.textContent = "Save to folder";
    modalHeader.style.cssText = `
        margin: 0 0 16px 0;
        color: #fff;
        font-size: 20px;
        font-weight: 600;
    `;
    modalContent.appendChild(modalHeader);

    var folders = getFolders();
    
    // Option: Save without folder
    var uncategorizedOption = createFolderOption({name: fabext_getIcon('folder', 'sm') + ' Uncategorized', id: null, color: "#888"});
    uncategorizedOption.addEventListener('click', function() {
        saveFavorite(heartButton, url, true, null);
        document.body.removeChild(modal);
    });
    modalContent.appendChild(uncategorizedOption);

    // Display existing folders
    folders.forEach(function(folder) {
        if (!folder || !folder.id) return; // Skip null/invalid folders
        
        var folderOption = createFolderOption(folder);
        folderOption.addEventListener('click', function() {
            saveFavorite(heartButton, url, true, folder.id);
            document.body.removeChild(modal);
        });
        modalContent.appendChild(folderOption);
    });

    // Create new folder button
    var createNewBtn = document.createElement("button");
    createNewBtn.innerHTML = '+ Create new folder';
    createNewBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        margin-top: 12px;
        background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: transform 0.2s;
    `;
    createNewBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
    });
    createNewBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    createNewBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
        showCreateFolderModal(function(newFolder) {
            saveFavorite(heartButton, url, true, newFolder.id);
        });
    });
    modalContent.appendChild(createNewBtn);

    // Cancel button
    var cancelBtn = document.createElement("button");
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        margin-top: 8px;
        background: transparent;
        color: #888;
        border: 1px solid #333;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    `;
    cancelBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.05)';
    });
    cancelBtn.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
    });
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    modalContent.appendChild(cancelBtn);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function createFolderOption(folder) {
    var option = document.createElement("div");
    option.style.cssText = `
        padding: 12px 16px;
        margin: 8px 0;
        background: #2a2a2a;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 4px solid ${folder.color};
        color: #fff;
        font-size: 14px;
    `;
    option.innerHTML = folder.id ? fabext_getIcon('folder-filled', 'sm') + ' ' + folder.name : folder.name;
    
    option.addEventListener('mouseenter', function() {
        this.style.background = '#333';
        this.style.transform = 'translateX(4px)';
    });
    option.addEventListener('mouseleave', function() {
        this.style.background = '#2a2a2a';
        this.style.transform = 'translateX(0)';
    });

    return option;
}

function showCreateFolderModal(callback) {
    // Remove any existing modal first
    var existingModal = document.getElementById('create-folder-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    var modal = document.createElement("div");
    modal.id = "create-folder-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
    `;

    var modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background: #1a1a1a;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;

    var modalHeader = document.createElement("h3");
    modalHeader.textContent = "Create new folder";
    modalHeader.style.cssText = `
        margin: 0 0 16px 0;
        color: #fff;
        font-size: 20px;
        font-weight: 600;
    `;
    modalContent.appendChild(modalHeader);

    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Folder name";
    nameInput.style.cssText = `
        width: 100%;
        padding: 12px;
        margin-bottom: 12px;
        background: #2a2a2a;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
    `;
    modalContent.appendChild(nameInput);

    var colorLabel = document.createElement("label");
    colorLabel.textContent = "Folder color";
    colorLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        color: #888;
        font-size: 14px;
    `;
    modalContent.appendChild(colorLabel);

    var colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = "#8B5CF6";
    colorPicker.style.cssText = `
        width: 100%;
        height: 50px;
        margin-bottom: 16px;
        border: 1px solid #333;
        border-radius: 8px;
        cursor: pointer;
    `;
    modalContent.appendChild(colorPicker);

    var createBtn = document.createElement("button");
    createBtn.textContent = 'Create';
    createBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
    `;
    createBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
    });
    createBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    createBtn.addEventListener('click', function() {
        var name = nameInput.value.trim();
        if (name) {
            var newFolder = createFolder(name, colorPicker.value);
            document.body.removeChild(modal);
            if (callback) callback(newFolder);
        } else {
            nameInput.style.borderColor = 'red';
            setTimeout(function() {
                nameInput.style.borderColor = '#333';
            }, 2000);
        }
    });
    modalContent.appendChild(createBtn);

    var cancelBtn = document.createElement("button");
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        margin-top: 8px;
        background: transparent;
        color: #888;
        border: 1px solid #333;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    `;
    cancelBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.05)';
    });
    cancelBtn.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
    });
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    modalContent.appendChild(cancelBtn);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // Focus name input
    nameInput.focus();
}

// Removed showFolderManagementModal - controls are now integrated directly in the UI