let cart = JSON.parse(localStorage.getItem('paperie_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('paperie_wishlist')) || [];
let currentUser = JSON.parse(localStorage.getItem('paperie_user')) || null;
let orders = JSON.parse(localStorage.getItem('paperie_orders')) || [];

const backdrop = document.getElementById('backdrop');
const wishlistDrawer = document.getElementById('wishlist-drawer');
const cartDrawer = document.getElementById('cart-drawer');
const userModal = document.getElementById('user-modal');
const checkoutModal = document.getElementById('checkout-modal');
const toast = document.getElementById('toast');

const formatPeso = (amount) => {
    return '₱' + Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
};

const closeAllOverlays = () => {
    backdrop.classList.remove('active');
    wishlistDrawer.classList.remove('active');
    cartDrawer.classList.remove('active');
    userModal.classList.remove('active');
    checkoutModal.classList.remove('active');
};

const openOverlay = (element) => {
    closeAllOverlays();
    backdrop.classList.add('active');
    element.classList.add('active');
};

backdrop.addEventListener('click', closeAllOverlays);
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllOverlays);
});


document.getElementById('wishlist-btn').addEventListener('click', () => {
    renderWishlist();
    openOverlay(wishlistDrawer);
});

document.getElementById('cart-btn').addEventListener('click', () => {
    renderCart();
    openOverlay(cartDrawer);
});

document.getElementById('user-btn').addEventListener('click', () => {
    renderUserModal();
    openOverlay(userModal);
});


document.getElementById('footer-account-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderUserModal();
    openOverlay(userModal);
});
document.getElementById('footer-orders-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderUserModal();
    openOverlay(userModal);
});
document.getElementById('footer-wishlist-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderWishlist();
    openOverlay(wishlistDrawer);
});


const saveState = () => {
    localStorage.setItem('paperie_cart', JSON.stringify(cart));
    localStorage.setItem('paperie_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('paperie_user', JSON.stringify(currentUser));
    localStorage.setItem('paperie_orders', JSON.stringify(orders));
    updateBadges();
};

const updateBadges = () => {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').textContent = totalQty;
    document.getElementById('wishlist-count').textContent = wishlist.length;

    const userDisplay = document.getElementById('user-display');
    userDisplay.textContent = currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : '';

    document.querySelectorAll('.products .box').forEach(card => {
        const id = card.dataset.id;
        const likeBtn = card.querySelector('.like-btn');
        if (wishlist.some(item => item.id === id)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    });
};


document.querySelectorAll('.products .box').forEach(card => {
    const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        img: card.dataset.img
    };

    card.querySelector('.add-to-cart').addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product);
    });

    card.querySelector('.like-btn').addEventListener('click', (e) => {
        e.preventDefault();
        toggleWishlist(product);
    });

    card.querySelector('.share-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showToast(`Link copied for ${product.name}!`);
    });
});

const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveState();
    renderCart();
    showToast(`Added "${product.name}" to your cart!`);
};

const changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveState();
    renderCart();
};

const removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveState();
    renderCart();
};

const renderCart = () => {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-msg">Your cart is empty. Browse our stationery collection!</p>`;
        totalEl.textContent = formatPeso(0);
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="drawer-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="drawer-item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">${formatPeso(item.price)}</div>
                    <div class="qty-controls">
                        <button type="button" onclick="changeQty('${item.id}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button type="button" onclick="changeQty('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button type="button" class="remove-btn" title="Remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    totalEl.textContent = formatPeso(total);
};


const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
        wishlist = wishlist.filter(item => item.id !== product.id);
        showToast(`Removed "${product.name}" from liked items.`);
    } else {
        wishlist.push(product);
        showToast(`Saved "${product.name}" to liked items!`);
    }
    saveState();
    renderWishlist();
};

