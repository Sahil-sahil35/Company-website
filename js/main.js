// Shared functionality across all pages
function initCategoryDropdown() {
    // Determine correct path based on current page location
    const isProductPage = window.location.pathname.includes('product.html');
    const isListingPage = window.location.pathname.includes('listing.html');
    const isCatagoryPage = window.location.pathname.includes('category.html');
    const isCartPage = window.location.pathname.includes('cart.html');
    const basePath = isProductPage || isListingPage || isCatagoryPage || isCartPage ? '../' : './';
    const path = `${basePath}data/products.json`;

    fetch(path)
        .then(response => response.json())
        .then(data => {
            const categories = data.filters.categories;
            createCategoryDropdown(categories);
        })
        .catch(error => console.error('Error loading categories:', error));
}
// Create category dropdown menu
function createCategoryDropdown(categories) {
    // Desktop dropdown
    const desktopDropdown = document.querySelector('.desktop-categories-dropdown');
    if (desktopDropdown) {
        desktopDropdown.innerHTML = '';
        categories.forEach(category => {
            const categoryLink = document.createElement('a');
            // Determine correct path based on current page location
            const isProductPage = window.location.pathname.includes('product.html');
            const isListingPage = window.location.pathname.includes('listing.html') || window.location.pathname.includes('category.html');
            const basePath = isProductPage || isListingPage ? '../html/' : './html/';
            categoryLink.href = `${basePath}category.html?category=${encodeURIComponent(category)}`;
            categoryLink.textContent = category;
            desktopDropdown.appendChild(categoryLink);
        });
    }

    // Mobile dropdown
    const mobileDropdown = document.querySelector('.mobile-categories-dropdown');
    if (mobileDropdown) {
        mobileDropdown.innerHTML = '';
        categories.forEach(category => {
            const categoryLink = document.createElement('a');
            // Determine correct path based on current page location
            const isProductPage = window.location.pathname.includes('product.html');
            const isListingPage = window.location.pathname.includes('listing.html') || window.location.pathname.includes('category.html');
            const basePath = isProductPage || isListingPage ? '../html/' : './html/';
            categoryLink.href = `${basePath}category.html?category=${encodeURIComponent(category)}`;
            categoryLink.textContent = category;
            mobileDropdown.appendChild(categoryLink);
        });
    }
    
    // Mobile dropdown toggle
    const mobileCategoryToggle = document.querySelector('.mobile-category-toggle');
    if (mobileCategoryToggle) {
        mobileCategoryToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.nextElementSibling;
            dropdown.classList.toggle('active');
            this.classList.toggle('open');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    initCategoryDropdown();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile navigation toggle
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuButton && mobileNav) {
        mobileMenuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        
        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            if (!link.classList.contains('mobile-category-toggle')) {
                link.addEventListener('click', () => {
                    mobileNav.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                });
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav) {
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    // Newsletter subscription
    const newsletterBtn = document.querySelector('.newsletter button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const input = newsletterBtn.parentElement.querySelector('input');
            if (input.value && input.value.includes('@')) {
                const button = newsletterBtn;
                const originalText = button.textContent;
                button.textContent = 'Subscribed!';
                button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                input.value = '';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                }, 3000);
            } else {
                alert('Please enter a valid email address');
            }
        });
    }


    // Navigate to cart page when clicking header cart icon
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        const isInner = window.location.pathname.includes('/html/');
        const href = isInner ? './cart.html' : './html/cart.html';
        window.location.href = href;
    });
    }

    // Ensure cart count stays in sync with sessionStorage
    const cartCountBadge = document.querySelector('.cart-count');
    if (cartCountBadge) {
    const count = sessionStorage.getItem('cartCount') || '0';
    cartCountBadge.textContent = count;
    }


    // Search Modal Functionality
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let allProducts = [];

    // Open search modal
    document.querySelectorAll('.search-btn').forEach(btn => {
        btn.addEventListener('click', openSearchModal);
    });

    // Close search modal
    document.querySelector('.close-search')?.addEventListener('click', closeSearchModal);

    // Fetch products for search
    fetch('./data/products.json')
        .then(res => res.json())
        .then(data => {
            allProducts = data.products;
        });

    function openSearchModal() {
        if (searchModal) {
            searchModal.style.display = 'block';
            searchInput.focus();
            document.body.classList.add('no-scroll');
        }
    }

    function closeSearchModal() {
        if (searchModal) {
            searchModal.style.display = 'none';
            searchInput.value = '';
            searchResults.innerHTML = '';
            document.body.classList.remove('no-scroll');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (term.length < 2) return;

            const filtered = allProducts.filter(product => {
                const categoryStr = Array.isArray(product.category) ? product.category.join(' ') : (product.category || '');
                return (
                    (product.name && product.name.toLowerCase().includes(term)) ||
                    (product.description && product.description.toLowerCase().includes(term)) ||
                    (categoryStr.toLowerCase().includes(term))
                );
            }).slice(0, 10);

            if (filtered.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
                return;
            }
            
            filtered.forEach(product => {
                const img = Array.isArray(product.images) ? product.images[0] : product.images;
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${img}" alt="${product.name}">
                        <div class="search-result-info">
                            <div class="search-result-name">${product.name}</div>
                            <div class="search-result-price">$${(product.salePrice || product.price).toFixed(2)}</div>
                        </div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    window.location.href = `./html/product.html?id=${product.id}`;
                    closeSearchModal();
                });
                searchResults.appendChild(item);
            });
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === searchModal) {
            closeSearchModal();
        }
    });
    
    // Load cart count from sessionStorage
    const cartCount = document.querySelector('.cart-count');
    if (cartCount && sessionStorage.getItem('cartCount')) {
        cartCount.textContent = sessionStorage.getItem('cartCount');
    }




    
});