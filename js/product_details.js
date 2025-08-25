document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'listing.html';
        return;
    }

    fetch('../data/products.json')
        .then(response => response.json())
        .then(data => {
            const allProducts = data.products;
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                displayProductDetails(product);
                initSimilarProducts(allProducts, product);
                setupActionButtons(product);

                const calculatorFabContainer = document.getElementById('calculatorFabContainer');
                const isFilterMedia = Array.isArray(product.category) ?
                    product.category.some(cat => cat.toLowerCase() === 'filter media') :
                    (product.category || '').toLowerCase() === 'filter media';

                if (isFilterMedia && calculatorFabContainer) {
                    calculatorFabContainer.style.display = 'block';
                }

            } else {
                console.error('Product not found');
                window.location.href = 'listing.html';
            }
        })
        .catch(error => console.error('Error loading product data:', error));

    function displayProductDetails(product) {
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productDescription').textContent = product.detailedDescription || product.description;
        document.getElementById('heroProductTitle').textContent = product.name;
        document.getElementById('heroProductDesc').textContent = product.description;
        document.getElementById('productNameBreadcrumb').textContent = product.name;

        // --- START: MODIFIED PRICE LOGIC ---
        const priceElement = document.getElementById('productPrice');
        if (priceElement) {
            if (product.negotiable) {
                priceElement.innerHTML = `<span class="negotiable-text">Negotiable</span>`;
            } else if (product.salePrice) {
                priceElement.innerHTML = `<span class="original">₹${product.price.toFixed(2)}</span> <span class="sale">₹${product.salePrice.toFixed(2)}</span>`;
            } else {
                priceElement.textContent = `₹${product.price.toFixed(2)}`;
            }
        }
        // --- END: MODIFIED PRICE LOGIC ---

        const stockElement = document.getElementById('stockStatus');
        if (stockElement) {
            stockElement.textContent = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            stockElement.className = 'stock-status ' + (product.stock > 0 ? 'in-stock' : 'out-of-stock');
        }
        const reviewCountElement = document.getElementById('reviewCount');
        if (reviewCountElement) {
            reviewCountElement.textContent = `(${product.reviewCount || 0} reviews)`;
        }

        const mainMediaContainer = document.getElementById('mainMediaContainer');
        const thumbnailsContainer = document.getElementById('thumbnails');
        if (product.images && product.images.length > 0 && mainMediaContainer && thumbnailsContainer) {
            const showImage = (src) => mainMediaContainer.innerHTML = `<img src="${src}" alt="${product.name}" class="main-image" id="mainImage">`;
            const showVideo = (src) => mainMediaContainer.innerHTML = `<video src="${src}" class="main-image" controls autoplay playsinline loop></video>`;
            
            showImage(product.images[0]);
            thumbnailsContainer.innerHTML = '';

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

            if (product.videoUrl) {
                const videoThumbWrapper = document.createElement('div');
                videoThumbWrapper.className = 'video-thumbnail-wrapper';
                videoThumbWrapper.innerHTML = `<img src="${product.images[0]}" alt="Product video thumbnail" class="thumbnail"><div class="video-play-icon"></div>`;
                videoThumbWrapper.addEventListener('click', () => {
                    showVideo(product.videoUrl);
                    document.querySelectorAll('.thumbnail, .video-thumbnail-wrapper').forEach(t => t.classList.remove('active'));
                    videoThumbWrapper.classList.add('active');
                });
                thumbnailsContainer.appendChild(videoThumbWrapper);
            }
        }

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

    function setupActionButtons(product) {
        const contactBtn = document.getElementById('contactBtn');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => openContactModal(product.name));
        }

        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            if (product.stock > 0) {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Add to Cart';
                addToCartBtn.addEventListener('click', () => addToCart(product.id, addToCartBtn));
            } else {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Out of Stock';
            }
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
            similarProducts = allProducts.filter(p => p.id !== currentProduct.id).sort(() => 0.5 - Math.random()).slice(0, 6);
        }

        productsScroll.innerHTML = '';
        similarProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image"><img src="${product.images[0]}" alt="${product.name}"></div>
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-buttons"><a href="product.html?id=${product.id}" class="btn-outline">View Details</a></div>
                </div>
            `;
            productsScroll.appendChild(productCard);
        });
    }
});