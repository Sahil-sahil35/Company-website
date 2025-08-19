document.addEventListener('DOMContentLoaded', function () {
  const itemsEl = document.getElementById('cartItems');
  const selectAllEl = document.getElementById('selectAll');
  const removeSelectedBtn = document.getElementById('removeSelected');

  const noSelectionEl = document.getElementById('noSelection');
  const formEl = document.getElementById('inquiryForm');
  const selectedProductsEl = document.getElementById('selectedProducts');
  const submitBtn = document.getElementById('submitInquiry');

  const summaryCountEl = document.getElementById('summaryCount');
  const summaryTotalEl = document.getElementById('summaryTotal');

  const toast = document.getElementById('toast');

  // ---------- Cart state helpers ----------
  function getCart() {
    try {
      return JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    } catch {
      return [];
    }
  }
  function setCart(items) {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
    // Sync visible counter
    const count = items.reduce((n, it) => n + it.qty, 0);
    sessionStorage.setItem('cartCount', String(count));
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = String(count);
  }

  function currency(n) {
    return '₹' + (n || 0).toFixed(2);
  }

  // ---------- Render ----------
  function render() {
    const cart = getCart();
    itemsEl.setAttribute('aria-busy', 'true');
    itemsEl.innerHTML = '';

    if (!cart.length) {
      itemsEl.innerHTML = `
        <div class="empty">
          <svg class="illustration" viewBox="0 0 64 64" fill="none" stroke="currentColor">
            <path stroke-width="2" d="M16 24c8-8 24-8 32 0M20 32c6-6 18-6 24 0M24 40c4-4 12-4 16 0"/>
            <circle cx="32" cy="48" r="1.5"/>
          </svg>
          <h3>Your cart is empty</h3>
          <p>Explore products and add items to inquire.</p>
          <a class="btn-outline" href="./listing.html">Continue Shopping</a>
        </div>
      `;
      selectAllEl.checked = false;
      removeSelectedBtn.disabled = true;
      toggleForm();
      updateSummary();
      itemsEl.setAttribute('aria-busy', 'false');
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.setAttribute('role', 'listitem');

      row.innerHTML = `
        <div class="cart-item-left">
          <label class="item-select checkbox" aria-label="Select item">
            <input type="checkbox" class="row-select" data-id="${item.id}"/>
          </label>
          <img class="item-thumb" src="${item.thumbnail}" alt="${item.name}">
          <div>
            <h3 class="item-title"><a href="./product.html?id=${item.id}">${item.name}</a></h3>
            <div class="item-specs">${(item.specs || []).map(s => `<span class="chip">${s}</span>`).join('')}</div>
          </div>
        </div>

        <div class="item-price">${currency(item.price)}</div>

        <div class="item-actions">
          <div class="qty" aria-label="Quantity">
            <button type="button" class="qty-dec" data-id="${item.id}" aria-label="Decrease">–</button>
            <input type="text" class="qty-input" data-id="${item.id}" value="${item.qty}" inputmode="numeric" aria-label="Quantity value">
            <button type="button" class="qty-inc" data-id="${item.id}" aria-label="Increase">+</button>
          </div>
          <button type="button" class="remove-btn" data-id="${item.id}" aria-label="Remove">
            ×
          </button>
        </div>
      `;

      itemsEl.appendChild(row);
    });

    wireRowEvents();
    updateSummary();
    toggleForm();
    itemsEl.setAttribute('aria-busy', 'false');
  }

  function wireRowEvents() {
    // Select all toggle logic
    const rowChecks = itemsEl.querySelectorAll('.row-select');
    const cart = getCart();

    selectAllEl.onchange = () => {
      rowChecks.forEach(cb => cb.checked = selectAllEl.checked);
      removeSelectedBtn.disabled = !selectAllEl.checked;
      updateSelectedProducts();
    };

    rowChecks.forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = [...rowChecks].every(c => c.checked);
        const anyChecked = [...rowChecks].some(c => c.checked);
        selectAllEl.checked = allChecked;
        removeSelectedBtn.disabled = !anyChecked;
        updateSelectedProducts();
      });
      // Accessibility: click label area toggles too (label already wraps)
    });

    // Qty steppers
    itemsEl.querySelectorAll('.qty-inc').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, +1));
    });
    itemsEl.querySelectorAll('.qty-dec').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
    });
    itemsEl.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('input', () => {
        const val = Math.max(1, parseInt(input.value || '1', 10));
        input.value = String(val);
      });
      input.addEventListener('change', () => {
        const val = Math.max(1, parseInt(input.value || '1', 10));
        setQty(input.dataset.id, val);
      });
    });

    // Remove single
    itemsEl.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeById(btn.dataset.id));
    });

    // Remove selected
    removeSelectedBtn.onclick = () => {
      const ids = [...itemsEl.querySelectorAll('.row-select:checked')].map(cb => cb.dataset.id);
      if (ids.length) {
        removeMany(ids);
      }
    };
  }

  // ---------- Quantity & removal ----------
  function changeQty(id, delta) {
    const cart = getCart();
    const idx = cart.findIndex(it => it.id === id);
    if (idx >= 0) {
      cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
      setCart(cart);
      render();
    }
  }
  function setQty(id, qty) {
    const cart = getCart();
    const idx = cart.findIndex(it => it.id === id);
    if (idx >= 0) {
      cart[idx].qty = Math.max(1, qty);
      setCart(cart);
      render();
    }
  }
  function removeById(id) {
    const cart = getCart().filter(it => it.id !== id);
    setCart(cart);
    toastSuccess('Item removed');
    render();
  }
  function removeMany(ids) {
    const set = new Set(ids);
    const cart = getCart().filter(it => !set.has(it.id));
    setCart(cart);
    toastSuccess('Selected items removed');
    render();
  }

  // ---------- Form visibility & selected list ----------
  function getSelectedIds() {
    return [...document.querySelectorAll('.row-select:checked')].map(cb => cb.dataset.id);
  }

  function updateSelectedProducts() {
    const cart = getCart();
    const ids = getSelectedIds();
    const selected = cart.filter(it => ids.includes(it.id));
    if (!selected.length) {
      selectedProductsEl.value = '';
      formEl.setAttribute('aria-hidden', 'true');
      noSelectionEl.style.display = '';
      return;
    }
    selectedProductsEl.value = selected.map(it => `${it.name} × ${it.qty}`).join('\n');
    formEl.setAttribute('aria-hidden', 'false');
    noSelectionEl.style.display = 'none';
  }

  function toggleForm() {
    const anySelected = getSelectedIds().length > 0;
    formEl.setAttribute('aria-hidden', anySelected ? 'false' : 'true');
    noSelectionEl.style.display = anySelected ? 'none' : '';
  }

  // ---------- Summary ----------
  function updateSummary() {
    const cart = getCart();
    const count = cart.reduce((n, it) => n + it.qty, 0);
    const total = cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
    summaryCountEl.textContent = String(count);
    summaryTotalEl.textContent = currency(total);
  }

  // ---------- Submit inquiry ----------
  formEl.addEventListener('submit', async function (e) {
    e.preventDefault();

    // basic inline validation
    const requiredFields = ['fullName', 'email', 'phone', 'inquiryType', 'message'];
    let ok = true;
    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el.value) {
        el.focus();
        ok = false;
      }
    });
    if (!document.getElementById('consent').checked) {
      toastError('Please accept consent to proceed.');
      return;
    }
    if (!ok) return;

    const cart = getCart();
    const selectedIds = getSelectedIds();
    const selected = cart.filter(it => selectedIds.includes(it.id));

    const payload = {
      selectedItems: selected,
      form: {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        company: document.getElementById('company').value,
        inquiryType: document.getElementById('inquiryType').value,
        message: document.getElementById('message').value,
        contactMethod: (document.querySelector('input[name="contactMethod"]:checked') || {}).value
      },
      meta: {
        page: location.href,
        ts: Date.now()
      }
    };

    submitBtn.disabled = true;

    try {
      // Configure your backend endpoint here:
      const ENDPOINT = '/api/send-inquiry'; // <- replace with your email API
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Network error');

      // success state
      submitBtn.classList.add('success');
      toastSuccess("Inquiry sent! We’ll reach out within 24h.");
      setTimeout(() => submitBtn.classList.remove('success'), 1200);
      formEl.reset();
      updateSelectedProducts(); // clears textarea + hides form
      selectAllEl.checked = false;
      itemsEl.querySelectorAll('.row-select').forEach(cb => cb.checked = false);
      removeSelectedBtn.disabled = true;
    } catch (err) {
      toastError('Failed to send. Please try again.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------- Toast helpers ----------
  function toastShow(msg, bg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = bg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
  function toastSuccess(msg) { toastShow(msg, 'linear-gradient(135deg, #28a745, #20c997)'); }
  function toastError(msg) { toastShow(msg, 'linear-gradient(135deg, #ff4d4f, #ff7675)'); }

  // initial render
  render();

  // footer + categories (shared)
  Promise.all([
    fetch('../data/data.json').then(r => r.json()).catch(() => null),
    fetch('../data/products.json').then(r => r.json()).catch(() => null)
  ]).then(([siteData, productsData]) => {
    if (siteData) {
      initFooter(siteData.footer, siteData.site?.contact);
      if (productsData?.filters?.categories) {
        createCategoryDropdown(productsData.filters.categories);
      } else {
        initCategoryDropdown();
      }
    }
  });



    // footer + categories (shared)
  Promise.all([
    fetch('../data/data.json').then(r => r.json()).catch(() => null),
    fetch('../data/products.json').then(r => r.json()).catch(() => null)
  ]).then(([data, productsData]) => {
        initFooter(data.footer, data.site.contact);
    })
    .catch(error => console.error('Error loading data:', error));

  // Initialize footer
  function initFooter(footer, contact) {
      const footerContent = document.querySelector('.footer-content');
      if (!footerContent) return;
      
      // Clear existing footer sections
      const sections = footerContent.querySelectorAll('.footer-section');
      sections.forEach(section => {
          if (!section.querySelector('.newsletter')) {
              section.innerHTML = '';
          }
      });
      
      // Update shop links
      const shopSection = sections[0];
      if (shopSection) {
          shopSection.innerHTML = '<h3>Shop Links</h3>';
          footer.shopLinks.forEach(link => {
              shopSection.innerHTML += `<a href="${link.link}">${link.name}</a>`;
          });
      }
      
      // Update categories
      const categoriesSection = sections[1];
      if (categoriesSection) {
          categoriesSection.innerHTML = '<h3>Categories</h3>';
          footer.categories.forEach(category => {
              categoriesSection.innerHTML += `<a href="./html/category.html?category=${encodeURIComponent(category.name)}">${category.name}</a>`;
          });
      }
      
      // Update contact info
      const contactSection = sections[2];
      if (contactSection) {
          contactSection.innerHTML = `
              <h3>Contact Info</h3>
              <a href="mailto:${contact.email}">${contact.email}</a>
              <a href="tel:${contact.phone}">${contact.phone}</a>
              <a href="#">${contact.address}</a>
              <a href="#">${contact.hours}</a>
          `;
      }
      
      // Update footer bottom text
      const footerBottom = document.querySelector('.footer-bottom');
      if (footerBottom) {
          footerBottom.innerHTML = `
              <p>&copy; ${new Date().getFullYear()} R S Tranding Company. All rights reserved. | Privacy Policy | Terms of Service</p>
          `;
      }
  }

  
});
