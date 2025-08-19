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

    // Initialize footer
    function initFooter(footer, contact) {
        const footerContent = document.querySelector('.footer-content');
        if (!footerContent) return;
        
        // Clear existing footer sections except newsletter
        const sections = footerContent.querySelectorAll('.footer-section');
        sections.forEach((section, index) => {
            if (index < 3) { // Don't clear the newsletter section
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
        if (sections[0] && footer && footer.shopLinks) {
            sections[0].innerHTML = '<h3>Shop Links</h3>';
            footer.shopLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url || link.link || '#';
                a.textContent = link.name || link.text;
                sections[0].appendChild(a);
            });
        }
        
        // Update categories
        if (sections[1] && footer && footer.categories) {
            sections[1].innerHTML = '<h3>Categories</h3>';
            footer.categories.forEach(category => {
                const a = document.createElement('a');
                a.href = category.url || category.link || '#';
                a.textContent = category.name;
                sections[1].appendChild(a);
            });
        }
        
        // Update footer bottom text
        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom) {
            footerBottom.innerHTML = `
                <p>&copy; ${new Date().getFullYear()} R S Tranding Company. All rights reserved. | Privacy Policy | Terms of Service</p>
            `;
        }
    }

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