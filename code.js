// ==================== КОРЗИНА ====================
let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];

const syncCartFromStorage = () => {
  try {
    cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
  } catch {
    cart = [];
  }
  updateCartCounter();
  renderCartSidebar();
};

const saveCart = () => {
  localStorage.setItem('coffeeCart', JSON.stringify(cart));
  updateCartCounter();
  renderCartSidebar();
};

const updateCartCounter = () => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = totalItems || '0';
  });
};

// ==================== БЕЗОПАСНЫЙ HTML ====================
const escapeHTML = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// ==================== РЕНДЕР КАРТОЧЕК ====================
const renderCoffee = (items = coffeeData) => {
  const grid = document.getElementById('coffeeGrid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:4rem; color:#888;">Ничего не найдено</p>';
    return;
  }

  grid.innerHTML = items.map(coffee => {
    const name = escapeHTML(coffee.name);
    const price = coffee.price;
    const img = coffee.img || 'placeholder.jpg';

    return `
      <article class="coffee-card" data-id="${coffee.id}">
        <img src="${img}" alt="${name}" loading="lazy">
        <h3>${name}</h3>
        <p class="price">${price} ₽</p>
        <button class="add-btn" data-id="${coffee.id}">
          В корзину
        </button>
      </article>
    `;
  }).join('');

  // Делегирование вместо inline onclick
  grid.querySelectorAll('.coffee-card').forEach(card => {
    card.addEventListener('click', () => {
      openDetail(card.dataset.id);
    });
  });

  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDetail(btn.dataset.id);
    });
  });
};

// Простое добавление (с главной)
const addToCartSimple = (id) => {
  const coffee = coffeeData.find(c => c.id === id);
  if (!coffee) return;

  const key = `${id}_standard`; // уникальный ключ для стандартного варианта
  const existing = cart.find(item => item.uniqueKey === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...coffee,
      quantity: 1,
      uniqueKey: key,
      finalPrice: coffee.price
    });
  }

  saveCart();

  // Анимация счётчика
  document.querySelectorAll('.cart-count').forEach(c => {
    c.style.transform = 'scale(1.4)';
    setTimeout(() => c.style.transform = '', 300);
  });
};

const openDetail = (id) => {
  window.location.href = `detail.html?id=${id}`;
};

// ==================== ПОИСК + ФИЛЬТРЫ ====================
let currentFilter = 'all';
let currentSearch = '';

const applyFilters = () => {
  let filtered = coffeeData;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(c => c.category.includes(currentFilter));
  }

  if (currentSearch) {
    const query = currentSearch.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(query));
  }

  renderCoffee(filtered);
};

// Инициализация фильтров
document.addEventListener('DOMContentLoaded', () => {
  // Фильтры по категориям
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      applyFilters();
    });
  });

  // Поиск
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      applyFilters();
    });
  }

  // Мобильное меню
  document.querySelector('.burger')?.addEventListener('click', () => {
    document.querySelector('.nav-mobile').classList.toggle('active');
  });

  // Пункты мобильного меню
  document.querySelectorAll('.nav-mobile button[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.nav-mobile').classList.remove('active');
      document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
      const desktopBtn = document.querySelector(`[data-category="${btn.dataset.category}"]`);
      if (desktopBtn) desktopBtn.classList.add('active');
      currentFilter = btn.dataset.category;
      applyFilters();
    });
  });

  // Инициализация
  renderCoffee();
  updateCartCounter();
  renderCartSidebar();
});

window.addEventListener('pageshow', syncCartFromStorage);
window.addEventListener('focus', syncCartFromStorage);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncCartFromStorage();
});

// ==================== БОКОВАЯ КОРЗИНА ====================
const renderCartSidebar = () => {
  const body = document.getElementById('cartBody');
  const totalEl = document.getElementById('totalAmount');
  if (!body || !totalEl) return;

  if (cart.length === 0) {
    body.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
    totalEl.textContent = '0 ₽';
    return;
  }

  const totalSum = cart.reduce((sum, item) => sum + (item.finalPrice || item.price) * item.quantity, 0);

  body.innerHTML = cart.map((item, index) => {
    const options = [];
    if (item.size && item.size !== 'tall') options.push(item.sizeName || item.size);
    if (item.milk && item.milk !== 'regular') options.push(item.milkName || item.milk);
    if (item.sugar) options.push('+ сахар');

    const name = escapeHTML(item.name);
    const optionsStr = options.length ? options.join(' • ') : 'Стандарт';

    return `
      <div class="cart-item">
        <img src="${item.img}" alt="${name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-options">${optionsStr}</div>
          <div class="quantity-controls">
            <button data-index="${index}" data-delta="-1">−</button>
            <span>${item.quantity}</span>
            <button data-index="${index}" data-delta="1">+</button>
            <button class="remove-item" data-index="${index}">Удалить</button>
          </div>
        </div>
        <div class="cart-item-price">${(item.finalPrice || item.price) * item.quantity} ₽</div>
      </div>
    `;
  }).join('');

  totalEl.textContent = totalSum + ' ₽';

  // Делегирование событий корзины
  body.querySelectorAll('button[data-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = +btn.dataset.index;
      const delta = btn.dataset.delta ? +btn.dataset.delta : null;

      if (delta !== null) {
        changeQuantity(index, delta);
      } else if (btn.classList.contains('remove-item')) {
        removeFromCart(index);
      }
    });
  });
};

