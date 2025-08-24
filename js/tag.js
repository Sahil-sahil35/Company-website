document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');

    const titleEl = document.getElementById('tag-title');
    const gridEl = document.getElementById('tag-results-grid');
    
    // Set the page title based on the tag in the URL
    if (titleEl && tag) {
        titleEl.textContent = `Results for: "${tag}"`;
        document.title = `Results for "${tag}" — R S Trading Company`;
    }

    if (!tag) {
        gridEl.innerHTML = '<p>No tag specified. Please go back and select a tag.</p>';
        return;
    }

    // 1. Fetch data from all sources at the same time
    try {
        const [productsRes, servicesRes, blogRes] = await Promise.all([
            fetch('../data/products.json'),
            fetch('../data/services.json'),
            fetch('../data/blog.json')
        ]);

        const productsData = await productsRes.json();
        const servicesData = await servicesRes.json();
        const blogData = await blogRes.json();

        // 2. Find all items from each source that include the tag
        const taggedProducts = (productsData.products || [])
            .filter(p => p.tags && p.tags.includes(tag))
            .map(p => ({...p, type: 'Product'})); // Add a 'type' property

        const taggedServices = (servicesData.services || [])
            .filter(s => s.tags && s.tags.includes(tag))
            .map(s => ({...s, type: 'Service'}));

        const taggedBlogs = (blogData.articles || [])
            .filter(b => b.tags && b.tags.includes(tag))
            .map(b => ({...b, type: 'Article'}));

        const allResults = [...taggedProducts, ...taggedServices, ...taggedBlogs];

        renderResults(allResults);

    } catch (error) {
        console.error("Error fetching tagged content:", error);
        gridEl.innerHTML = '<p>There was an error loading content.</p>';
    }

    // 3. Render the combined results into the grid
    function renderResults(results) {
        gridEl.innerHTML = '';
        if (results.length === 0) {
            gridEl.innerHTML = `<div class="empty-state"><p>No content found with the tag "${tag}".</p></div>`;
            return;
        }

        results.forEach(item => {
            const card = document.createElement('div');
            // We can reuse the .product-card style for a consistent look
            card.className = 'product-card'; 

            let link = '#';
            let imageUrl = item.images ? item.images[0] : item.imageUrl;
            
            if (item.type === 'Product') link = `./product.html?id=${item.id}`;
            if (item.type === 'Service') link = `./services.html`;
            if (item.type === 'Article') link = `./blog.html`; // Future: could be article.html?id=...

            card.innerHTML = `
                <div class="product-image">
                    <img src="${imageUrl || ''}" alt="${item.name || item.title}" loading="lazy">
                </div>
                <div class="product-content">
                    <span class="category-tag" style="background-color: var(--bg-tertiary); color: var(--text-muted);">${item.type}</span>
                    <h3 class="product-name">${item.name || item.title}</h3>
                    <p class="product-desc">${item.description || item.excerpt}</p>
                    <div class="product-buttons">
                        <a href="${link}" class="btn-outline">View Details</a>
                    </div>
                </div>
            `;
            gridEl.appendChild(card);
        });
    }
});