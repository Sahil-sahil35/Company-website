// --- GLOBAL DATA STORE ---
let allSiteProducts = [];
let siteData = {};

// --- GLOBAL MODAL LOGIC ---
function openContactModal(subject = "General Inquiry") {
    const modal = document.getElementById('contactModal');
    const modalSubject = document.getElementById('modalInquirySubject');
    if (modal && modalSubject) {
        modalSubject.textContent = subject;
        modal.style.display = 'block';
        document.body.classList.add('no-scroll');
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
}

// --- SHARED FUNCTIONALITY ---
async function fetchGlobalData(basePath = './') {
    // This function ensures we only fetch the data once
    if (allSiteProducts.length > 0 && Object.keys(siteData).length > 0) return;
    try {
        const [productsResponse, siteDataResponse] = await Promise.all([
            fetch(`${basePath}data/products.json`),
            fetch(`${basePath}data/data.json`)
        ]);
        const productsData = await productsResponse.json();
        allSiteProducts = productsData.products || [];
        siteData = await siteDataResponse.json();
    } catch (error) {
        console.error('Error fetching global data:', error);
    }
}

function createCategoryDropdown() {
    // This function depends on 'siteData' and 'allSiteProducts'
    if (!siteData.categories || !allSiteProducts) {
        console.error("Category data not available to build dropdown.");
        return;
    }
    const categories = siteData.categories.map(c => c.name);
    const subcategories = [...new Set(
        allSiteProducts
        .filter(p => p.category === 'plants and Machinery' && p.subCategory)
        .map(p => p.subCategory)
    )];

    const generateLinks = (isMobile = false) => {
        let html = '';
        const pagePath = window.location.pathname;
        const linkBasePath = pagePath.includes('/html/') ? './' : '../html/';
        categories.forEach(category => {
            const categoryUrl = `${linkBasePath}category.html?category=${encodeURIComponent(category)}`;
            if (category === 'plants and Machinery' && subcategories.length > 0 && !isMobile) {
                html += `<div class="has-secondary-dropdown"><a href="${categoryUrl}">${category}</a><div class="secondary-dropdown">${subcategories.map(sub => `<a href="${linkBasePath}category.html?category=plants%20and%20Machinery&subcategory=${encodeURIComponent(sub)}">${sub}</a>`).join('')}</div></div>`;
            } else {
                html += `<a href="${categoryUrl}">${category}</a>`;
            }
        });
        return html;
    };

    const desktopDropdown = document.querySelector('.desktop-categories-dropdown');
    if (desktopDropdown) desktopDropdown.innerHTML = generateLinks(false);
    
    const mobileDropdown = document.querySelector('.mobile-categories-dropdown');
    if (mobileDropdown) mobileDropdown.innerHTML = generateLinks(true);
    
    const mobileCategoryToggle = document.querySelector('.mobile-category-toggle');
    if (mobileCategoryToggle && mobileDropdown) {
        // Check if a listener already exists before adding a new one
        if (!mobileCategoryToggle.dataset.listenerAttached) {
            mobileCategoryToggle.addEventListener('click', function(e) {
                e.preventDefault();
                mobileDropdown.classList.toggle('active');
                this.classList.toggle('open');
            });
            mobileCategoryToggle.dataset.listenerAttached = 'true';
        }
    }
}

function initFooter() {
    if (!siteData.footer || !siteData.site) return;
    const { footer: footerData, site: { contact: contactData } } = siteData;
    const footerContent = document.querySelector('.footer-content');
    if (!footerContent) return;
    const pagePath = window.location.pathname;
    const linkBasePath = pagePath.includes('/html/') ? './' : './html/';
    const sections = footerContent.querySelectorAll('.footer-section');
    if (sections[0] && footerData.shopLinks) {
        sections[0].innerHTML = '<h3>Shop Links</h3>' + footerData.shopLinks.map(link => `<a href="${link.link}">${link.name}</a>`).join('');
    }
    if (sections[1] && footerData.categories) {
        sections[1].innerHTML = '<h3>Categories</h3>' + footerData.categories.map(cat => `<a href="${linkBasePath}category.html?category=${encodeURIComponent(cat.name)}">${cat.name}</a>`).join('');
    }
    if (sections[2] && contactData) {
        sections[2].innerHTML = `<h3>Contact Info</h3><a href="mailto:${contactData.email}">${contactData.email}</a><a href="tel:${contactData.phone}">${contactData.phone}</a><p>${contactData.address}</p><p>${contactData.hours}</p>`;
    }
    const footerBottom = document.querySelector('.footer-bottom');
    if (footerBottom) {
        footerBottom.innerHTML = `<p>&copy; ${new Date().getFullYear()} R S Tranding Company. All rights reserved.</p>`;
    }
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function addToCart(productId, buttonElement) {
    const product = allSiteProducts.find(p => p.id === productId);
    if (!product) { return; }
    const item = { id: product.id, name: product.name, price: (product.salePrice ?? product.price) || 0, qty: 1, thumbnail: product.images[0] || '', specs: [ product.specs?.meshSize ? `Mesh: ${product.specs.meshSize}`: null, product.specs?.type ? `Type: ${product.specs.type}`: null ].filter(Boolean) };
    let cart = [];
    try { cart = JSON.parse(sessionStorage.getItem('cartItems') || '[]'); } catch { cart = []; }
    const existingIndex = cart.findIndex(it => it.id === item.id);
    if (existingIndex >= 0) { cart[existingIndex].qty += 1; } else { cart.push(item); }
    sessionStorage.setItem('cartItems', JSON.stringify(cart));
    const totalCount = cart.reduce((n, it) => n + it.qty, 0);
    sessionStorage.setItem('cartCount', String(totalCount));
    const cartCountBadge = document.querySelector('.cart-count');
    if (cartCountBadge) cartCountBadge.textContent = String(totalCount);
    showToast('Added to cart');
    if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Added!';
        buttonElement.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        setTimeout(() => { buttonElement.textContent = originalText; buttonElement.style.background = ''; }, 1200);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const pagePath = window.location.pathname;
    const isInnerPage = pagePath.includes('/html/');
    const basePath = isInnerPage ? '../' : './';

    // --- EXECUTION ORDER ---
    // 1. Fetch all required data first.
    await fetchGlobalData(basePath);
    
    // 2. Now that data is ready, build the components that depend on it.
    createCategoryDropdown();
    initFooter();

    // 3. Initialize all other event listeners.
    // Global Modal
    const contactModalTriggers = document.querySelectorAll('.js-contact-modal-trigger');
    contactModalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => { e.preventDefault(); openContactModal(); });
    });
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeContactModal);
    if(contactModal) window.addEventListener('click', (event) => { if (event.target === contactModal) closeContactModal(); });
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('Thank you! Your message has been sent.');
            closeContactModal();
            this.reset();
        });
    }
    
    // Header, Mobile Nav, and Cart Icon
    const header = document.getElementById('header');
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const cartBtn = document.querySelector('.cart-btn');
    const cartCountBadge = document.querySelector('.cart-count');
    if (header) window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 50); });
    if (mobileMenuButton && mobileNav) {
        mobileMenuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        mobileNav.querySelectorAll('a:not(.mobile-category-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = `${isInnerPage ? '.' : './html'}/cart.html`;
        });
    }
    if (cartCountBadge) cartCountBadge.textContent = sessionStorage.getItem('cartCount') || '0';

    // Search
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    function openSearchModal() { if (searchModal) { searchModal.style.display = 'block'; if (searchInput) searchInput.focus(); document.body.classList.add('no-scroll'); } }
    function closeSearchModal() { if (searchModal) { searchModal.style.display = 'none'; if (searchInput) searchInput.value = ''; if (searchResults) searchResults.innerHTML = ''; document.body.classList.remove('no-scroll'); } }
    document.querySelectorAll('.search-btn').forEach(btn => btn.addEventListener('click', openSearchModal));
    const closeSearchBtn = document.querySelector('.close-search');
    if(closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearchModal);
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            if (term.length < 2) return;
            const filtered = allSiteProducts.filter(p => p.name.toLowerCase().includes(term)).slice(0, 10);
            if(filtered.length === 0) { searchResults.innerHTML = `<div class="search-result-item">No products found</div>`; return; }
            filtered.forEach(product => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                const imagePath = basePath + (product.images[0] || '').replace('/Company-website/', '');
                item.innerHTML = `<div style="display: flex; align-items: center;"><img src="${imagePath}" alt="${product.name}" style="width: 50px; height: 50px; margin-right: 15px; object-fit: cover;"><div><div class="search-result-name">${product.name}</div><div class="search-result-price">₹${(product.salePrice || product.price).toFixed(2)}</div></div></div>`;
                item.addEventListener('click', () => { window.location.href = `${isInnerPage ? '.' : './html'}/product.html?id=${product.id}`; });
                searchResults.appendChild(item);
            });
        });
    }
    window.addEventListener('click', (event) => { if (event.target === searchModal) closeSearchModal(); });
});