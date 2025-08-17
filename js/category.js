document.addEventListener('DOMContentLoaded', function() {
    // Global variables for pagination
    let currentPage = 1;
    let itemsPerPage = 12;
    let currentProducts = [];
    let allProducts = []; // Store original products for filter reset
    let currentCategory = '';
    
    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || '';
    
    // Load products and filters
    Promise.all([
        fetch('../data/products.json').then(res => res.json()),
        fetch('../data/data.json').then(res => res.json())
    ])
    .then(([productsData, siteData]) => {
        allProducts = productsData.products;
        
        // Filter products by category
        if (currentCategory) {
            currentProducts = allProducts.filter(product => {
                // Handle both string and array categories
                if (Array.isArray(product.category)) {
                    return product.category.some(cat => cat.toLowerCase() === currentCategory.toLowerCase());
                } else {
                    return product.category.toLowerCase() === currentCategory.toLowerCase();
                }
            });
        } else {
            currentProducts = [...allProducts];
        }
        
        // Update page title and breadcrumbs
        updatePageTitle(currentCategory);
        updateBreadcrumbs(currentCategory);
        
        initProducts(currentProducts, currentPage);
        initFilters(productsData.filters, siteData.site);
        initFooter(siteData.footer, siteData.site.contact);
    })
    .catch(error => console.error('Error loading data:', error));

    // Update page title
    function updatePageTitle(category) {
        const titleElement = document.getElementById('category-title');
        if (titleElement) {
            titleElement.textContent = category ? `${category} Products` : 'All Products';
        }
        
        // Update document title
        document.title = category ? `RS Tranding Company - ${category}` : 'RS Tranding Company - All Products';
    }

    // Update breadcrumbs
    function updateBreadcrumbs(category) {
        const breadcrumbsElement = document.querySelector('.breadcrumbs');
        if (breadcrumbsElement) {
            breadcrumbsElement.innerHTML = `
                <a href="../index.html">Home</a>
                <span>/</span>
                <a href="../html/listing.html">Shop</a>
                ${category ? `<span>/</span><span>${category}</span>` : ''}
            `;
        }
    }

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

        // Update results count
        resultsCount.textContent = `Showing ${startIndex + 1}-${endIndex} of ${products.length} products`;

        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No products found in this category.</p>
                    <a href="../html/listing.html" class="btn-solid">View All Products</a>
                </div>
            `;
            updatePagination(totalPages, page, products.length);
            return;
        }

        // Create product cards
        paginatedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}">
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

        // Update results count
        const startIndex = (currentPageNum - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPageNum * itemsPerPage, totalProducts);
        resultsCount.textContent = `Showing ${startIndex}-${endIndex} of ${totalProducts} products`;

        // Clear existing pagination
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        if (currentPageNum > 1) {
            const prevBtn = document.createElement('li');
            prevBtn.innerHTML = `<a href="#" data-page="${currentPageNum - 1}">Previous</a>`;
            pagination.appendChild(prevBtn);
        }

        // Page numbers
        const startPage = Math.max(1, currentPageNum - 2);
        const endPage = Math.min(totalPages, currentPageNum + 2);

        if (startPage > 1) {
            const firstPage = document.createElement('li');
            firstPage.innerHTML = `<a href="#" data-page="1">1</a>`;
            pagination.appendChild(firstPage);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.innerHTML = '<span>...</span>';
                pagination.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('li');
            pageBtn.className = i === currentPageNum ? 'active' : '';
            pageBtn.innerHTML = `<a href="#" data-page="${i}">${i}</a>`;
            pagination.appendChild(pageBtn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('li');
                ellipsis.innerHTML = '<span>...</span>';
                pagination.appendChild(ellipsis);
            }
            
            const lastPage = document.createElement('li');
            lastPage.innerHTML = `<a href="#" data-page="${totalPages}">${totalPages}</a>`;
            pagination.appendChild(lastPage);
        }

        // Next button
        if (currentPageNum < totalPages) {
            const nextBtn = document.createElement('li');
            nextBtn.innerHTML = `<a href="#" data-page="${currentPageNum + 1}">Next</a>`;
            pagination.appendChild(nextBtn);
        }

        // Add click event listeners to pagination links
        pagination.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                initProducts(currentProducts, page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Initialize filters
    function initFilters(filters, siteData) {
        // Category filters
        const categoryFilters = document.getElementById('category-filters');
        if (categoryFilters && filters.categories) {
            categoryFilters.innerHTML = '';
            filters.categories.forEach(category => {
                const filterOption = document.createElement('label');
                filterOption.className = 'filter-option';
                filterOption.innerHTML = `
                    <input type="checkbox" value="${category}" ${category.toLowerCase() === currentCategory.toLowerCase() ? 'checked' : ''}>
                    <span>${category}</span>
                `;
                categoryFilters.appendChild(filterOption);
            });
        }

        // Material filters
        const materialChips = document.getElementById('material-chips');
        if (materialChips && filters.materials) {
            materialChips.innerHTML = '';
            filters.materials.forEach(material => {
                const chip = document.createElement('span');
                chip.className = 'filter-chip';
                chip.textContent = material;
                chip.addEventListener('click', () => {
                    chip.classList.toggle('active');
                    applyFilters();
                });
                materialChips.appendChild(chip);
            });
        }

        // Filter event listeners
        setupFilterEventListeners();
    }

    // Setup filter event listeners
    function setupFilterEventListeners() {
        // Category filter checkboxes
        document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });

        // Search input
        const searchInput = document.querySelector('.filter-search input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(applyFilters, 300));
        }

        // Sort dropdown
        const sortSelect = document.getElementById('sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }

        // Price range
        const priceRange = document.querySelector('.price-range');
        if (priceRange) {
            priceRange.addEventListener('input', debounce(applyFilters, 300));
            
            // Update price display
            priceRange.addEventListener('input', function() {
                const priceValues = document.querySelector('.price-range-values');
                if (priceValues) {
                    priceValues.innerHTML = `<span>$0</span><span>$${this.value}</span>`;
                }
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.querySelector('.clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', resetAllFilters);
        }

        // Filter toggle for mobile
        const filterToggle = document.getElementById('filterToggle');
        const filterSidebar = document.getElementById('filterSidebar');
        if (filterToggle && filterSidebar) {
            filterToggle.addEventListener('click', () => {
                filterSidebar.classList.toggle('active');
            });
        }
    }

    // Apply filters
    function applyFilters() {
        let filteredProducts = [...allProducts];

        // Apply category filter first (maintain current category if set)
        if (currentCategory) {
            filteredProducts = filteredProducts.filter(product => {
                if (Array.isArray(product.category)) {
                    return product.category.some(cat => cat.toLowerCase() === currentCategory.toLowerCase());
                } else {
                    return product.category.toLowerCase() === currentCategory.toLowerCase();
                }
            });
        }

        // Additional category filters from checkboxes
        const selectedCategories = Array.from(document.querySelectorAll('#category-filters input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        if (selectedCategories.length > 0 && !currentCategory) {
            filteredProducts = filteredProducts.filter(product => {
                if (Array.isArray(product.category)) {
                    return product.category.some(cat => selectedCategories.includes(cat));
                } else {
                    return selectedCategories.includes(product.category);
                }
            });
        }

        // Material filter
        const selectedMaterials = Array.from(document.querySelectorAll('.filter-chip.active'))
            .map(chip => chip.textContent);
        
        if (selectedMaterials.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                selectedMaterials.includes(product.material)
            );
        }

        // Search filter
        const searchTerm = document.querySelector('.filter-search input')?.value.toLowerCase();
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        // Price filter
        const maxPrice = document.querySelector('.price-range')?.value;
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(product => {
                const price = product.salePrice || product.price;
                return price <= parseFloat(maxPrice);
            });
        }

        // Sort products
        const sortBy = document.getElementById('sort')?.value;
        if (sortBy) {
            switch (sortBy) {
                case 'price-low':
                    filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
                    break;
                default:
                    // Keep original order for relevance
                    break;
            }
        }

        currentProducts = filteredProducts;
        initProducts(currentProducts, 1); // Reset to first page
    }

    // Reset all filters
    function resetAllFilters() {
        // Clear checkboxes
        document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.value.toLowerCase() === currentCategory.toLowerCase();
        });

        // Clear material chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        // Clear search
        const searchInput = document.querySelector('.filter-search input');
        if (searchInput) searchInput.value = '';

        // Reset price range
        const priceRange = document.querySelector('.price-range');
        if (priceRange) {
            priceRange.value = priceRange.max;
            const priceValues = document.querySelector('.price-range-values');
            if (priceValues) {
                priceValues.innerHTML = `<span>$0</span><span>$${priceRange.max}</span>`;
            }
        }

        // Reset sort
        const sortSelect = document.getElementById('sort');
        if (sortSelect) sortSelect.value = 'relevance';

        // Apply filters (will show category products or all products)
        applyFilters();
    }

    // Add to cart functionality
    function addToCart() {
        const toast = document.getElementById('toast');
        const cartCount = document.querySelector('.cart-count');
        
        // Update cart count
        let currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1;
        
        // Store in sessionStorage
        sessionStorage.setItem('cartCount', cartCount.textContent);
        
        // Show toast
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
        
        // Button feedback
        const button = this;
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
        }, 2000);
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // Initialize footer
    function initFooter(footerData, contactData) {
        // Shop links
        const shopLinksSection = document.querySelector('.footer-section:nth-child(1)');
        if (shopLinksSection && footerData.shopLinks) {
            const linksContainer = shopLinksSection.querySelector('h3').nextElementSibling || document.createElement('div');
            if (!shopLinksSection.contains(linksContainer)) {
                shopLinksSection.appendChild(linksContainer);
            }
            linksContainer.innerHTML = footerData.shopLinks.map(link => 
                `<a href="${link.url}">${link.name}</a>`
            ).join('');
        }

        // Categories
        const categoriesSection = document.querySelector('.footer-section:nth-child(2)');
        if (categoriesSection && footerData.categories) {
            const categoriesContainer = categoriesSection.querySelector('h3').nextElementSibling || document.createElement('div');
            if (!categoriesSection.contains(categoriesContainer)) {
                categoriesSection.appendChild(categoriesContainer);
            }
            categoriesContainer.innerHTML = footerData.categories.map(category => 
                `<a href="../html/category.html?category=${encodeURIComponent(category)}">${category}</a>`
            ).join('');
        }

        // Contact info
        const contactSection = document.querySelector('.footer-section:nth-child(3)');
        if (contactSection && contactData) {
            const contactContainer = contactSection.querySelector('h3').nextElementSibling || document.createElement('div');
            if (!contactSection.contains(contactContainer)) {
                contactSection.appendChild(contactContainer);
            }
            contactContainer.innerHTML = `
                <p>${contactData.address}</p>
                <p>Phone: ${contactData.phone}</p>
                <p>Email: ${contactData.email}</p>
            `;
        }

        // Footer bottom
        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom && footerData.copyright) {
            footerBottom.innerHTML = `<p>${footerData.copyright}</p>`;
        }
    }

    const cartCount = document.querySelector('.cart-count');
    if (cartCount && sessionStorage.getItem('cartCount')) {
        cartCount.textContent = sessionStorage.getItem('cartCount');
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize cart count on page load
    updateCartCount();
});

