document.addEventListener('DOMContentLoaded', function() {
    // Load products and filters
    Promise.all([
        fetch('../data/products.json').then(res => res.json()),
        fetch('../data/data.json').then(res => res.json())
    ])
    .then(([productsData, siteData]) => {
        initProducts(productsData.products);
        initFilters(productsData.filters, siteData.site);
        initCart();
    })
    .catch(error => console.error('Error loading data:', error));

    // Initialize products grid
    function initProducts(products) {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        // Clear existing products
        productsGrid.innerHTML = '';

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No products found matching your criteria.</p>
                    <button class="btn-solid" id="resetFilters">Reset Filters</button>
                </div>
            `;
            document.getElementById('resetFilters').addEventListener('click', resetAllFilters);
            return;
        }

        // Create product cards
        products.forEach(product => {
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
                            `<span class="original">$${product.price.toFixed(2)}</span>
                             <span class="sale">$${product.salePrice.toFixed(2)}</span>` : 
                            `$${product.price.toFixed(2)}`
                        }
                    </div>
                    <div class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <div class="product-buttons">
                        <a href="product.html?id=${product.id}" class="btn-outline">View Details</a>
                        <button class="btn-solid add-to-cart" ${product.stock <= 0 ? 'disabled' : ''}>
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
    }

    // Initialize filters
    function initFilters(filters, siteData) {
        // Set breadcrumbs
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (breadcrumbs) {
            breadcrumbs.innerHTML = `
                <a href="index.html">Home</a>
                <span class="separator">></span>
                <a href="#" class="active">Shop</a>
            `;
        }

        // Set shop hero title
        document.querySelector('.shop-hero h1').textContent = siteData.title + ' Products';
        document.querySelector('.shop-hero-subtitle').textContent = siteData.description;

        // Initialize category filters
        const categoryFilters = document.querySelector('#category-filters');
        if (categoryFilters) {
            filters.categories.forEach(category => {
                const option = document.createElement('div');
                option.className = 'filter-option';
                option.innerHTML = `
                    <input type="checkbox" id="filter-${category.toLowerCase().replace(' ', '-')}">
                    <label for="filter-${category.toLowerCase().replace(' ', '-')}">${category}</label>
                `;
                categoryFilters.appendChild(option);
            });
        }

        // Initialize material chips
        const materialChips = document.querySelector('#material-chips');
        if (materialChips) {
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
        if (priceRange) {
            priceRange.min = 0;
            priceRange.max = 500;
            priceRange.value = 500;
            priceRange.addEventListener('input', filterProducts);
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

        // Add event listeners to filter checkboxes and chips
        document.querySelectorAll('.filter-option input').forEach(input => {
            input.addEventListener('change', filterProducts);
        });

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                this.classList.toggle('active');
                filterProducts();
            });
        });
    }

    // Filter products based on selected filters
    function filterProducts() {
        // In a real implementation, this would fetch filtered products from the server
        console.log('Filtering products...');
        // For now, we'll just simulate filtering
        fetch('../data/products.json')
            .then(res => res.json())
            .then(data => {
                // Get filter values
                const priceRange = document.querySelector('.price-range');
                const maxPrice = priceRange ? priceRange.value : 500;
                
                const selectedCategories = Array.from(document.querySelectorAll('.filter-option input:checked'))
                    .map(input => input.nextElementSibling.textContent);
                
                const selectedMaterials = Array.from(document.querySelectorAll('.filter-chip.active'))
                    .map(chip => chip.textContent);
                
                // Filter products
                const filteredProducts = data.products.filter(product => {
                    // Price filter
                    const price = product.salePrice || product.price;
                    if (price > maxPrice) return false;
                    
                    // Category filter
                    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
                        return false;
                    }
                    
                    // Material filter
                    if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) {
                        return false;
                    }
                    
                    return true;
                });
                
                // Update product grid
                initProducts(filteredProducts);
                
                // Update results count
                const resultsCount = document.querySelector('.results-count');
                if (resultsCount) {
                    resultsCount.textContent = `Showing 1–${filteredProducts.length} of ${filteredProducts.length} products`;
                }
            });
    }

    // Sort products
    function sortProducts() {
        const sortSelect = document.getElementById('sort');
        const sortValue = sortSelect ? sortSelect.value : 'relevance';
        
        fetch('../data/products.json')
            .then(res => res.json())
            .then(data => {
                let sortedProducts = [...data.products];
                
                switch(sortValue) {
                    case 'price-low':
                        sortedProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                        break;
                    case 'price-high':
                        sortedProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                        break;
                    case 'newest':
                        // Assuming newer products have higher IDs
                        sortedProducts.sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]));
                        break;
                    default:
                        // Default is relevance (no sorting)
                        break;
                }
                
                initProducts(sortedProducts);
            });
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
        }
        
        // Reset sort dropdown
        const sortSelect = document.getElementById('sort');
        if (sortSelect) {
            sortSelect.value = 'relevance';
        }
        
        // Re-fetch all products
        filterProducts();
    }

    // Cart functionality
    function initCart() {
        // Load cart count from sessionStorage
        const cartCount = document.querySelector('.cart-count');
        if (cartCount && sessionStorage.getItem('cartCount')) {
            cartCount.textContent = sessionStorage.getItem('cartCount');
        }
    }

    // Add to cart function
    function addToCart() {
        const toast = document.getElementById('toast');
        const cartCount = document.querySelector('.cart-count');
        
        // Update cart count
        let currentCount = parseInt(cartCount.textContent);
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
});