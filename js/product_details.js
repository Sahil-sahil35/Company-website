document.addEventListener('DOMContentLoaded', function() {
    // Load product data based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'listing.html';
        return;
    }

    // Fetch products data
    fetch('../data/products.json')
        .then(response => response.json())
        .then(data => {
            // Find the selected product
            const product = data.products.find(p => p.id === productId);
            
            if (product) {
                displayProductDetails(product);
                initSimilarProducts(data.products, product);
            } else {
                console.error('Product not found');
                window.location.href = 'listing.html';
            }
        })
        .catch(error => console.error('Error loading product:', error));
    
    // Initialize footer
    fetch('../data/data.json')
        .then(response => response.json())
        .then(data => {
            initFooter(data.footer, data.site.contact);
        })
        .catch(error => console.error('Error loading footer data:', error));

    // Initialize cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount && sessionStorage.getItem('cartCount')) {
        cartCount.textContent = sessionStorage.getItem('cartCount');
    }
    
    // Display product details
    function displayProductDetails(product) {
        // Set main product info
        const productTitle = document.getElementById('productTitle');
        const modalProductName = document.getElementById('modalProductName');
        const productDescription = document.getElementById('productDescription');
        const productId = document.getElementById('productId');
        const heroProductTitle = document.getElementById('heroProductTitle');
        const heroProductDesc = document.getElementById('heroProductDesc');
        const productNameBreadcrumb = document.getElementById('productNameBreadcrumb');
        
        if (productTitle) productTitle.textContent = product.name;
        if (modalProductName) modalProductName.textContent = product.name;
        if (productDescription) productDescription.textContent = product.detailedDescription || product.description;
        if (productId) productId.value = product.id;
        if (heroProductTitle) heroProductTitle.textContent = product.name;
        if (heroProductDesc) heroProductDesc.textContent = product.description;
        if (productNameBreadcrumb) productNameBreadcrumb.textContent = product.name;

        // Set price
        const priceElement = document.getElementById('productPrice');
        if (priceElement) {
            if (product.salePrice) {
                priceElement.innerHTML = `
                    <span class="original">$${product.price.toFixed(2)}</span>
                    <span class="sale">$${product.salePrice.toFixed(2)}</span>
                `;
            } else {
                priceElement.textContent = `$${product.price.toFixed(2)}`;
            }
        }
        
        // Set stock status
        const stockElement = document.getElementById('stockStatus');
        if (stockElement) {
            stockElement.textContent = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            stockElement.className = 'stock-status ' + (product.stock > 0 ? 'in-stock' : 'out-of-stock');
        }
        
        // Set rating
        const reviewCount = product.reviewCount || 0;
        const reviewCountElement = document.getElementById('reviewCount');
        if (reviewCountElement) {
            reviewCountElement.textContent = `(${reviewCount} reviews)`;
        }
        
        // Set images
        const mainImage = document.getElementById('mainImage');
        const thumbnailsContainer = document.getElementById('thumbnails');
        
        if (product.images && product.images.length > 0 && mainImage && thumbnailsContainer) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
            
            // Clear existing thumbnails
            thumbnailsContainer.innerHTML = '';
            
            product.images.forEach((image, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = image;
                thumbnail.alt = `${product.name} thumbnail ${index + 1}`;
                thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
                thumbnail.addEventListener('click', () => {
                    mainImage.src = image;
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    thumbnail.classList.add('active');
                });
                thumbnailsContainer.appendChild(thumbnail);
            });
        }
        
        // Set specifications
        const specsTable = document.getElementById('specsTable');
        if (specsTable) {
            specsTable.innerHTML = '';
            if (product.specs && Object.keys(product.specs).length > 0) {
                for (const [key, value] of Object.entries(product.specs)) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <th>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>
                        <td>${Array.isArray(value) ? value.join(', ') : value}</td>
                    `;
                    specsTable.appendChild(row);
                }
            } else {
                specsTable.innerHTML = '<tr><td colspan="2">No specifications available</td></tr>';
            }
        }
        
        // Set documents
        const documentsList = document.getElementById('documentsList');
        if (documentsList) {
            documentsList.innerHTML = '';
            if (product.documents && product.documents.length > 0) {
                product.documents.forEach(doc => {
                    const link = document.createElement('a');
                    link.href = doc.url;
                    link.textContent = doc.name;
                    link.target = '_blank';
                    documentsList.appendChild(link);
                });
            } else {
                documentsList.innerHTML = '<p>No documents available</p>';
            }
        }
        
        // Add to cart button event
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                if (product.stock > 0) {
                    addToCart.call(this);
                } else {
                    alert('This product is out of stock');
                }
            });
            
            // Update button state based on stock
            if (product.stock <= 0) {
                addToCartBtn.textContent = 'Out of Stock';
                addToCartBtn.disabled = true;
                addToCartBtn.classList.add('disabled');
            }
        }
    }
    
    // Initialize similar products section
    function initSimilarProducts(products, currentProduct) {
        // Find products with matching category
        let similarProducts = products.filter(product => {
            return product.id !== currentProduct.id && 
                   product.category === currentProduct.category;
        }).slice(0, 6); // Limit to 6 similar products
        
        // If no similar products, show random products
        if (similarProducts.length === 0) {
            similarProducts = products
                .filter(p => p.id !== currentProduct.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 6);
        }
        
        const productsScroll = document.getElementById('productsScroll');
        displayProducts(similarProducts, productsScroll);
    }
    
    function displayProducts(products, container) {
        if (!container) return;
        
        container.innerHTML = '';
        
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
                    <div class="product-buttons">
                        <a href="product.html?id=${product.id}" class="btn-secondary btn-small">View Details</a>
                        <button class="btn-solid add-to-cart btn-small" ${product.stock <= 0 ? 'disabled' : ''} data-id="${product.id}">
                            ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });

        // Add event listeners to new add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }
    
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
                <p>&copy; ${new Date().getFullYear()} RS Tranding Company. All rights reserved. | Privacy Policy | Terms of Service</p>
            `;
        }
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
        const originalBg = button.style.background;
        button.textContent = 'Added!';
        button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg || 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
        }, 2000);
    }
    
    // Contact modal functionality
    const contactModal = document.getElementById('contactModal');
    const contactBtn = document.getElementById('contactBtn');
    const closeModal = document.querySelector('.close-modal');
    
    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', function() {
            contactModal.style.display = 'block';
            document.body.classList.add('no-scroll');
        });
    }
    
    if (closeModal && contactModal) {
        closeModal.addEventListener('click', function() {
            contactModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, this would send the form data to your server
            // For now, we'll just show a confirmation and close the modal
            alert('Thank you for your message! We will contact you soon.');
            if (contactModal) {
                contactModal.style.display = 'none';
                document.body.classList.remove('no-scroll');
            }
            this.reset();
        });
    }
});

