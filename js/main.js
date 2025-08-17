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


    // ---------------------
    // Search Modal Functionality (REPLACE THIS BLOCK)
    // ---------------------
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let allProducts = [];

    // Determine whether current page is inside the /html/ folder
    function isInnerHtmlPage() {
    return window.location.pathname.includes('/html/');
    }

    // Build correct path to data/products.json depending on page location
    function productsJsonPath() {
    return (isInnerHtmlPage() ? '../' : './') + 'data/products.json';
    }

    // Safe HTML escape (to avoid injecting raw HTML)
    function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Normalize image path and make it correct relative to the current page.
    // Accepts a string or array (product.images may be an array).
    function resolveImageSrc(img) {
    if (!img) return 'images/placeholder.png';
    if (Array.isArray(img)) img = img[0];
    if (!img) return 'images/placeholder.png';
    let p = String(img).trim();

    // Full URL -> return as-is
    if (/^https?:\/\//i.test(p)) return p;



    // If we're inside /html/, image path should go up one folder
    if (isInnerHtmlPage()) {
        if (!p.startsWith('../') && !p.startsWith('./')) p = '../' + p;
    } else {
        // On root pages, ensure path is relative (this is optional, but consistent)
        if (!p.startsWith('./') && !p.startsWith('../')) p = './' + p;
    }

    return p;
    }

    // Normalize category to a searchable string
    function categoryToString(cat) {
    if (!cat) return '';
    if (Array.isArray(cat)) return cat.join(' ');
    return String(cat);
    }

    // Attach search openers (header buttons)
    document.querySelectorAll('.search-btn').forEach(btn => {
    btn.addEventListener('click', openSearchModal);
    });

    // Close button (if present)
    document.querySelector('.close-search')?.addEventListener('click', closeSearchModal);

    // Fetch product list (path adjusted based on current page)
    fetch(productsJsonPath())
    .then(res => res.json())
    .then(data => {
        allProducts = data.products || [];
        // Optionally precompute a lowercase search string for every product to speed filtering
        allProducts.forEach(p => {
        p._searchText = [
            p.name,
            p.slug,
            p.description,
            categoryToString(p.category),
            p.sku,
            (p.tags || []).join(' ')
        ].filter(Boolean).join(' ').toLowerCase();
        });
    })
    .catch(err => {
        console.error('Failed to load products for search:', err);
    });

    function openSearchModal() {
    if (!searchModal) return;
    searchModal.style.display = 'block';
    // Small timeout so focus works after display change
    setTimeout(() => searchInput?.focus(), 50);
    document.body.classList.add('no-scroll');
    }

    function closeSearchModal() {
    if (!searchModal) return;
    searchModal.style.display = 'none';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
    document.body.classList.remove('no-scroll');
    }

    // Debounced search handler
    let _searchTimer = null;
    if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(_searchTimer);
        const value = e.target.value;
        _searchTimer = setTimeout(() => runSearch(value), 120);
    });

    // Close on Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearchModal();
    });
    }

    function runSearch(raw) {
    if (!searchResults) return;
    const term = String(raw || '').toLowerCase().trim();
    searchResults.innerHTML = '';

    // If query is empty, show nothing (you can change min length to 1 or 2)
    if (term.length < 1) {
        return;
    }

    // Filter safely using precomputed _searchText if available
    const matches = allProducts.filter(prod => {
        try {
        if (prod._searchText) return prod._searchText.includes(term);
        const hay = [
            prod.name,
            prod.slug,
            prod.description,
            categoryToString(prod.category),
            prod.sku,
            (prod.tags || []).join(' ')
        ].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(term);
        } catch (e) {
        // Defensive: if any field throws, skip product
        return false;
        }
    });

    if (!matches.length) {
        searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
        return;
    }

    // Limit to top 10
    const limited = matches.slice(0, 10);

    limited.forEach(product => {
        const imgSrc = resolveImageSrc(product.images || product.image || '');
        const priceVal = Number(product.salePrice ?? product.price ?? 0);
        // Build correct link to product details depending on where we are
        const href = isInnerHtmlPage()
        ? `./product.html?id=${encodeURIComponent(product.id)}`
        : `./html/product.html?id=${encodeURIComponent(product.id)}`;

        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
        <a class="search-result-link" href="${href}">
            <div style="display:flex;align-items:center;gap:10px;">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" style="width:56px;height:56px;object-fit:cover;border-radius:6px;" onerror="this.style.opacity=0.6;">
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(product.name)}</div>
                <div class="search-result-price">${priceVal ? ('₹' + priceVal.toFixed(2)) : ''}</div>
            </div>
            </div>
        </a>
        `;

        // Clicking the result should navigate and close modal
        item.addEventListener('click', (ev) => {
        // follow the link (works in all browsers)
        const link = item.querySelector('a.search-result-link');
        if (link) {
            window.location.href = link.href;
        }
        closeSearchModal();
        });

        searchResults.appendChild(item);
    });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
    if (event.target === searchModal) {
        closeSearchModal();
    }
    });
    // ---------------------
    // End Search Modal Functionality
    // ---------------------

    
    // Load cart count from sessionStorage
    const cartCount = document.querySelector('.cart-count');
    if (cartCount && sessionStorage.getItem('cartCount')) {
        cartCount.textContent = sessionStorage.getItem('cartCount');
    }
});