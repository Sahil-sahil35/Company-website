// Shared functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add to cart functionality
    document.querySelectorAll('.btn-primary').forEach(button => {
        if (button.textContent.includes('Add to Cart')) {
            button.addEventListener('click', () => {
                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                
                // Update cart count
                const cartCount = document.querySelector('.cart-count');
                cartCount.textContent = parseInt(cartCount.textContent) + 1;
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                }, 2000);
            });
        }
    });

    // Newsletter subscription
    const newsletterBtn = document.querySelector('.newsletter button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const input = document.querySelector('.newsletter input');
            if (input.value && input.value.includes('@')) {
                const button = document.querySelector('.newsletter button');
                const originalText = button.textContent;
                button.textContent = 'Subscribed!';
                button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                input.value = '';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                }, 3000);
            } else {
                alert('Please enter a valid email address');
            }
        });
    }
    
    // Mobile navigation toggle
    const mobileMenuButton = document.querySelector('.mobile-menu');
    let mobileNav = document.querySelector('.mobile-nav');
    
    // Only create mobile nav if it doesn't exist and we're on mobile
    if (!mobileNav && window.innerWidth <= 768) {
        mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        
        // Create mobile nav links based on desktop nav
        const desktopNav = document.querySelector('.nav');
        if (desktopNav) {
            mobileNav.innerHTML = desktopNav.innerHTML;
            document.body.appendChild(mobileNav);
        }
    }
    
    // Toggle mobile nav if the elements exist
    if (mobileMenuButton && mobileNav) {
        mobileMenuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    
        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const mobileNav = document.querySelector('.mobile-nav');
        if (window.innerWidth > 768 && mobileNav) {
            // Remove mobile nav when resizing to desktop
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
});