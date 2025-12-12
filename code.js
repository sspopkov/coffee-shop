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
          <button onclick="changeQuantity(${index}, -1})">−</button>
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

document.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.add('active');
    renderCartSidebar();
  });
});

document.getElementById('hideCart')?.addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.remove('active');
});

function addToCartSimple(id) {
  const coffee = coffeeData.find(c => c.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) existing.quantity += 1;
  else cart.push({ ...coffee, quantity: 1, size: null, milk: null, sugar: false });

  saveCart();
}

updateCartCounter();
function renderCoffee(items = coffeeData) {
  const grid = document.getElementById('coffeeGrid');
  if (!grid) return;

  grid.innerHTML = items.map(coffee => 
    `<article class="coffee-card">
      <img src="${coffee.img}" alt="${coffee.name}">
      <h3>${coffee.name}</h3>
      <p class="price">${coffee.price} ₽</p>
      <button class="add-btn" onclick="addToCartSimple(${coffee.id}); event.stopPropagation()">В корзину</button>
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
  renderCartModal();
  document.querySelector('[data-category="all"]')?.classList.add('active');
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

document.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('cartModal').classList.add('active');
    renderCartModal();
  });
});

document.querySelector('.close-cart')?.addEventListener('click', () => {
  document.getElementById('cartModal').classList.remove('active');
});

document.getElementById('cartModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('active');
  }
});