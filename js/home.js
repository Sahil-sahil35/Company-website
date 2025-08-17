document.addEventListener('DOMContentLoaded', function() {
    // Fetch data from data.json and products.json
    Promise.all([
        fetch('./data/data.json').then(res => res.json()),
        fetch('./data/products.json').then(res => res.json())
    ])
    .then(([data, productsData]) => {
        initHeroStats(data.hero.stats);
        initTestimonials(data.testimonials);
        initProducts(productsData.products);
        initCategories(data.categories);
        initFeatures(data.features);
        initFooter(data.footer, data.site.contact);
    })
    .catch(error => console.error('Error loading data:', error));

    // Initialize hero stats
    function initHeroStats(stats) {
    const heroStats = document.getElementById('heroStats');
    if (!heroStats) return;
    
    heroStats.innerHTML = '';
    
    stats.forEach(stat => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.innerHTML = `
            <span class="stat-number">${stat.value}</span>
            <span class="stat-label">${stat.label}</span>
        `;
        heroStats.appendChild(statItem);
    });
    
    // Adjust hero height after stats load
    setTimeout(() => {
        if (window.innerWidth <= 768) {
            const hero = document.querySelector('.hero');
            if (hero) {
                const contentHeight = hero.querySelector('.hero-content').offsetHeight;
                hero.style.minHeight = `calc(${contentHeight}px + 20vh)`;
            }
        }
    }, 100);
}
    
    // Initialize testimonials carousel
    function initTestimonials(testimonials) {
        const container = document.querySelector('.testimonials-container');
        const dotsContainer = document.querySelector('.testimonial-dots');
        
        if (!container || !dotsContainer) return;
        
        container.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        // Create slides and dots
        testimonials.forEach((testimonial, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <div class="testimonial-card">
                    <p class="testimonial-text">${testimonial.text}</p>
                    <div class="testimonial-author">${testimonial.author}</div>
                </div>
            `;
            container.appendChild(slide);
            
            // Create dot
            const dot = document.createElement('span');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.slide = index;
            dotsContainer.appendChild(dot);
        });
        
        // Carousel functionality
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.dot');
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev');
                if (i === index) {
                    slide.classList.add('active');
                } else if (i < index) {
                    slide.classList.add('prev');
                }
            });
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        // Auto-advance testimonials every 4 seconds
        setInterval(nextSlide, 4000);
        
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
    }
    
    // Initialize products
    function initProducts(products) {
        const productsScroll = document.getElementById('productsScroll');
        if (!productsScroll) return;
        
        // Clear existing products
        productsScroll.innerHTML = '';

        const firstSevenProducts = products.slice(0, 7);
        
        // Add products from data
        firstSevenProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-buttons">
                        <a href="html/product.html?id=${product.id}" class="btn-outline">View Details</a>
                        <button class="btn-solid add-to-cart" ${product.stock <= 0 ? 'disabled' : ''} data-id="${product.id}">
                            ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            `;
            productsScroll.appendChild(productCard);
        });

        // Add event listeners to new add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
        
        // Smooth horizontal scroll for products
        let autoScrollInterval;
        let scrollDirection = 1;
        
        function startAutoScroll() {
            autoScrollInterval = setInterval(() => {
                const scrollAmount = 300 * scrollDirection;
                productsScroll.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
                
                // Check if we need to reverse direction
                if (productsScroll.scrollLeft + productsScroll.clientWidth >= productsScroll.scrollWidth - 10) {
                    scrollDirection = -1;
                } else if (productsScroll.scrollLeft <= 10) {
                    scrollDirection = 1;
                }
            }, 3000);
        }
        
        startAutoScroll();
        
        // Pause auto-scroll on hover
        productsScroll.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });
        
        productsScroll.addEventListener('mouseleave', () => {
            startAutoScroll();
        });
    }

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
    
    // Initialize categories
    function initCategories(categories) {
        const categoriesGrid = document.querySelector('.categories-grid');
        if (!categoriesGrid) return;
        
        // Clear existing categories
        categoriesGrid.innerHTML = '';
        
        // Add categories from data
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-bg" style="background-image: url('${category.image}')"></div>
                <div class="category-overlay">
                    <h3 class="category-title">${category.name}</h3>
                    <p class="category-desc">${category.description}</p>
                </div>
            `;
            
            // Add click event to navigate to category page
            categoryCard.addEventListener('click', () => {
                window.location.href = `./html/category.html?category=${encodeURIComponent(category.name)}`;
            });
            
            categoriesGrid.appendChild(categoryCard);
        });
    }
    
    // Initialize features
    function initFeatures(features) {
        const featuresGrid = document.querySelector('.features-grid');
        if (!featuresGrid) return;
        
        // Clear existing features
        featuresGrid.innerHTML = '';
        
        // Add features from data
        features.forEach(feature => {
            const featureCard = document.createElement('div');
            featureCard.className = 'feature-card';
            featureCard.innerHTML = `
                <div class="feature-icon">${feature.icon}</div>
                <h3 class="feature-title">${feature.title}</h3>
                <p class="feature-text">${feature.description}</p>
            `;
            featuresGrid.appendChild(featureCard);
        });
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
                categoriesSection.innerHTML += `<a href="./html/category.html?category=${encodeURIComponent(category.name)}">${category.name}</a>`;
            });
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
        
        // Update footer bottom text
        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom) {
            footerBottom.innerHTML = `
                <p>&copy; ${new Date().getFullYear()} RS Tranding Company. All rights reserved. | Privacy Policy | Terms of Service</p>
            `;
        }
    }

    
    // Load cart count from sessionStorage
    const cartCount = document.querySelector('.cart-count');
    if (cartCount && sessionStorage.getItem('cartCount')) {
        cartCount.textContent = sessionStorage.getItem('cartCount');
    }
});