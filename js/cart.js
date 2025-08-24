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

  function getCart() {
    try {
      return JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    } catch {
      return [];
    }
  }

  function setCart(items) {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
    const count = items.reduce((n, it) => n + it.qty, 0);
    sessionStorage.setItem('cartCount', String(count));
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = String(count);
  }

  function currency(n) {
    return '₹' + (n || 0).toFixed(2);
  }

  function render() {
    const cart = getCart();
    itemsEl.setAttribute('aria-busy', 'true');
    itemsEl.innerHTML = '';

    if (!cart.length) {
      itemsEl.innerHTML = `
        <div class="empty">
          <svg class="illustration" viewBox="0 0 64 64" fill="none" stroke="currentColor"><path stroke-width="2" d="M16 24c8-8 24-8 32 0M20 32c6-6 18-6 24 0M24 40c4-4 12-4 16 0"/><circle cx="32" cy="48" r="1.5"/></svg>
          <h3>Your cart is empty</h3>
          <p>Explore products and add items to inquire.</p>
          <a class="btn-outline" href="./listing.html">Continue Shopping</a>
        </div>
      `;
      selectAllEl.checked = false;
      removeSelectedBtn.disabled = true;
      toggleFormVisibility();
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
          <label class="item-select checkbox" aria-label="Select item"><input type="checkbox" class="row-select" data-id="${item.id}"/></label>
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
          <button type="button" class="remove-btn" data-id="${item.id}" aria-label="Remove">×</button>
        </div>
      `;
      itemsEl.appendChild(row);
    });

    wireRowEvents();
    updateSummary();
    toggleFormVisibility();
    itemsEl.setAttribute('aria-busy', 'false');
  }

  function wireRowEvents() {
    const rowChecks = itemsEl.querySelectorAll('.row-select');
    selectAllEl.onchange = () => {
      rowChecks.forEach(cb => cb.checked = selectAllEl.checked);
      removeSelectedBtn.disabled = !selectAllEl.checked;
      updateSelectedProductsList();
    };
    rowChecks.forEach(cb => {
      cb.addEventListener('change', () => {
        selectAllEl.checked = [...rowChecks].every(c => c.checked);
        removeSelectedBtn.disabled = ![...rowChecks].some(c => c.checked);
        updateSelectedProductsList();
      });
    });
    itemsEl.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.id, +1)));
    itemsEl.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.id, -1)));
    itemsEl.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('input', () => { input.value = String(Math.max(1, parseInt(input.value || '1', 10))); });
      input.addEventListener('change', () => { setQty(input.dataset.id, Math.max(1, parseInt(input.value || '1', 10))); });
    });
    itemsEl.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', () => removeById(btn.dataset.id)));
    removeSelectedBtn.onclick = () => {
      const ids = [...itemsEl.querySelectorAll('.row-select:checked')].map(cb => cb.dataset.id);
      if (ids.length) removeMany(ids);
    };
  }

  function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(it => it.id === id);
    if (item) {
      item.qty = Math.max(1, (item.qty || 1) + delta);
      setCart(cart);
      render();
    }
  }
  function setQty(id, qty) {
    const cart = getCart();
    const item = cart.find(it => it.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      setCart(cart);
      render();
    }
  }
  function removeById(id) {
    const cart = getCart().filter(it => it.id !== id);
    setCart(cart);
    showToast('Item removed from cart', true);
    render();
  }
  function removeMany(ids) {
    const set = new Set(ids);
    const cart = getCart().filter(it => !set.has(it.id));
    setCart(cart);
    showToast('Selected items removed', true);
    render();
  }

  function getSelectedIds() {
    return [...document.querySelectorAll('.row-select:checked')].map(cb => cb.dataset.id);
  }

  function updateSelectedProductsList() {
    const cart = getCart();
    const ids = getSelectedIds();
    const selected = cart.filter(it => ids.includes(it.id));
    if (selected.length > 0) {
      selectedProductsEl.value = selected.map(it => `${it.name} (Qty: ${it.qty})`).join('\n');
    } else {
      selectedProductsEl.value = '';
    }
    toggleFormVisibility();
  }

  function toggleFormVisibility() {
    const anySelected = getSelectedIds().length > 0;
    formEl.setAttribute('aria-hidden', anySelected ? 'false' : 'true');
    noSelectionEl.style.display = anySelected ? 'none' : '';
  }

  function updateSummary() {
    const cart = getCart();
    summaryCountEl.textContent = String(cart.reduce((n, it) => n + it.qty, 0));
    summaryTotalEl.textContent = currency(cart.reduce((sum, it) => sum + (it.price * it.qty), 0));
  }

  // --- FORMSPREE SUBMISSION LOGIC ---
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    
    // Replace this with your new "Cart Inquiry" endpoint URL from Formspree
    const FORM_ENDPOINT = "https://formspree.io/f/mldwrbyz";

    const formData = new FormData(formEl);
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        showToast("Inquiry sent! We'll be in touch soon.", true);
        formEl.reset();
        updateSelectedProductsList(); // Hides the form
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(error => {
      console.error(error);
      showToast('Error sending inquiry. Please try again.', false);
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Inquiry";
    });
  });
  
  function showToast(msg, isSuccess) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = isSuccess 
      ? 'linear-gradient(135deg, #28a745, #20c997)' 
      : 'linear-gradient(135deg, #ff4d4f, #ff7675)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  render();
});