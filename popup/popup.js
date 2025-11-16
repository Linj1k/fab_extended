var searchTimeout = null;
var autoScrollInterval = null;

// Auto-scroll function for drag and drop
function setupAutoScroll(container) {
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
    container.addEventListener('dragleave', function() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    });

    container.addEventListener('drop', function() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const versionElement = document.getElementById('version');
    if (versionElement) {
        versionElement.textContent = chrome.runtime.getManifest().version;
    }

    const favoritesList = document.getElementById('favorites-list');
    
    // Setup auto-scroll for drag and drop
    if (favoritesList) {
        setupAutoScroll(favoritesList);
    }

    // Add event listener to the "openInNewTab Favorites" button
    const openInNewTab = document.getElementById('openInNewTab');
    if (openInNewTab) {
        openInNewTab.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: 'open-favorites'});
        });
    }

    // Add event listener to the "openSettings" button
    const openSettings = document.getElementById('openSettings');
    if (openSettings) {
        openSettings.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: 'open-settings'});
        });
    }

    // Add event listener to the "add folder" button in popup.html
    const addFolderBtnPopup = document.getElementById('add-folder-btn-popup');
    if (addFolderBtnPopup) {
        addFolderBtnPopup.addEventListener('click', function() {
            showCreateFolderModal(function() {
                location.reload();
            });
        });
    }

    // Add event listener to the "add folder" button in page.html
    const addFolderBtn = document.getElementById('add-folder-btn');
    if (addFolderBtn) {
        addFolderBtn.addEventListener('click', function() {
            showCreateFolderModal(function() {
                location.reload();
            });
        });
    }
    

    // Get the favorites from the storage
    chrome.storage.sync.get(['favorites', 'folders'], function(data) {
        // Get the favorites and folders from the storage
        var favorites = JSON.parse(data.favorites) || [];
        var folders = JSON.parse(data.folders) || [];
    
        // Update the amount of favorites
        var favAmount = document.getElementById('fav-amount');
        if (!favAmount) return;
        favAmount.textContent = favorites.length;
    
        // Update the favorites list
        var favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;
        favoritesList.innerHTML = '';
    
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
            var uncategorizedHeader = document.createElement('div');
            uncategorizedHeader.classList.add('favorite-folder-header');
            uncategorizedHeader.style.cssText = `
                margin-top: 20px;
                margin-bottom: 12px;
                padding: 8px 16px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                border-left: 4px solid #888;
                cursor: pointer;
                transition: all 0.2s;
            `;
            uncategorizedHeader.innerHTML = `
                <span style="color: #888; font-weight: 600; font-size: 14px;">
                    <i class="fa-solid fa-chevron-right folder-chevron"></i>
                    <i class="fa-regular fa-folder"></i> Uncategorized (${uncategorizedFavorites.length})
                </span>
            `;

            var uncategorizedList = document.createElement('div');
            uncategorizedList.style.marginBottom = '20px';
            uncategorizedList.style.display = 'none'; // Fermé par défaut
            uncategorizedList.classList.add('folder-favorites-list');

            uncategorizedHeader.addEventListener('click', function() {
                var chevron = this.querySelector('.folder-chevron');
                if (uncategorizedList.style.display === 'none') {
                    uncategorizedList.style.display = 'block';
                    chevron.classList.remove('fa-chevron-right');
                    chevron.classList.add('fa-chevron-down');
                } else {
                    uncategorizedList.style.display = 'none';
                    chevron.classList.remove('fa-chevron-down');
                    chevron.classList.add('fa-chevron-right');
                }
            });

            // Add drop zone for uncategorized
            uncategorizedHeader.addEventListener('dragover', function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                this.style.background = 'rgba(255,255,255,0.15)';
                return false;
            });

            uncategorizedHeader.addEventListener('dragleave', function(e) {
                this.style.background = 'rgba(255,255,255,0.05)';
            });

            uncategorizedHeader.addEventListener('drop', function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.preventDefault();
                this.style.background = 'rgba(255,255,255,0.05)';

                var draggedType = e.dataTransfer.getData('type');
                
                if (draggedType === 'favorite') {
                    var favoriteUrl = e.dataTransfer.getData('favoriteUrl');
                    moveFavoriteToFolder(favoriteUrl, null); // null = uncategorized
                    setTimeout(() => location.reload(), 300);
                }

                return false;
            });

            favoritesList.appendChild(uncategorizedHeader);

            uncategorizedFavorites.forEach(function(favorite) {
                uncategorizedList.appendChild(createFavoriteCard(favorite, favorites, favAmount));
            });

            favoritesList.appendChild(uncategorizedList);
        }

        // Display folders with their favorites (show all folders even if empty)
        folders.forEach(function(folder, folderIndex) {
            if (!folder || !folder.id) return; // Skip null/invalid folders
            
            var folderHeader = document.createElement('div');
            folderHeader.draggable = true;
            folderHeader.dataset.folderId = folder.id;
            folderHeader.dataset.folderIndex = folderIndex;
            folderHeader.classList.add('folder-header-draggable');
            folderHeader.style.cssText = `
                margin-top: 20px;
                margin-bottom: 12px;
                padding: 8px 16px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                border-left: 4px solid ${folder.color};
                cursor: move;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: space-between;
            `;
            
            var folderInfo = document.createElement('div');
            folderInfo.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
            `;
            
            folderInfo.innerHTML = `
                <i class="fa-solid fa-grip-vertical" style="color: #666; cursor: move;"></i>
                <span style="color: ${folder.color}; font-weight: 600; font-size: 14px; cursor: pointer;" class="folder-toggle">
                    <i class="fa-solid fa-chevron-right folder-chevron"></i>
                    <i class="fa-solid fa-folder"></i> ${folder.name} (${folderGroups[folder.id].favorites.length})
                </span>
            `;
            
            var folderActions = document.createElement('div');
            folderActions.style.cssText = `
                display: flex;
                gap: 8px;
                align-items: center;
            `;
            
            // Delete button
            var deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.title = 'Delete folder';
            deleteBtn.style.cssText = `
                padding: 6px 10px;
                background: transparent;
                color: #dc2626;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            deleteBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(220, 38, 38, 0.2)';
            });
            deleteBtn.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
            });
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('Delete folder "' + folder.name + '"? Favorites will be moved to Uncategorized.')) {
                    deleteFolder(folder.id);
                    setTimeout(() => location.reload(), 300);
                }
            });
            folderActions.appendChild(deleteBtn);
            
            folderHeader.appendChild(folderInfo);
            folderHeader.appendChild(folderActions);
            
            // Drag and drop handlers for folders
            folderHeader.addEventListener('dragstart', function(e) {
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

            folderHeader.addEventListener('dragend', function(e) {
                this.style.opacity = '1';
            });

            folderHeader.addEventListener('dragover', function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                var dragType = e.dataTransfer.types.includes('type');
                e.dataTransfer.dropEffect = 'move';
                this.style.background = 'rgba(255,255,255,0.15)';
                return false;
            });

            folderHeader.addEventListener('dragleave', function(e) {
                this.style.background = 'rgba(255,255,255,0.05)';
            });

            folderHeader.addEventListener('drop', function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.preventDefault();
                this.style.background = 'rgba(255,255,255,0.05)';

                var draggedType = e.dataTransfer.getData('type');
                
                // Handle favorite drop
                if (draggedType === 'favorite') {
                    var favoriteUrl = e.dataTransfer.getData('favoriteUrl');
                    var targetFolderId = this.dataset.folderId;
                    
                    moveFavoriteToFolder(favoriteUrl, targetFolderId);
                    setTimeout(() => location.reload(), 300);
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
                    chrome.storage.sync.set({folders: JSON.stringify(folders)}, function() {
                        console.log('Folders reordered');
                        location.reload();
                    });
                }

                return false;
            });

            var folderFavoritesList = document.createElement('div');
            folderFavoritesList.style.marginBottom = '20px';
            folderFavoritesList.style.display = 'none'; // Fermé par défaut
            folderFavoritesList.classList.add('folder-favorites-list');

            // Toggle accordion on folder name click
            var folderToggle = folderHeader.querySelector('.folder-toggle');
            folderToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                var chevron = folderHeader.querySelector('.folder-chevron');
                if (folderFavoritesList.style.display === 'none') {
                    folderFavoritesList.style.display = 'block';
                    chevron.classList.remove('fa-chevron-right');
                    chevron.classList.add('fa-chevron-down');
                } else {
                    folderFavoritesList.style.display = 'none';
                    chevron.classList.remove('fa-chevron-down');
                    chevron.classList.add('fa-chevron-right');
                }
            });

            favoritesList.appendChild(folderHeader);

            folderGroups[folder.id].favorites.forEach(function(favorite) {
                folderFavoritesList.appendChild(createFavoriteCard(favorite, favorites, favAmount));
            });

            favoritesList.appendChild(folderFavoritesList);
        });
    });

    function createFavoriteCard(favorite, favorites, favAmount) {
        const card = document.createElement('a');
        var url = favorite.url;

        card.href = url;
        card.target = '_blank';
        card.classList.add('favorite-card');
        card.draggable = true;
        card.dataset.favoriteUrl = favorite.url;
        card.dataset.favoriteId = favorite.id;

        const cardRow = document.createElement('div');
        cardRow.classList.add('flex', 'items-center', 'gap-3');

        const img = document.createElement('img');
        img.id = "favorite-image";
        img.src = favorite.image;
        img.classList.add('object-cover', 'rounded-lg', 'flex-shrink-0', "favorite-image");
        img.alt = favorite.title;
        cardRow.appendChild(img);

        const textContainer = document.createElement('div');
        textContainer.classList.add('flex-1', 'min-w-0');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('flex', 'justify-between', 'items-start', 'gap-2');

        const cardTitle = document.createElement('h5');
        cardTitle.id = "favorite-title";
        cardTitle.classList.add('text-xs', 'font-semibold', 'text-white', 'truncate', 'pr-2', 'leading-tight');
        cardTitle.textContent = favorite.title;

        const button = document.createElement('button');
        button.classList.add('flex-shrink-0', 'p-2', 'hover:scale-110', 'transition-transform', 'rounded-lg', 'hover:bg-red-500/20');
        button.title = 'Remove from favorites';
        button.setAttribute('aria-label', 'Remove from favorites');

        const icon = document.createElement('i');
        icon.classList.add('fa-solid','fa-heart','remove-icon');
        button.appendChild(icon);

        cardHeader.appendChild(cardTitle);
        cardHeader.appendChild(button);

        textContainer.appendChild(cardHeader);

        const cardText = document.createElement('p');
        cardText.id = "favorite-category";
        cardText.classList.add('text-gray-400', 'text-xs', 'mt-0.5', 'truncate');
        cardText.textContent = favorite.category;
        textContainer.appendChild(cardText);

        const cardCreatedAt = document.createElement('p');
        cardCreatedAt.id = "favorite-created-at";
        cardCreatedAt.classList.add('text-gray-500', 'truncate');
        cardCreatedAt.style.fontSize = '0.65rem';
        cardCreatedAt.textContent = "Favorited on: "+(new Date(favorite.created_at).toLocaleString());
        textContainer.appendChild(cardCreatedAt);

        cardRow.appendChild(textContainer);

        card.appendChild(cardRow);

        button.addEventListener('click', function(e) {
            e.preventDefault()
            favorites = favorites.filter(function(fav) {
                return fav.id !== favorite.id;
            });
            chrome.storage.sync.set({favorites: JSON.stringify(favorites)}, function() {
                console.log('Favorites is set to ' + JSON.stringify(favorites));
            });
            favAmount.textContent = favorites.length;
            card.remove();
        });

        // Add context menu for moving to folder
        card.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showMoveToFolderContextMenu(e, favorite);
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

        return card;
    }

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

        chrome.storage.sync.get(['folders'], function(data) {
            var folders = JSON.parse(data.folders) || [];

            // Option: Move to uncategorized
            var uncategorizedOption = document.createElement('div');
            uncategorizedOption.innerHTML = '<i class="fa-regular fa-folder"></i> Uncategorized';
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
                location.reload();
            });
            contextMenu.appendChild(uncategorizedOption);

            // Display folders
            folders.forEach(function(folder) {
                if (!folder || !folder.id) return; // Skip null/invalid folders
                
                var folderOption = document.createElement('div');
                folderOption.innerHTML = '<i class="fa-solid fa-folder"></i> ' + folder.name;
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
                    location.reload();
                });
                contextMenu.appendChild(folderOption);
            });
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

    function moveFavoriteToFolder(favoriteUrl, folderId) {
        chrome.storage.sync.get(['favorites'], function(data) {
            var favorites = JSON.parse(data.favorites) || [];
            var favoriteIndex = favorites.findIndex(f => f.url === favoriteUrl);
            if (favoriteIndex !== -1) {
                favorites[favoriteIndex].folder = folderId;
                chrome.storage.sync.set({favorites: JSON.stringify(favorites)}, function() {
                    console.log('Favorite moved to folder');
                });
            }
        });
    }

    const search = async (query) => {
        const filter = query.toUpperCase();
        const favorites = favoritesList.getElementsByTagName('a');
        const folderSections = favoritesList.querySelectorAll('.favorite-folder-header');
        const folderLists = favoritesList.querySelectorAll('.folder-favorites-list');
        
        // If search is empty, show all and keep folders closed by default
        if (filter === '') {
            for (let i = 0; i < favorites.length; i++) {
                favorites[i].style.display = 'block';
            }
            for (let i = 0; i < folderSections.length; i++) {
                folderSections[i].style.removeProperty('display');
                folderSections[i].style.display = 'flex';
            }
            for (let i = 0; i < folderLists.length; i++) {
                folderLists[i].style.removeProperty('display');
                folderLists[i].style.display = 'none';
                // Reset chevron to closed state
                const folderHeader = folderLists[i].previousElementSibling;
                if (folderHeader) {
                    const chevron = folderHeader.querySelector('.folder-chevron');
                    if (chevron) {
                        chevron.classList.remove('fa-chevron-down');
                        chevron.classList.add('fa-chevron-right');
                    }
                }
            }
            return;
        }
        
        // Track which folders have matching results
        const foldersWithMatches = new Set();
        
        for (let i = 0; i < favorites.length; i++) {
            const favorite = favorites[i];
            
            // search in all text content of the favorite
            const title = favorite.querySelector('#favorite-title').textContent;
            const category = favorite.querySelector('#favorite-category').textContent;
            const date = favorite.querySelector('#favorite-created-at').textContent;
            const text = (`${title} ${category} ${date}`).toUpperCase();

            if (text.indexOf(filter) > -1) {
                favorite.style.display = 'block';
                
                // Find the folder list this favorite belongs to
                const folderList = favorite.closest('.folder-favorites-list');
                if (folderList) {
                    foldersWithMatches.add(folderList);
                }
            } else {
                favorite.style.display = 'none';
            }
        }
        
        // Show/hide and expand/collapse folders based on matches
        for (let i = 0; i < folderLists.length; i++) {
            const folderList = folderLists[i];
            const folderHeader = folderList.previousElementSibling;
            
            if (foldersWithMatches.has(folderList)) {
                // Show folder section and expand it - force display with !important
                if (folderHeader) {
                    folderHeader.style.setProperty('display', 'flex', 'important');
                }
                folderList.style.setProperty('display', 'block', 'important');
                
                // Update chevron to show expanded state
                if (folderHeader) {
                    const chevron = folderHeader.querySelector('.folder-chevron');
                    if (chevron) {
                        chevron.classList.remove('fa-chevron-right');
                        chevron.classList.add('fa-chevron-down');
                    }
                }
            } else {
                // Hide folder section if no matches
                if (folderHeader) {
                    folderHeader.style.display = 'none';
                }
                folderList.style.display = 'none';
            }
        }
    };

    const searchBar = document.getElementById('search-input');
    if(searchBar) {
        searchBar.addEventListener('input', function() {
            // add a delay before searching to avoid searching on every key press
            clearTimeout(searchTimeout);
    
            searchTimeout = setTimeout(() => {
                search(searchBar.value);
            }, 300);
        });
    }

    // ========== FOLDER MANAGEMENT FUNCTIONS ==========

    function showCreateFolderModal(callback) {
        var modal = document.createElement("div");
        modal.id = "create-folder-modal";
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
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
        createBtn.addEventListener('click', function() {
            var name = nameInput.value.trim();
            if (name) {
                createFolder(name, colorPicker.value);
                document.body.removeChild(modal);
                if (callback) callback();
            } else {
                nameInput.style.borderColor = 'red';
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
        `;
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

    function createFolder(name, color) {
        chrome.storage.sync.get(['folders'], function(data) {
            var folders = JSON.parse(data.folders) || [];
            var newFolder = {
                id: Date.now().toString(),
                name: name,
                color: color || '#8B5CF6',
                created_at: new Date().toISOString()
            };
            folders.push(newFolder);
            chrome.storage.sync.set({folders: JSON.stringify(folders)}, function() {
                console.log('Folder created');
            });
        });
    }

    function deleteFolder(folderId) {
        chrome.storage.sync.get(['folders', 'favorites'], function(data) {
            var folders = JSON.parse(data.folders) || [];
            var favorites = JSON.parse(data.favorites) || [];
            
            // Move all favorites from this folder to uncategorized (null)
            favorites = favorites.map(function(favorite) {
                if (favorite.folder === folderId) {
                    favorite.folder = null;
                }
                return favorite;
            });
            
            // Remove the folder
            folders = folders.filter(f => f.id !== folderId);
            
            chrome.storage.sync.set({
                folders: JSON.stringify(folders),
                favorites: JSON.stringify(favorites)
            }, function() {
                console.log('Folder deleted');
            });
        });
    }
});