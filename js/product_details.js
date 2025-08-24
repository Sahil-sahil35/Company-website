document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'listing.html';
        return;
    }

    // Fetch all product data to find the specific product and its similar items
    fetch('../data/products.json')
        .then(response => response.json())
        .then(data => {
            const allProducts = data.products;
            const product = allProducts.find(p => p.id === productId);
            
            if (product) {
                // Now that we have the product, display all its details
                displayProductDetails(product);

                // --- RESTORED FUNCTIONALITY: Load the similar products section ---
                initSimilarProducts(allProducts, product);

                // Setup page-specific event listeners
                const contactBtn = document.getElementById('contactBtn');
                if (contactBtn) {
                    contactBtn.addEventListener('click', function() {
                        // This calls the global modal function from main.js
                        openContactModal(product.name);
                    });
                }
                
                const addToCartBtn = document.getElementById('addToCartBtn');
                if (addToCartBtn) {
                    addToCartBtn.onclick = null; // Clear previous listeners to be safe
                    if (product.stock > 0) {
                        addToCartBtn.disabled = false;
                        addToCartBtn.textContent = 'Add to Cart';
                        // The global addToCart function is defined in main.js
                        addToCartBtn.addEventListener('click', () => addToCart(product.id, addToCartBtn));
                    } else {
                        addToCartBtn.disabled = true;
                        addToCartBtn.textContent = 'Out of Stock';
                    }
                }

            } else {
                console.error('Product not found');
                window.location.href = 'listing.html';
            }
        })
        .catch(error => console.error('Error loading product data:', error));
    
    // This is the complete function to display ALL product details
    function displayProductDetails(product) {
        // Set main text content
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productDescription').textContent = product.detailedDescription || product.description;
        document.getElementById('heroProductTitle').textContent = product.name;
        document.getElementById('heroProductDesc').textContent = product.description;
        document.getElementById('productNameBreadcrumb').textContent = product.name;
        
        // Set price
        const priceElement = document.getElementById('productPrice');
        if (priceElement) {
            if (product.salePrice) {
                priceElement.innerHTML = `<span class="original">₹${product.price.toFixed(2)}</span> <span class="sale">₹${product.salePrice.toFixed(2)}</span>`;
            } else {
                priceElement.textContent = `₹${product.price.toFixed(2)}`;
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
        
        // Populate Image Gallery
        const mainImage = document.getElementById('mainImage');
        const thumbnailsContainer = document.getElementById('thumbnails');
        if (product.images && product.images.length > 0 && mainImage && thumbnailsContainer) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
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
        
        // Populate Specifications Table
        const specsTable = document.getElementById('specsTable');
        if (specsTable) {
            const tbody = specsTable.querySelector('tbody') || specsTable;
            tbody.innerHTML = '';
            if (product.specs && Object.keys(product.specs).length > 0) {
                for (const [key, value] of Object.entries(product.specs)) {
                    const row = document.createElement('tr');
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    row.innerHTML = `<th>${formattedKey}</th><td>${Array.isArray(value) ? value.join(', ') : value}</td>`;
                    tbody.appendChild(row);
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="2">No specifications available</td></tr>';
            }
        }
        
        // Populate Documents List
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
    }

    // --- THIS IS THE RESTORED FUNCTION FOR SIMILAR PRODUCTS ---
    function initSimilarProducts(allProducts, currentProduct) {
        const productsScroll = document.getElementById('productsScroll');
        if (!productsScroll) return;

        // Find products with a matching category, excluding the current one
        let similarProducts = allProducts.filter(p => {
            // Handle cases where category is a string or an array
            const currentCategories = Array.isArray(currentProduct.category) ? currentProduct.category : [currentProduct.category];
            const pCategories = Array.isArray(p.category) ? p.category : [p.category];
            const hasCommonCategory = currentCategories.some(cat => pCategories.includes(cat));
            
            return p.id !== currentProduct.id && hasCommonCategory;
        }).slice(0, 6); // Limit to 6 similar products

        // If no similar products found in the same category, show some random products
        if (similarProducts.length === 0) {
            similarProducts = allProducts
                .filter(p => p.id !== currentProduct.id)
                .sort(() => 0.5 - Math.random()) // Shuffle
                .slice(0, 6);
        }

        // Display the found products
        productsScroll.innerHTML = '';
        similarProducts.forEach(product => {
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
                        <a href="product.html?id=${product.id}" class="btn-outline">View Details</a>
                    </div>
                </div>
            `;
            productsScroll.appendChild(productCard);
        });
    }
});