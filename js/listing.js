document.addEventListener('DOMContentLoaded', function() {
    // Global variables for pagination
    let currentPage = 1;
    let itemsPerPage = 12;
    let currentProducts = [];
    let allProducts = []; // Store original products for filter reset
    
    // Load products and filters
    Promise.all([
        fetch('../data/products.json').then(res => res.json()),
        fetch('../data/data.json').then(res => res.json())
    ])
    .then(([productsData, siteData]) => {
        allProducts = productsData.products;
        currentProducts = [...allProducts]; // Copy for filtering
        initProducts(currentProducts, currentPage);
        initFilters(productsData.filters, siteData.site);
        initFooter(siteData.footer, siteData.site.contact);
    })
    .catch(error => console.error('Error loading data:', error));

    // Initialize products grid with pagination
    function initProducts(products, page) {
        const productsGrid = document.querySelector('.products-grid');
        const resultsCount = document.querySelector('.results-count');
        const pagination = document.querySelector('.pagination');
        
        if (!productsGrid || !resultsCount || !pagination) return;

        // Clear existing products
        productsGrid.innerHTML = '';

        // Calculate pagination
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, products.length);
        const paginatedProducts = products.slice(startIndex, endIndex);

        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No products found matching your criteria.</p>
                    <button class="btn-solid" id="resetFilters">Reset Filters</button>
                </div>
            `;
            const resetBtn = document.getElementById('resetFilters');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetAllFilters);
            }
            updatePagination(totalPages, page, products.length);
            return;
        }

        // Create product cards
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy" >
                </div>
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-price">
                        ${product.salePrice ? 
                            `<span class="original">₹${product.price.toFixed(2)}</span>
                             <span class="sale">₹${product.salePrice.toFixed(2)}</span>` : 
                            `₹${product.price.toFixed(2)}`
                        }
                    </div>
                    <div class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <div class="product-buttons">
                        <a href="../html/product.html?id=${product.id}" class="btn-outline">View Details</a>
                        <button class="btn-solid add-to-cart" ${product.stock <= 0 ? 'disabled' : ''} data-id="${product.id}">
                            ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

        // Add event listeners to new add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });

        // Update pagination
        updatePagination(totalPages, page, products.length);
        
        // Update current page
        currentPage = page;
    }

    // Update pagination controls
    function updatePagination(totalPages, currentPageNum, totalProducts) {
        const pagination = document.querySelector('.pagination');
        const resultsCount = document.querySelector('.results-count');
        
        if (!pagination || !resultsCount) return;
        
        pagination.innerHTML = '';
        
        if (totalPages <= 1) {
            // Update results count
            const startIndex = totalProducts > 0 ? 1 : 0;
            const endIndex = totalProducts;
            resultsCount.textContent = `Showing ${startIndex}–${endIndex} of ${totalProducts} products`;
            return;
        }
        
        // Previous button
        const prevItem = document.createElement('li');
        prevItem.className = 'page-item';
        if (currentPageNum === 1) {
            prevItem.classList.add('disabled');
        }
        prevItem.innerHTML = `
            <a class="page-link" href="#">
                Previous
            </a>
        `;
        if (currentPageNum > 1) {
            prevItem.addEventListener('click', (e) => {
                e.preventDefault();
                initProducts(currentProducts, currentPageNum - 1);
            });
        }
        pagination.appendChild(prevItem);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPageNum - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;
        
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPageNum ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                initProducts(currentProducts, i);
            });
            pagination.appendChild(pageItem);
        }
        
        // Next button
        const nextItem = document.createElement('li');
        nextItem.className = 'page-item';
        if (currentPageNum === totalPages) {
            nextItem.classList.add('disabled');
        }
        nextItem.innerHTML = `
            <a class="page-link" href="#">
                Next
            </a>
        `;
        if (currentPageNum < totalPages) {
            nextItem.addEventListener('click', (e) => {
                e.preventDefault();
                initProducts(currentProducts, currentPageNum + 1);
            });
        }
        pagination.appendChild(nextItem);
        
        // Update results count
        const startIndex = (currentPageNum - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPageNum * itemsPerPage, totalProducts);
        resultsCount.textContent = `Showing ${startIndex}–${endIndex} of ${totalProducts} products`;
    }

    // Initialize filters
    function initFilters(filters, siteData) {
        // Set breadcrumbs
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (breadcrumbs) {
            breadcrumbs.innerHTML = `
                <a href="../index.html">Home</a>
                <span class="separator">/</span>
                <a href="#" class="active">Shop</a>
            `;
        }

        // Set shop hero title
        const heroTitle = document.querySelector('.shop-hero h1');
        const heroSubtitle = document.querySelector('.shop-hero-subtitle');
        if (heroTitle) heroTitle.textContent = siteData.title + ' Products';
        if (heroSubtitle) heroSubtitle.textContent = siteData.description;

        // Initialize category filters
        const categoryFilters = document.querySelector('#category-filters');
        if (categoryFilters && filters.categories) {
            categoryFilters.innerHTML = '';
            filters.categories.forEach(category => {
                const option = document.createElement('div');
                option.className = 'filter-option';
                option.innerHTML = `
                    <input type="checkbox" id="filter-${category.toLowerCase().replace(/\s+/g, '-')}" value="${category}">
                    <label for="filter-${category.toLowerCase().replace(/\s+/g, '-')}">${category}</label>
                `;
                categoryFilters.appendChild(option);
            });
        }

        // Initialize material chips
        const materialChips = document.querySelector('#material-chips');
        if (materialChips && filters.materials) {
            materialChips.innerHTML = '';
            filters.materials.forEach(material => {
                const chip = document.createElement('div');
                chip.className = 'filter-chip';
                chip.textContent = material;
                chip.dataset.value = material.toLowerCase();
                materialChips.appendChild(chip);
            });
        }

        // Initialize price range
        const priceRange = document.querySelector('.price-range');
        const priceValues = document.querySelector('.price-range-values');
        if (priceRange) {
            priceRange.min = 0;
            priceRange.max = 500;
            priceRange.value = 500;
            
            // Update price display
            const updatePriceDisplay = () => {
                if (priceValues) {
                    const spans = priceValues.querySelectorAll('span');
                    if (spans.length >= 2) {
                        spans[1].textContent = `$${priceRange.value}`;
                    }
                }
            };
            
            priceRange.addEventListener('input', () => {
                updatePriceDisplay();
                filterProducts();
            });
            
            updatePriceDisplay();
        }

        // Initialize sort dropdown
        const sortSelect = document.getElementById('sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', sortProducts);
        }

        // Initialize filter toggle for mobile
        const filterToggle = document.getElementById('filterToggle');
        const filterSidebar = document.getElementById('filterSidebar');
        if (filterToggle && filterSidebar) {
            filterToggle.addEventListener('click', () => {
                filterSidebar.classList.toggle('active');
                filterToggle.classList.toggle('active');
            });
        }

        // Initialize clear filters button
        const clearFilters = document.querySelector('.clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', resetAllFilters);
        }

        // Add event listeners
        document.querySelectorAll('.filter-option input').forEach(input => {
            input.addEventListener('change', filterProducts);
        });

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                this.classList.toggle('active');
                filterProducts();
            });
        });
        
        // Search input event listener
        const searchInput = document.querySelector('.filter-search input');
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }
    }

    // Filter products based on selected filters
    function filterProducts() {
        // Get filter values
        const priceRange = document.querySelector('.price-range');
        const maxPrice = priceRange ? parseFloat(priceRange.value) : 500;
        const searchInput = document.querySelector('.filter-search input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        // Get selected categories and materials
        const selectedCategories = Array.from(document.querySelectorAll('.filter-option input:checked'))
            .map(input => input.value);
        
        const selectedMaterials = Array.from(document.querySelectorAll('.filter-chip.active'))
            .map(chip => chip.textContent.trim());
        
        // Filter products from original list
        const filteredProducts = allProducts.filter(product => {
            // Search term filter
            if (searchTerm && !(
                product.name.toLowerCase().includes(searchTerm) || 
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toString().toLowerCase().includes(searchTerm))
            )) {
                return false;
            }
            
            // Price filter
            const price = product.salePrice || product.price;
            if (price > maxPrice) return false;
            
            // Category filter - handle both arrays and single values
            if (selectedCategories.length > 0) {
                if (Array.isArray(product.category)) {
                    // Product has multiple categories
                    if (!product.category.some(cat => selectedCategories.includes(cat))) {
                        return false;
                    }
                } else {
                    // Product has single category
                    if (!selectedCategories.includes(product.category)) {
                        return false;
                    }
                }
            }
            
            // Material filter - handle both arrays and single values
            if (selectedMaterials.length > 0) {
                if (Array.isArray(product.material)) {
                    // Product has multiple materials
                    if (!product.material.some(mat => selectedMaterials.includes(mat))) {
                        return false;
                    }
                } else {
                    // Product has single material
                    if (!selectedMaterials.includes(product.material)) {
                        return false;
                    }
                }
            }
            
            return true;
        });
        
        // Update current products and reset to page 1
        currentProducts = filteredProducts;
        initProducts(currentProducts, 1);
    }

    // Sort products
    function sortProducts() {
        const sortSelect = document.getElementById('sort');
        const sortValue = sortSelect ? sortSelect.value : 'relevance';
        
        let sortedProducts = [...currentProducts];
        
        switch(sortValue) {
            case 'price-low':
                sortedProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                break;
            case 'newest':
                // Assuming newer products have higher IDs
                sortedProducts.sort((a, b) => {
                    const aId = parseInt(a.id.split('-')[1]) || 0;
                    const bId = parseInt(b.id.split('-')[1]) || 0;
                    return bId - aId;
                });
                break;
            default:
                // Default is relevance (no sorting)
                break;
        }
        
        // Update current products and reset to page 1
        currentProducts = sortedProducts;
        initProducts(currentProducts, 1);
    }

    // Reset all filters
    function resetAllFilters() {
        // Uncheck all checkboxes
        document.querySelectorAll('.filter-option input').forEach(input => {
            input.checked = false;
        });
        
        // Remove active class from chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        
        // Reset price range
        const priceRange = document.querySelector('.price-range');
        if (priceRange) {
            priceRange.value = priceRange.max;
            // Update price display
            const priceValues = document.querySelector('.price-range-values');
            if (priceValues) {
                const spans = priceValues.querySelectorAll('span');
                if (spans.length >= 2) {
                    spans[1].textContent = `$${priceRange.value}`;
                }
            }
        }
        
        // Reset sort dropdown
        const sortSelect = document.getElementById('sort');
        if (sortSelect) {
            sortSelect.value = 'relevance';
        }
        
        // Reset search input
        const searchInput = document.querySelector('.filter-search input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset to all products
        currentProducts = [...allProducts];
        initProducts(currentProducts, 1);
    }

    // Add to cart function
    function addToCart() {
        const id = this.dataset.id; // from button
        // Prefer the master list if available; fall back to currentProducts/allProducts variables
        const source = (typeof allProducts !== 'undefined' && allProducts.length) ? allProducts
                    : (typeof currentProducts !== 'undefined' && currentProducts.length) ? currentProducts
                    : [];
        const product = source.find(p => p.id === id);
        if (!product) { console.warn('Product not found for cart:', id); return; }

        // Build cart item
        const item = {
            id: product.id,
            name: product.name,
            price: (product.salePrice ?? product.price) || 0,
            qty: 1,
            thumbnail: (product.images && product.images[0]) || '',
            specs: [
            product.meshSize ? `Mesh: ${product.meshSize}` : null,
            product.type ? `Type: ${product.type}` : null
            ].filter(Boolean)
        };

        // Get and update session cart
        let cart = [];
        try { cart = JSON.parse(sessionStorage.getItem('cartItems') || '[]'); } catch { cart = []; }
        const idx = cart.findIndex(it => it.id === item.id);
        if (idx >= 0) {
            cart[idx].qty += 1;
        } else {
            cart.push(item);
        }
        sessionStorage.setItem('cartItems', JSON.stringify(cart));

        // Update count badge
        const totalCount = cart.reduce((n, it) => n + it.qty, 0);
        sessionStorage.setItem('cartCount', String(totalCount));
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = String(totalCount);

        // Toast & button feedback
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = 'Added to cart';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
        const btn = this;
        const originalText = btn.textContent;
        const originalBg = btn.style.background;
        btn.textContent = 'Added!';
        btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = originalBg || 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
        }, 1200);
    }

    
    // Initialize footer
    function initFooter(footer, contact) {
        const footerContent = document.querySelector('.footer-content');
        if (!footerContent) return;
        
        // Clear existing footer sections
        const sections = footerContent.querySelectorAll('.footer-section');
        sections.forEach(section => {
            if (!section.querySelector('.newsletter')) {
                section.innerHTML = '';
            }
        });
        
        // Update contact info
        if (sections[2] && contact) {
            sections[2].innerHTML = `
                <h3>Contact Info</h3>
                <a href="mailto:${contact.email}">${contact.email}</a>
                <a href="tel:${contact.phone}">${contact.phone}</a>
                <a href="#">${contact.address}</a>
                <a href="#">${contact.hours}</a>
            `;
        }
        
        // Update shop links
        const shopSection = sections[0];
        if (shopSection) {
            shopSection.innerHTML = '<h3>Shop Links</h3>';
            footer.shopLinks.forEach(link => {
                shopSection.innerHTML += `<a href="${link.link}">${link.name}</a>`;
            });
        }
        
        // Update categories
        if (sections[1] && footer && footer.categories) {
            sections[1].innerHTML = '<h3>Categories</h3>';
            footer.categories.forEach(category => {
                const a = document.createElement('a');
                a.href = category.url;
                a.textContent = category.name;
                sections[1].appendChild(a);
            });
        }
        
        // Update footer bottom
        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom) {
            footerBottom.innerHTML = `
                <p>&copy; ${new Date().getFullYear()} R S Tranding Company. All rights reserved. | Privacy Policy | Terms of Service</p>
            `;
        }
    }
});