const changeQuantity = (index, delta) => {
  if (index < 0 || index >= cart.length) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
};

const removeFromCart = (index) => {
  cart.splice(index, 1);
  saveCart();
};

// Открытие/закрытие корзины
document.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('cartSidebar')?.classList.add('active');
    renderCartSidebar();
  });
});

document.getElementById('hideCart')?.addEventListener('click', () => {
  document.getElementById('cartSidebar')?.classList.remove('active');
});

// ==================== СТРАНИЦА ДЕТАЛЕЙ ====================
if (window.location.pathname.includes('detail.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    const coffee = coffeeData.find(c => c.id === id);

    if (!coffee) {
      document.body.innerHTML = '<h2 style="text-align:center;padding:8rem;color:#888;">Кофе не найден</h2>';
      return;
    }

    document.title = `${coffee.name} – Coffee Heaven`;
    document.getElementById('detailName').textContent = coffee.name;
    document.getElementById('detailName2').textContent = coffee.name;
    document.getElementById('detailImg').src = coffee.img;
    document.getElementById('detailDesc').textContent = coffee.desc || 'Очень вкусный кофе';

    let size = 'tall';
    sizeMult = 1;
    sizeName = 'Средний';
    milk = 'regular';
    milkPrice = 0;
    milkName = 'Обычное';
    sugar = false;
    quantity = 1;

    const updatePrice = () => {/////////////////////////////////////////////////////////////////
      const final = Math.round((coffee.price * sizeMult + milkPrice) * quantity);
      document.getElementById('detailPrice').textContent = final + ' ₽';
    };

    // Размеры
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        size = btn.dataset.size;
        sizeMult = parseFloat(btn.dataset.mult);
        sizeName = btn.textContent.trim();
        updatePrice();
      });
    });

    // Молоко
    document.querySelectorAll('.milk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.milk-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        milk = btn.dataset.milk;
        milkPrice = parseInt(btn.dataset.price) || 0;
        milkName = btn.textContent.replace(/ \+\d+₽$/, '').trim();
        updatePrice();
      });
    });

    // Сахар
    document.getElementById('extraSugar').addEventListener('change', e => {
      sugar = e.target.checked;
    });

    // Количество
    document.getElementById('dec').onclick = () => {
      if (quantity > 1) {
        quantity--;
        document.getElementById('quantity').textContent = quantity;
        updatePrice();
      }
    };

    document.getElementById('inc').onclick = () => {
      quantity++;
      document.getElementById('quantity').textContent = quantity;
      updatePrice();
    };

    // Кнопка добавления
    document.querySelector('.add-to-cart-big').addEventListener('click', () => {
      const item = {
        ...coffee,
        size: size !== 'tall' ? size : null,
        sizeName: size !== 'tall' ? sizeName : null,
        milk: milk !== 'regular' ? milk : null,
        milkName: milk !== 'regular' ? milkName : null,
        sugar: sugar ? true : null,
        quantity,
        finalPrice: Math.round(coffee.price * sizeMult + milkPrice),
        uniqueKey: `${coffee.id}_${size}_${milk}_${sugar}` // уникальность комбинации
      };

      const existingIndex = cart.findIndex(ex => ex.uniqueKey === item.uniqueKey);

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push(item);
      }

      saveCart();

      const btn = document.querySelector('.add-to-cart-big');
      btn.textContent = 'Добавлено!';
      btn.style.background = '#a67c52';
      btn.disabled = true;

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    });

    // Активный размер по умолчанию
    document.querySelector('.size-btn[data-size="tall"]')?.classList.add('active');
    document.querySelector('.milk-btn[data-milk="regular"]')?.classList.add('active');
    updatePrice();
  });
}

// ==================== ОФОРМЛЕНИЕ ЗАКАЗА ====================
document.querySelectorAll('.place-order').forEach(btn => {
  {
  btn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Ваша корзина пуста');
      return;
    }

    const total = cart.reduce((s, i) => s + (i.finalPrice || i.price) * i.quantity, 0);
    alert(`Заказ оформлен!\nИтого: ${total} ₽\nСпасибо за покупку в Coffee Heaven! ☕`);

    cart = [];
    saveCart();
    document.getElementById('cartSidebar')?.classList.remove('active');
  });
}});