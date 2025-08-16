document.addEventListener('DOMContentLoaded', function() {
    // Global variables for pagination
    let currentPage = 1;
    let itemsPerPage = 12;
    let currentProducts = [];
    
    // Load products and filters
    Promise.all([
        fetch('../data/products.json').then(res => res.json()),
        fetch('../data/data.json').then(res => res.json())
    ])
    .then(([productsData, siteData]) => {
        currentProducts = productsData.products;
        initProducts(currentProducts, currentPage);
        initFilters(productsData.filters, siteData.site);
        initCart();
        initFooter(siteData.footer, siteData.site.contact);
    })
    .catch(error => console.error('Error loading data:', error));

    // Initialize products grid with pagination
    function initProducts(products, page) {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

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
            document.getElementById('resetFilters').addEventListener('click', resetAllFilters);
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

        // Update pagination
        updatePagination(totalPages, page, products.length);
    }

    // Update pagination controls
    function updatePagination(totalPages, currentPage, totalProducts) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        
        pagination.innerHTML = '';
        
        // Previous button
        const prevItem = document.createElement('li');
        prevItem.className = 'page-item';
        prevItem.innerHTML = `
            <a class="page-link" href="#" ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </a>
        `;
        if (currentPage > 1) {
            prevItem.addEventListener('click', (e) => {
                e.preventDefault();
                initProducts(currentProducts, currentPage - 1);
            });
        }
        pagination.appendChild(prevItem);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;
        
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
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
        nextItem.innerHTML = `
            <a class="page-link" href="#" ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </a>
        `;
        if (currentPage < totalPages) {
            nextItem.addEventListener('click', (e) => {
                e.preventDefault();
                initProducts(currentProducts, currentPage + 1);
            });
        }
        pagination.appendChild(nextItem);
        
        // Update results count
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            const startIndex = (currentPage - 1) * itemsPerPage + 1;
            const endIndex = Math.min(currentPage * itemsPerPage, totalProducts);
            resultsCount.textContent = `Showing ${startIndex}–${endIndex} of ${totalProducts} products`;
        }
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
                
                // Update current products and reset to page 1
                currentProducts = filteredProducts;
                initProducts(currentProducts, 1);
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
                
                // Update current products and reset to page 1
                currentProducts = sortedProducts;
                initProducts(currentProducts, 1);
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
        
        // Reset to all products
        currentProducts = [...currentProducts];
        initProducts(currentProducts, 1);
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
    
    // Initialize footer
    function initFooter(footer, contact) {
        const footerContent = document.querySelector('.footer-content');
        if (!footerContent) return;
        
        // Clear existing footer sections (keep the first 3 sections)
        const sections = footerContent.querySelectorAll('.footer-section');
        for (let i = 3; i < sections.length; i++) {
            sections[i].remove();
        }
        
        // Update contact info
        const contactSection = sections[2];
        if (contactSection) {
            contactSection.innerHTML = `
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
        const categoriesSection = sections[1];
        if (categoriesSection) {
            categoriesSection.innerHTML = '<h3>Categories</h3>';
            footer.categories.forEach(category => {
                categoriesSection.innerHTML += `<a href="${category.link}">${category.name}</a>`;
            });
        }
        
        // Update footer bottom text
        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom) {
            footerBottom.innerHTML = `
                <p>&copy; ${new Date().getFullYear()} AquaVision. All rights reserved. | Privacy Policy | Terms of Service</p>
            `;
        }
    }
});