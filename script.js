// ===================================================
// MediCare Premium — script.js
// ===================================================

// ---- PRODUCT DATA ----
const products = [
    { id: 1, name: 'Advanced Pain Relief', price: 12.99, originalPrice: 16.99, category: 'Medicine', emoji: '💊', desc: 'Fast-acting formula for severe pain relief. Pharmaceutical-grade ingredients.', rating: 4.8, reviews: 234 },
    { id: 2, name: 'Immunity Vitamin C', price: 18.50, originalPrice: 24.00, category: 'Vitamins', emoji: '🍊', desc: 'High potency 1000mg immune support. Buffered for sensitive stomachs.', rating: 4.9, reviews: 412 },
    { id: 3, name: 'Digital Thermometer', price: 24.99, originalPrice: 29.99, category: 'Devices', emoji: '🌡️', desc: 'Clinical accuracy in 3 seconds. Fever alert & memory recall.', rating: 4.7, reviews: 187 },
    { id: 4, name: 'N95 Medical Masks', price: 14.99, originalPrice: 19.99, category: 'Protection', emoji: '😷', desc: 'Pack of 20, fluid resistant. 95% filtration efficiency, FDA cleared.', rating: 4.6, reviews: 528 },
    { id: 5, name: 'First Aid Kit Pro', price: 45.00, originalPrice: 59.99, category: 'Essentials', emoji: '⛑️', desc: 'Complete 150-piece set for emergencies. Compact & waterproof case.', rating: 4.9, reviews: 301 },
    { id: 6, name: 'Herbal Cough Syrup', price: 9.99, originalPrice: 12.99, category: 'Medicine', emoji: '🌿', desc: '100% natural herbal formula for dry & productive cough relief.', rating: 4.5, reviews: 156 },
    { id: 7, name: 'Hand Sanitizer Gel', price: 5.99, originalPrice: 8.99, category: 'Essentials', emoji: '🧴', desc: 'Kills 99.99% of germs. Moisturizing formula, non-sticky feel.', rating: 4.4, reviews: 892 },
    { id: 8, name: 'Blood Pressure Monitor', price: 59.99, originalPrice: 79.99, category: 'Devices', emoji: '💓', desc: 'Clinically validated for home use. Bluetooth sync with health apps.', rating: 4.8, reviews: 445 }
];

// ---- STATE ----
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let filteredProducts = [...products];
let searchQuery = '';
let categoryFilter = 'all';
let sortBy = 'default';

// ===================================================
// INIT
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initHeader();
    initMobileMenu();
    initSearch();
    initCategoryPills();
    initSortSelect();
    loadProducts();
    updateCartCount();
    initHeroVisual();
    initScrollAnimations();
    initMiniCart();
    initModal();
    initTypingEffect();
    initCounters();
    initParticles();
    initHero3D();
    init3DTilt();
    initFAB();
});

// ===================================================
// SCROLL PROGRESS
// ===================================================
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
}

// ===================================================
// HEADER SCROLL EFFECT
// ===================================================
function initHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

// ===================================================
// MOBILE MENU
// ===================================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100;opacity:0;pointer-events:none;transition:opacity 0.3s;backdrop-filter:blur(4px);';
    document.body.appendChild(overlay);

    const close = () => {
        toggle?.classList.remove('active');
        navLinks?.classList.remove('active');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    };

    toggle?.addEventListener('click', () => {
        const open = !navLinks.classList.contains('active');
        toggle.classList.toggle('active', open);
        navLinks.classList.toggle('active', open);
        overlay.style.opacity = open ? '1' : '0';
        overlay.style.pointerEvents = open ? 'all' : 'none';
        document.body.style.overflow = open ? 'hidden' : '';
    });

    overlay.addEventListener('click', close);
    navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

// ===================================================
// SEARCH
// ===================================================
function initSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.querySelector('.search-btn');
    if (!input) return;

    input.addEventListener('focus', () => input.classList.add('active'));
    input.addEventListener('blur', () => {
        if (window.innerWidth > 768 && !input.value) {
            setTimeout(() => input.classList.remove('active'), 200);
        }
    });

    let t;
    input.addEventListener('input', e => {
        clearTimeout(t);
        searchQuery = e.target.value.toLowerCase().trim();
        t = setTimeout(filterAndSort, 250);
    });

    btn?.addEventListener('click', () => { input.classList.add('active'); input.focus(); });
}

// ===================================================
// CATEGORY PILLS
// ===================================================
function initCategoryPills() {
    const pills = document.querySelectorAll('.pill[data-category]');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            categoryFilter = pill.dataset.category;
            filterAndSort();
        });
    });
}

