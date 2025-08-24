document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'listing.html';
        return;
    }

    let currentProduct = null;

    fetch('../data/products.json')
        .then(response => response.json())
        .then(data => {
            const product = data.products.find(p => p.id === productId);
            if (product) {
                currentProduct = product;
                displayProductDetails(product);

                // Setup contact button to call the global modal function from main.js
                const contactBtn = document.getElementById('contactBtn');
                if (contactBtn) {
                    contactBtn.addEventListener('click', function() {
                        openContactModal(currentProduct.name);
                    });
                }
            } else {
                console.error('Product not found');
                window.location.href = 'listing.html';
            }
        })
        .catch(error => console.error('Error loading product:', error));

    function displayProductDetails(product) {
        // This function just displays data. All modal logic is now in main.js.
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productDescription').textContent = product.detailedDescription || product.description;
        document.getElementById('heroProductTitle').textContent = product.name;
        document.getElementById('heroProductDesc').textContent = product.description;
        document.getElementById('productNameBreadcrumb').textContent = product.name;

        const priceElement = document.getElementById('productPrice');
        if (priceElement) {
            if (product.salePrice) {
                priceElement.innerHTML = `
                    <span class="original">₹${product.price.toFixed(2)}</span>
                    <span class="sale">₹${product.salePrice.toFixed(2)}</span>
                `;
            } else {
                priceElement.textContent = `₹${product.price.toFixed(2)}`;
            }
        }

        const stockElement = document.getElementById('stockStatus');
        if (stockElement) {
            stockElement.textContent = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            stockElement.className = 'stock-status ' + (product.stock > 0 ? 'in-stock' : 'out-of-stock');
        }

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
        
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.onclick = null; // Clear previous listeners
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
    }
});