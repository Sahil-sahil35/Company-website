// Shared functionality across all pages
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
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
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

    // Real-time search
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (term.length < 2) return;
            
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().includes(term) || 
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.category && product.category.toLowerCase().includes(term))
            ).slice(0, 10);
            
            if (filtered.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
                return;
            }
            
            filtered.forEach(product => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${product.images[0]}" alt="${product.name}">
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