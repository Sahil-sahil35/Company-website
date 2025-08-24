document.addEventListener('DOMContentLoaded', function() {
    let allArticles = [];
    let nonFeaturedArticles = [];
    let currentPage = 1;
    const articlesPerPage = 6;

    const blogGrid = document.getElementById('blogGrid');
    const featuredContainer = document.getElementById('featuredArticleContainer');
    const paginationContainer = document.getElementById('blogPagination');
    const searchInput = document.getElementById('blogSearch');
    const filterChips = document.querySelectorAll('.filter-chip');

    async function loadBlog() {
        try {
            const response = await fetch('../data/blog.json');
            const data = await response.json();
            allArticles = data.articles;

            const featuredArticle = allArticles.find(a => a.featured);
            renderFeaturedArticle(featuredArticle);

            nonFeaturedArticles = allArticles.filter(a => !a.featured);
            
            filterAndRender();

        } catch (error) {
            console.error('Error loading blog data:', error);
            if (blogGrid) blogGrid.innerHTML = '<p>Could not load articles.</p>';
        }
    }
    
    function renderFeaturedArticle(article) {
        if (!featuredContainer || !article) return;
        featuredContainer.innerHTML = `
            <div class="featured-card">
              <div class="featured-image">
                <img src="${article.imageUrl}" alt="${article.title}" loading="lazy">
              </div>
              <div class="featured-content">
                <span class="category-tag">${article.category}</span>
                <h2>${article.title}</h2>
                <p class="featured-excerpt">${article.excerpt}</p>
                <div class="article-meta">
                  <span class="date">${article.date}</span>
                  <span class="read-time">${article.readTime}</span>
                </div>
                <a href="${article.articleUrl}?id=${article.id}" class="read-more">Read More →</a>
              </div>
            </div>
        `;
    }

    function renderArticles(articlesToRender) {
        if (!blogGrid) return;
        blogGrid.innerHTML = '';
        if (articlesToRender.length === 0) {
            blogGrid.innerHTML = '<p>No articles found matching your criteria.</p>';
            return;
        }
        articlesToRender.forEach(article => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.setAttribute('data-category', article.category);
            card.innerHTML = `
                <div class="blog-card-image">
                  <img src="${article.imageUrl}" alt="${article.title}" loading="lazy">
                </div>
                <div class="blog-card-content">
                  <span class="category-tag">${article.category}</span>
                  <h3>${article.title}</h3>
                  <p class="blog-excerpt">${article.excerpt}</p>
                  <div class="article-meta">
                    <span class="date">${article.date}</span>
                    <span class="read-time">${article.readTime}</span>
                  </div>
                  <a href="${article.articleUrl}?id=${article.id}" class="read-more">Read More →</a>
                </div>
            `;
            blogGrid.appendChild(card);
        });
    }

    function renderPagination(totalArticles, articlesPerPage, currentPage) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalArticles / articlesPerPage);
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            // Store the page number in a data attribute
            pageLink.dataset.page = i;
            pageLink.className = 'page-link' + (i === currentPage ? ' active' : '');
            paginationContainer.appendChild(pageLink);
        }
    }
    
    function filterAndRender() {
        const activeChip = document.querySelector('.filter-chip.active');
        const category = activeChip ? activeChip.dataset.category : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        let filteredArticles = nonFeaturedArticles;

        if (category !== 'all') {
            filteredArticles = filteredArticles.filter(a => a.category === category);
        }

        if (searchTerm) {
            filteredArticles = filteredArticles.filter(a => 
                a.title.toLowerCase().includes(searchTerm) ||
                a.excerpt.toLowerCase().includes(searchTerm)
            );
        }
        
        const startIndex = (currentPage - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
        
        renderArticles(paginatedArticles);
        renderPagination(filteredArticles.length, articlesPerPage, currentPage);
    }

    // Event listeners for controls
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentPage = 1;
            filterAndRender();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            filterAndRender();
        });
    }

    // *** PAGINATION FIX ***
    // Use a single event listener on the container
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if a page link was clicked
            if (e.target.matches('.page-link')) {
                const pageNum = parseInt(e.target.dataset.page, 10);
                if (pageNum !== currentPage) {
                    currentPage = pageNum;
                    filterAndRender();
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                }
            }
        });
    }
    
    loadBlog();
});