const renderWishlist = () => {
    const container = document.getElementById('wishlist-items');

    if (wishlist.length === 0) {
        container.innerHTML = `<p class="empty-msg">No liked items yet. Click the heart icon on any product!</p>`;
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="drawer-item">
            <img src="${item.img}" alt="${item.name}">
            <div class="drawer-item-info">
                <h4>${item.name}</h4>
                <div class="item-price">${formatPeso(item.price)}</div>
            </div>
            <div class="item-actions">
                <button type="button" class="mini-btn" onclick="moveWishlistToCart('${item.id}')">+ Cart</button>
                <button type="button" class="remove-btn" title="Remove" onclick="removeWishlistItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
};

window.moveWishlistToCart = (id) => {
    const item = wishlist.find(i => i.id === id);
    if (item) {
        addToCart(item);
        openOverlay(cartDrawer);
    }
};

window.removeWishlistItem = (id) => {
    wishlist = wishlist.filter(i => i.id !== id);
    saveState();
    renderWishlist();
};

const renderUserModal = () => {
    const title = document.getElementById('user-modal-title');
    const body = document.getElementById('user-modal-body');

    if (!currentUser) {
        title.innerHTML = `<i class="fas fa-user-circle"></i> Member Login`;
        body.innerHTML = `
            <form id="login-form">
                <label class="form-label">Your Name</label>
                <input type="text" id="login-name" class="box" placeholder="Enter your name" required>
                <label class="form-label">Email Address</label>
                <input type="email" id="login-email" class="box" placeholder="you@example.com" required>
                <label class="form-label">Password</label>
                <input type="password" id="login-pass" class="box" placeholder="••••••••" required>
                <button type="submit" class="btn full-btn">Log In</button>
            </form>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            currentUser = {
                name: document.getElementById('login-name').value.trim(),
                email: document.getElementById('login-email').value.trim()
            };
            saveState();
            renderUserModal();
            showToast(`Welcome back, ${currentUser.name}!`);
        });
    } else {
        title.innerHTML = `<i class="fas fa-user-check"></i> My Account`;
        const userOrders = orders.filter(o => o.email === currentUser.email);

        const ordersHtml = userOrders.length === 0
            ? `<p style="font-size:1.4rem; color:#888; margin: 1rem 0; text-transform:none;">No past orders yet.</p>`
            : userOrders.map(o => `
                <div class="order-card">
                    <div><strong>Order #${o.id}</strong> — ${o.date}</div>
                    <div>Items: ${o.itemsSummary}</div>
                    <div>Paid via ${o.paymentMethod}: <strong>${formatPeso(o.total)}</strong></div>
                </div>
            `).join('');

        body.innerHTML = `
            <div style="margin-bottom:1.5rem; font-size:1.5rem; text-transform:none;">
                <p><strong>Name:</strong> ${currentUser.name}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
            </div>
            <h4 style="font-size:1.6rem; margin-bottom:.8rem; color:#333;">Recent Orders</h4>
            ${ordersHtml}
            <button type="button" class="btn full-btn" id="logout-btn" style="margin-top:1.5rem;">Log Out</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            currentUser = null;
            saveState();
            renderUserModal();
            showToast('You have logged out.');
        });
    }
};


document.getElementById('open-checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty! Add items before checking out.');
        return;
    }

    if (!currentUser) {
        showToast('Please log in first to complete checkout.');
        renderUserModal();
        openOverlay(userModal);
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const summaryEl = document.getElementById('checkout-summary');
    summaryEl.innerHTML = cart.map(item => `
        <p><span>${item.name} (x${item.qty})</span><span>${formatPeso(item.price * item.qty)}</span></p>
    `).join('') + `<p class="grand-total"><span>Total Amount</span><span>${formatPeso(total)}</span></p>`;

    document.getElementById('checkout-name').value = currentUser.name;
    openOverlay(checkoutModal);
});


const paymentMethodSelect = document.getElementById('payment-method');
const paymentDetailLabel = document.getElementById('payment-detail-label');
const paymentDetailInput = document.getElementById('payment-detail-input');
const paymentDetailsGroup = document.getElementById('payment-details-group');

paymentMethodSelect.addEventListener('change', () => {
    const method = paymentMethodSelect.value;
    if (method === 'Cash on Delivery') {
        paymentDetailsGroup.style.display = 'none';
        paymentDetailInput.required = false;
    } else {
        paymentDetailsGroup.style.display = 'block';
        paymentDetailInput.required = true;
        if (method === 'GCash' || method === 'Maya') {
            paymentDetailLabel.textContent = `${method} Mobile Number`;
            paymentDetailInput.placeholder = '09XX XXX XXXX';
        } else {
            paymentDetailLabel.textContent = 'Card Number';
            paymentDetailInput.placeholder = 'XXXX XXXX XXXX XXXX';
        }
    }
});


document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newOrder = {
        id: Math.floor(100000 + Math.random() * 900000),
        email: currentUser.email,
        name: document.getElementById('checkout-name').value.trim(),
        address: document.getElementById('checkout-address').value.trim(),
        paymentMethod: paymentMethodSelect.value,
        itemsSummary: cart.map(i => `${i.name} (x${i.qty})`).join(', '),
        total: total,
        date: new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    orders.unshift(newOrder);
    cart = [];
    saveState();
    renderCart();
    closeAllOverlays();
    showToast(`Payment successful! Order #${newOrder.id} confirmed.`);
});


document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.reset();
    showToast('Message sent! We will get back to you soon.');
});

updateBadges();