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
                displayProductDetails(product);
                initSimilarProducts(allProducts, product);

                const contactBtn = document.getElementById('contactBtn');
                if (contactBtn) {
                    contactBtn.addEventListener('click', function() {
                        openContactModal(product.name);
                    });
                }

                const addToCartBtn = document.getElementById('addToCartBtn');
                if (addToCartBtn) {
                    addToCartBtn.onclick = null;
                    if (product.stock > 0) {
                        addToCartBtn.disabled = false;
                        addToCartBtn.textContent = 'Add to Cart';
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

        // Set stock status and rating
        const stockElement = document.getElementById('stockStatus');
        if (stockElement) {
            stockElement.textContent = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            stockElement.className = 'stock-status ' + (product.stock > 0 ? 'in-stock' : 'out-of-stock');
        }
        const reviewCountElement = document.getElementById('reviewCount');
        if (reviewCountElement) {
            reviewCountElement.textContent = `(${product.reviewCount || 0} reviews)`;
        }

        // --- START: MODIFIED GALLERY LOGIC ---
        const mainMediaContainer = document.getElementById('mainMediaContainer');
        const thumbnailsContainer = document.getElementById('thumbnails');

        // Function to show an image in the main view
        function showImage(src) {
            mainMediaContainer.innerHTML = `<img src="${src}" alt="${product.name}" class="main-image" id="mainImage">`;
        }

        // Function to show a video in the main view
        function showVideo(src) {
            mainMediaContainer.innerHTML = `<video src="${src}" class="main-image" controls autoplay playsinline loop></video>`;
        }

        if (product.images && product.images.length > 0 && mainMediaContainer && thumbnailsContainer) {
            // Initial view is the first image
            showImage(product.images[0]);
            thumbnailsContainer.innerHTML = '';

            // Create image thumbnails
            product.images.forEach((image, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = image;
                thumbnail.alt = `${product.name} thumbnail ${index + 1}`;
                thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
                thumbnail.addEventListener('click', () => {
                    showImage(image);
                    document.querySelectorAll('.thumbnail, .video-thumbnail-wrapper').forEach(t => t.classList.remove('active'));
                    thumbnail.classList.add('active');
                });
                thumbnailsContainer.appendChild(thumbnail);
            });

            // Create video thumbnail if videoUrl exists
            if (product.videoUrl) {
                const videoThumbWrapper = document.createElement('div');
                videoThumbWrapper.className = 'video-thumbnail-wrapper';

                videoThumbWrapper.innerHTML = `
                    <img src="${product.images[0]}" alt="Product video thumbnail" class="thumbnail">
                    <div class="video-play-icon"></div>
                `;

                videoThumbWrapper.addEventListener('click', () => {
                    showVideo(product.videoUrl);
                    document.querySelectorAll('.thumbnail, .video-thumbnail-wrapper').forEach(t => t.classList.remove('active'));
                    videoThumbWrapper.classList.add('active');
                });

                thumbnailsContainer.appendChild(videoThumbWrapper);
            }
        }
        // --- END: MODIFIED GALLERY LOGIC ---

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

        // Populate Tags
        const tagsContainer = document.getElementById('productTags');
        if (tagsContainer && product.tags && product.tags.length > 0) {
            tagsContainer.innerHTML = '';
            product.tags.forEach(tag => {
                const tagLink = document.createElement('a');
                tagLink.className = 'filter-chip';
                tagLink.href = `./tag.html?tag=${encodeURIComponent(tag)}`;
                tagLink.textContent = tag;
                tagsContainer.appendChild(tagLink);
            });
        }
    }

    function initSimilarProducts(allProducts, currentProduct) {
        const productsScroll = document.getElementById('productsScroll');
        if (!productsScroll) return;

        let similarProducts = allProducts.filter(p => {
            const currentCategories = Array.isArray(currentProduct.category) ? currentProduct.category : [currentProduct.category];
            const pCategories = Array.isArray(p.category) ? p.category : [p.category];
            const hasCommonCategory = currentCategories.some(cat => pCategories.includes(cat));
            return p.id !== currentProduct.id && hasCommonCategory;
        }).slice(0, 6);

        if (similarProducts.length === 0) {
            similarProducts = allProducts
                .filter(p => p.id !== currentProduct.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 6);
        }

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