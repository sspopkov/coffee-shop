let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];

function updateCartCounter() {
  const counters = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  counters.forEach(el => el.textContent = totalItems || '0');
}

function saveCart() {
  localStorage.setItem('coffeeCart', JSON.stringify(cart));
  updateCartCounter();
  renderCartSidebar();
}

function renderCartSidebar() {
  const body = document.getElementById('cartBody');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('totalAmount');

  if (!body || !subtotalEl || !totalEl) return;

  if (cart.length === 0) {
    body.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
    subtotalEl.textContent = '0 ₽';
    totalEl.textContent = '0 ₽';
    return;
  }

  body.innerHTML = cart.map((item, index) =>
    `<div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-options">
          ${item.size ? item.size + ' • ' : ''}
          ${item.milk && item.milk !== 'regular' ? item.milk + ' milk' : ''}
          ${item.sugar ? '• +sugar' : ''}
        </div>
        <div class="quantity-controls">
          <button onclick="changeQuantity(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${index}, +1)">+</button>
          <button class="remove-item" onclick="removeFromCart(${index})">✕</button>
        </div>
      </div>
      <div class="cart-item-price">${item.price * item.quantity} ₽</div>
    </div>`
  ).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  subtotalEl.textContent = total + ' ₽';
  totalEl.textContent = total + ' ₽';
}

function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) removeFromCart(index);
  else saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

const cartSidebar = document.getElementById('cartSidebar');

if (cartSidebar) {
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cartSidebar.classList.add('active');
      renderCartSidebar();
    });
  });

  document.getElementById('hideCart')?.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
  });
}

updateCartCounter();
function openDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}

function renderCoffee(items = coffeeData) {
  const grid = document.getElementById('coffeeGrid');
  if (!grid) return;

  grid.innerHTML = items.map(coffee =>
    `<article class="coffee-card" onclick="openDetail(${coffee.id})">
      <img src="${coffee.img}" alt="${coffee.name}">
      <h3>${coffee.name}</h3>
      <p class="price">${coffee.price} ₽</p>
      <button class="add-btn" type="button" onclick="event.stopPropagation()">В корзину</button>
    </article>`
  ).join('');
}

document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault();

    const selectedCategory = this.dataset.category;

    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.classList.remove('active');
    });
    this.classList.add('active');

    let filtered;
    if (selectedCategory === 'all') {
      filtered = coffeeData;
    } else {
      filtered = coffeeData.filter(coffee =>
        Array.isArray(coffee.category)
          ? coffee.category.includes(selectedCategory)
          : coffee.category === selectedCategory
      );
    }

    renderCoffee(filtered);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  renderCoffee();
  updateCartCounter();
  renderCartSidebar();
  document.querySelector('[data-category="all"]')?.classList.add('active');
  initDetailPage();
});

const searchInput = document.getElementById('searchInput');

if (searchInput) {
  searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    if (query === '') {
      const activeBtn = document.querySelector('[data-category].active');
      const activeCat = activeBtn ? activeBtn.dataset.category : 'all';

      if (activeCat === 'all') {
        renderCoffee(coffeeData);
      } else {
        const filtered = coffeeData.filter(coffee =>
          Array.isArray(coffee.category)
            ? coffee.category.includes(activeCat)
            : coffee.category === activeCat
        );
        renderCoffee(filtered);
      }
      return;
    }

    const found = coffeeData.filter(coffee =>
      coffee.name.toLowerCase().includes(query)
    );

    renderCoffee(found);
  });
}

document.querySelectorAll('[data-category]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
    }
  });
});

function initDetailPage() {
  if (!document.body.classList.contains('detail-page')) return;

  const params = new URLSearchParams(window.location.search);
  const coffeeId = Number(params.get('id'));
  const coffee = coffeeData.find(c => c.id === coffeeId) || coffeeData[0];
  if (!coffee) return;

  const detailTitle = document.getElementById('coffeeTitle');
  const detailName = document.getElementById('detailName');
  const detailImg = document.getElementById('detailImg');
  const detailDesc = document.getElementById('detailDesc');
  const quantityEl = document.getElementById('quantity');
  const addBtn = document.querySelector('.add-to-cart-big');
  const priceEl = document.getElementById('detailPrice');

  let selectedSize = document.querySelector('.size-btn.active')?.dataset.size || 'tall';
  let selectedMilk = document.querySelector('.milk-btn.active')?.dataset.milk || 'regular';
  let sugarSelected = document.getElementById('extraSugar')?.checked || false;
  let quantity = Number(quantityEl?.textContent) || 1;

  if (detailTitle) {
    detailTitle.textContent = coffee.name;
  }

  if (detailName) {
    detailName.textContent = coffee.name;
  }

  if (detailImg) {
    detailImg.src = coffee.img;
    detailImg.alt = coffee.name;
  }

  if (detailDesc) {
    detailDesc.textContent = 'Выберите размер, молоко и дополнительные опции для вашего напитка.';
  }

  function updatePrice() {
    if (priceEl) {
      priceEl.textContent = `${coffee.price * quantity} ₽`;
    }
  }

  updatePrice();

  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedSize = e.currentTarget.dataset.size;
    });
  });

  document.querySelectorAll('.milk-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.milk-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedMilk = e.currentTarget.dataset.milk;
    });
  });

  document.getElementById('extraSugar')?.addEventListener('change', e => {
    sugarSelected = e.target.checked;
  });

  document.getElementById('inc')?.addEventListener('click', () => {
    quantity += 1;
    if (quantityEl) quantityEl.textContent = quantity;
    updatePrice();
  });

  document.getElementById('dec')?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity -= 1;
      if (quantityEl) quantityEl.textContent = quantity;
      updatePrice();
    }
  });

  addBtn?.addEventListener('click', () => {
    const existing = cart.find(item =>
      item.id === coffee.id &&
      item.size === selectedSize &&
      item.milk === selectedMilk &&
      item.sugar === sugarSelected
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        ...coffee,
        quantity,
        size: selectedSize,
        milk: selectedMilk,
        sugar: sugarSelected
      });
    }

    saveCart();
  });
}
