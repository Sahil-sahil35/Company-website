document.addEventListener('DOMContentLoaded', function() {
    let allServices = [];
    let currentPage = 1;
    const servicesPerPage = 6;

    const serviceGrid = document.getElementById('serviceGrid');
    const paginationContainer = document.getElementById('servicePagination');
    const searchInput = document.getElementById('serviceSearch');

    async function loadServices() {
        try {
            const response = await fetch('../data/services.json');
            const data = await response.json();
            allServices = data.services;
            filterAndRender();
        } catch (error) {
            console.error('Error loading services data:', error);
            if (serviceGrid) serviceGrid.innerHTML = '<p>Could not load services.</p>';
        }
    }

    function renderServices(servicesToRender) {
        if (!serviceGrid) return;
        serviceGrid.innerHTML = '';
        if (servicesToRender.length === 0) {
            serviceGrid.innerHTML = '<p>No services found matching your criteria.</p>';
            return;
        }
        servicesToRender.forEach(service => {
            const card = document.createElement('article');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="service-card-image">
                  <img src="${service.imageUrl}" alt="${service.title}" loading="lazy">
                </div>
                <div class="service-card-content">
                  <h3>${service.title}</h3>
                  <p class="service-excerpt">${service.excerpt}</p>
                  <button class="btn-outline service-contact-btn" data-id="${service.id}">Inquire Now</button>
                </div>
            `;
            serviceGrid.appendChild(card);
        });

        document.querySelectorAll('.service-contact-btn').forEach(button => {
            button.addEventListener('click', handleContactClick);
        });
    }
    
    function handleContactClick(event) {
        const serviceId = event.target.dataset.id;
        const service = allServices.find(s => s.id === serviceId);
        if (service) {
            // Use the global function from main.js
            openContactModal(service.title);
        }
    }

    function renderPagination(totalServices, servicesPerPage, currentPage) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalServices / servicesPerPage);
        if (totalPages <= 1) return;
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.dataset.page = i;
            pageLink.className = 'page-link' + (i === currentPage ? ' active' : '');
            paginationContainer.appendChild(pageLink);
        }
    }
    
    function filterAndRender() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        let filteredServices = allServices;
        if (searchTerm) {
            filteredServices = allServices.filter(service => 
                service.title.toLowerCase().includes(searchTerm) ||
                service.excerpt.toLowerCase().includes(searchTerm)
            );
        }
        const startIndex = (currentPage - 1) * servicesPerPage;
        const endIndex = startIndex + servicesPerPage;
        const paginatedServices = filteredServices.slice(startIndex, endIndex);
        renderServices(paginatedServices);
        renderPagination(filteredServices.length, servicesPerPage, currentPage);
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            filterAndRender();
        });
    }
    
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            e.preventDefault();
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
    
    loadServices();
});