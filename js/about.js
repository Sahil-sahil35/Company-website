document.addEventListener('DOMContentLoaded', function() {
    // Initialize footer and categories
    fetch('../data/data.json')
        .then(response => response.json())
        .then(data => {
            initFooter(data.footer, data.site.contact);
            initCategoryDropdown();
        })
        .catch(error => console.error('Error loading data:', error));

    // Initialize cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount && sessionStorage.getItem('cartCount')) {
        cartCount.textContent = sessionStorage.getItem('cartCount');
    }

    // Animate timeline items on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    function checkTimeline() {
        const triggerBottom = window.innerHeight / 5 * 4;
        
        timelineItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            
            if (itemTop < triggerBottom) {
                item.classList.add('show');
            }
        });
    }
    
    // Initial check
    checkTimeline();
    
    // Check on scroll
    window.addEventListener('scroll', checkTimeline);

    // Initialize category dropdown
    function initCategoryDropdown() {
        fetch('../data/products.json')
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
                categoryLink.href = `../html/category.html?category=${encodeURIComponent(category)}`;
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
                categoryLink.href = `../html/category.html?category=${encodeURIComponent(category)}`;
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
});