// ===================================================
// SORT SELECT
// ===================================================
function initSortSelect() {
    const sel = document.getElementById('sortSelect');
    sel?.addEventListener('change', e => { sortBy = e.target.value; filterAndSort(); });
}

// ===================================================
// FILTER & SORT
// ===================================================
function filterAndSort() {
    let filtered = products.filter(p => {
        const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.desc.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery);
        const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
        return matchSearch && matchCat;
    });

    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            default: return 0;
        }
    });

    filteredProducts = filtered;
    loadProducts();
}

// ===================================================
// LOAD PRODUCTS
// ===================================================
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    const count = document.getElementById('resultsCount');
    if (!grid) return;

    if (count) count.textContent = filteredProducts.length;

    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = filteredProducts.map((p, i) => {
        const isWished = wishlist.includes(p.id);
        const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
        const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        return `
        <div class="product-card fade-in" style="transition-delay:${i * 0.07}s" data-id="${p.id}">
            <div class="card-shine"></div>
            <div class="product-category-tag">${p.category}</div>
            <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="toggleWishlist(${p.id});event.stopPropagation();" aria-label="Wishlist">
                ${isWished ? '❤️' : '🤍'}
            </button>
            <button class="quick-view-btn" onclick="openProductModal(${p.id});event.stopPropagation();">Quick View 👁️</button>
            <div class="product-img-box" onclick="openProductModal(${p.id})">
                <span class="product-emoji-wrap">${p.emoji}</span>
            </div>
            <div class="product-details">
                <div class="product-title" onclick="openProductModal(${p.id})">${p.name}</div>
                <div class="product-desc">${p.desc}</div>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">(${p.reviews})</span>
                </div>
                <div class="product-footer">
                    <div>
                        <div class="price">$${p.price.toFixed(2)}</div>
                        <div class="price-original">$${p.originalPrice.toFixed(2)} <span style="color:#39ff14;font-size:0.75rem;margin-left:4px;">-${discount}%</span></div>
                    </div>
                    <button class="add-btn" onclick="addToCart(${p.id});event.stopPropagation();">+ Add</button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Trigger scroll animations for new cards
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));
        init3DTilt();
    }, 50);
}

// ===================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ===================================================
let scrollObserver;
function initScrollAnimations() {
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => scrollObserver.observe(el));
}

// ===================================================
// TYPING EFFECT
// ===================================================
function initTypingEffect() {
    const el = document.getElementById('typingText');
    if (!el) return;
    const phrases = ['Our Priority.', 'Our Mission.', 'Our Commitment.', 'Our Promise.'];
    let idx = 0, charIdx = 0, deleting = false;

    function type() {
        const current = phrases[idx];
        if (!deleting) {
            el.textContent = current.slice(0, ++charIdx);
            if (charIdx === current.length) { deleting = true; return setTimeout(type, 2000); }
        } else {
            el.textContent = current.slice(0, --charIdx);
            if (charIdx === 0) { deleting = false; idx = (idx + 1) % phrases.length; return setTimeout(type, 300); }
        }
        setTimeout(type, deleting ? 60 : 100);
    }
    setTimeout(type, 1500);
}

// ===================================================
// STATS COUNTER
// ===================================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const tick = () => {
                current = Math.min(current + step, target);
                el.textContent = (current >= 1000 ? Math.round(current).toLocaleString() : Math.round(current)) + suffix;
                if (current < target) requestAnimationFrame(tick);
            };
            tick();
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
}

// ===================================================
// HERO VISUAL (Float Cards)
// ===================================================
function initHeroVisual() {
    const container = document.getElementById('heroVisual');
    if (!container) return;
    const cards = [
        { icon: '🌡️', title: 'New Arrival', text: 'Advanced Smart Thermometers', badge: 'Just In', cls: '' },
        { icon: '🍊', title: 'Special Offer', text: '20% off Immunity Boosters', badge: '-20%', cls: 'card-2' },
        { icon: '🚚', title: 'Fast Delivery', text: 'Free shipping on orders $50+', badge: 'Free', cls: 'card-3' }
    ];
    container.innerHTML = cards.map(c => `
        <div class="float-card ${c.cls}">
            <div class="float-icon">${c.icon}</div>
            <div class="float-info">
                <h3>${c.title}</h3>
                <p>${c.text}</p>
            </div>
            <div class="float-badge">${c.badge}</div>
        </div>`).join('');
}

// ===================================================
// THREE.JS 3D HERO
// ===================================================
function initHero3D() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Particles
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 30;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.06, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(geo, mat));

    // DNA Helix
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    const tubeRadius = 0.04;
    const sphereRadius = 0.12;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 8, 8);
    const matA = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85 });
    const matB = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.85 });
    const connMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });

    for (let i = 0; i < 24; i++) {
        const t = (i / 23) * Math.PI * 4;
        const y = (i / 23) * 10 - 5;
        const r = 1.8;

        const sA = new THREE.Mesh(sphereGeo, matA);
        sA.position.set(Math.cos(t) * r, y, Math.sin(t) * r);
        helixGroup.add(sA);

        const sB = new THREE.Mesh(sphereGeo, matB);
        sB.position.set(Math.cos(t + Math.PI) * r, y, Math.sin(t + Math.PI) * r);
        helixGroup.add(sB);

        // Connector
        if (i % 3 === 0) {
            const connGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, r * 2, 6);
            const conn = new THREE.Mesh(connGeo, connMat);
            conn.position.set(0, y, 0);
            conn.rotation.z = Math.PI / 2;
            conn.rotation.y = t;
            helixGroup.add(conn);
        }
    }

    helixGroup.position.x = 5;

    // Floating molecules
    const molecules = [];
    const molGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const molColors = [0x00d4ff, 0x7c3aed, 0xff2d78, 0x39ff14];
    for (let i = 0; i < 6; i++) {
        const mol = new THREE.Mesh(molGeo, new THREE.MeshBasicMaterial({ color: molColors[i % 4], transparent: true, opacity: 0.5, wireframe: true }));
        mol.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5);
        mol.userData = { speed: 0.4 + Math.random() * 0.6, ox: mol.position.x, oy: mol.position.y };
        scene.add(mol);
        molecules.push(mol);
    }

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Resize
    const handleResize = () => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Animate
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        helixGroup.rotation.y = time * 0.3;
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.04;
        camera.position.y += (mouseY * 1 - camera.position.y) * 0.04;

        molecules.forEach((m, i) => {
            m.position.y = m.userData.oy + Math.sin(time * m.userData.speed + i) * 1.5;
            m.position.x = m.userData.ox + Math.cos(time * m.userData.speed * 0.5 + i) * 0.8;
            m.rotation.x += 0.01;
            m.rotation.y += 0.015;
        });

        renderer.render(scene, camera);
    }
    animate();
}

// ===================================================
// CANVAS PARTICLE SYSTEM
// ===================================================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const N = 70;
    const dots = Array.from({ length: N }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(d => {
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
            if (d.y < 0 || d.y > canvas.height) d.vy *= -1;

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,212,255,0.5)';
            ctx.fill();
        });

        // Connections
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// ===================================================
// 3D CARD TILT
// ===================================================
function init3DTilt() {
    document.querySelectorAll('.product-card').forEach(card => {
        if (card._tiltInit) return;
        card._tiltInit = true;
        const shine = card.querySelector('.card-shine');

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
            card.style.transform = `translateY(-8px) rotateY(${x * 8}deg) rotateX(${y * 6}deg)`;
            card.style.transition = 'transform 0.1s linear';
            if (shine) { shine.style.setProperty('--x', (e.clientX - rect.left) / rect.width * 100 + '%'); shine.style.setProperty('--y', (e.clientY - rect.top) / rect.height * 100 + '%'); }
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s ease';
        });
    });
}

// ===================================================
// WISHLIST
// ===================================================
window.toggleWishlist = function(id) {
    if (event) event.stopPropagation();
    const idx = wishlist.indexOf(id);
    if (idx > -1) { wishlist.splice(idx, 1); showToast('Removed from wishlist', 'info'); }
    else { wishlist.push(id); showToast('❤️ Added to wishlist'); }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    loadProducts();
};

// ===================================================
// PRODUCT MODAL
// ===================================================
function initModal() {
    const modal = document.getElementById('productModal');
    document.getElementById('modalOverlay')?.addEventListener('click', closeProductModal);
    document.getElementById('modalClose')?.addEventListener('click', closeProductModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeProductModal(); });
}

window.openProductModal = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const isWished = wishlist.includes(p.id);
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

    document.getElementById('modalBody').innerHTML = `
        <div class="modal-body">
            <div class="modal-product-content">
                <div class="modal-product-image">${p.emoji}</div>
                <div class="modal-product-info">
                    <div class="product-category-tag" style="position:relative;top:auto;left:auto;display:inline-block;margin-bottom:0.8rem;">${p.category}</div>
                    <h2>${p.name}</h2>
                    <div style="display:flex;align-items:center;gap:0.8rem;margin:0.5rem 0;">
                        <span class="stars">${stars}</span>
                        <span style="color:var(--text-muted);font-size:0.85rem;">(${p.reviews} reviews)</span>
                    </div>
                    <div class="price">$${p.price.toFixed(2)} <span class="price-original" style="font-size:1.1rem;">$${p.originalPrice.toFixed(2)}</span> <span style="color:#39ff14;font-size:0.9rem;font-weight:700;">-${discount}%</span></div>
                    <p class="product-desc">${p.desc}</p>
                    <div class="modal-meta"><strong>Category:</strong> ${p.category} &nbsp;|&nbsp; <strong>In Stock:</strong> <span style="color:#39ff14;">✓ Available</span></div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="addToCart(${p.id});closeProductModal();" style="flex:1;">🛒 Add to Cart</button>
                        <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="toggleWishlist(${p.id})" style="position:relative;width:50px;height:50px;opacity:1;transform:scale(1);">${isWished ? '❤️' : '🤍'}</button>
                    </div>
                </div>
            </div>
        </div>`;

    const modal = document.getElementById('productModal');
    modal?.classList.add('active');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
};

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ===================================================
// MINI CART
// ===================================================
function initMiniCart() {
    const cartBtn = document.getElementById('cartBtn');
    const miniCart = document.getElementById('miniCart');
    const close = document.getElementById('miniCartClose');

    cartBtn?.addEventListener('mouseenter', () => {
        if (cart.length > 0 && window.innerWidth > 768) { updateMiniCart(); miniCart?.classList.add('active'); }
    });
    cartBtn?.addEventListener('click', e => {
        if (window.innerWidth <= 768) { e.preventDefault(); updateMiniCart(); miniCart?.classList.toggle('active'); }
    });
    miniCart?.addEventListener('mouseleave', () => { if (window.innerWidth > 768) miniCart.classList.remove('active'); });
    close?.addEventListener('click', () => miniCart?.classList.remove('active'));
}

function updateMiniCart() {
    const items = document.getElementById('miniCartItems');
    const total = document.getElementById('miniCartTotal');
    if (!items) return;
    if (cart.length === 0) {
        items.innerHTML = `<div class="mini-cart-empty"><div class="mini-cart-empty-icon">🛒</div><p>Your cart is empty</p></div>`;
        if (total) total.textContent = '$0.00';
        return;
    }
    const sum = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    items.innerHTML = cart.map(i => `
        <div class="mini-cart-item">
            <div class="mini-cart-item-emoji">${i.emoji || '💊'}</div>
            <div class="mini-cart-item-info">
                <div class="mini-cart-item-title">${i.name}</div>
                <div class="mini-cart-item-price">$${i.price.toFixed(2)} × ${i.qty || 1}</div>
            </div>
        </div>`).join('');
    if (total) total.textContent = `$${sum.toFixed(2)}`;
}

// ===================================================
// CART LOGIC
// ===================================================
window.addToCart = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const ex = cart.find(c => c.id === id);
    if (ex) ex.qty++;
    else cart.push({ ...p, qty: 1 });
    saveCart();
    showToast(`✅ ${p.name} added to cart`);
    const mc = document.getElementById('miniCart');
    if (mc?.classList.contains('active')) updateMiniCart();
    animateFAB();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((a, i) => a + (i.qty || 1), 0);
    document.querySelectorAll('.cart-count').forEach(b => {
        b.textContent = count;
        b.style.display = count === 0 ? 'none' : 'flex';
        b.style.animation = 'none';
        setTimeout(() => b.style.animation = 'bounceIn 0.4s ease', 10);
    });
}

// ===================================================
// TOAST
// ===================================================
function showToast(msg, type = 'success') {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = type === 'info' ? 'var(--primary)' : type === 'error' ? 'var(--accent)' : 'var(--neon-green)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ===================================================
// FLOATING ACTION BUTTON
// ===================================================
function initFAB() {
    const fab = document.getElementById('fabBtn');
    if (!fab) return;
    window.addEventListener('scroll', () => {
        fab.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }, { passive: true });
    fab.style.display = 'none';
}

function animateFAB() {
    const fab = document.getElementById('fabBtn');
    if (!fab) return;
    fab.style.transform = 'scale(1.4) rotate(15deg)';
    setTimeout(() => fab.style.transform = '', 300);
}

// ===================================================
// NEWSLETTER
// ===================================================
window.handleNewsletter = function(e) {
    e.preventDefault();
    showToast('🎉 Welcome! Check your inbox soon.');
    e.target.reset();
};
