/**
 * SWEET TOOTH BAKERY & CONFECTIONERY - MAIN APPLICATION CONTROLLER
 * Currency: Nigerian Naira (₦ / NGN)
 */

// Helper: Format currency in Nigerian Naira (₦)
function formatNaira(amount) {
    const num = Number(amount) || 0;
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

class App {
    constructor() {
        this.products = [];
        this.cart = [];
        this.currentCategory = 'all';
        this.currentSort = 'featured';
        this.searchQuery = '';
        this.discountRate = 0;
        this.promoCode = '';

        this.init();
    }

    init() {
        this.loadProducts();
        this.loadCart();
        this.bindEvents();
        this.renderCatalog();
        this.updateCartBadge();

        // Listen for Auth changes
        if (window.authService) {
            window.authService.onAuthChange((user) => this.renderUserProfile(user));
            this.renderUserProfile(window.authService.currentUser);
        }

        console.log('[Sweet Tooth Store App] Initialized successfully with Naira currency (₦).');
    }

    loadProducts() {
        this.products = [
            {
                id: 'p2000000-0000-0000-0000-000000000001',
                title: 'Royal French Macarons Gift Box (12 Pcs)',
                category: 'Macarons',
                price: 15500,
                originalPrice: 18000,
                rating: 4.9,
                reviewsCount: 184,
                image_url: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80',
                badge: 'BESTSELLER',
                isNew: true,
                description: 'Assorted artisan French macarons featuring salted caramel, pistachio, rose raspberry, and Madagascar vanilla bean.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000002',
                title: 'Velvet Strawberry Shortcake & Fresh Cream',
                category: 'Cakes',
                price: 22000,
                originalPrice: 25000,
                rating: 4.9,
                reviewsCount: 142,
                image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
                badge: 'FRESH BAKED',
                isNew: false,
                description: 'Fluffy vanilla sponge layered with organic strawberries, whipped white chocolate ganache, and edible rose petals.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000003',
                title: 'Belgian Dark Chocolate Truffles Box',
                category: 'Chocolates',
                price: 14000,
                originalPrice: 16500,
                rating: 4.8,
                reviewsCount: 98,
                image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
                badge: 'ORGANIC',
                description: 'Hand-rolled 70% Valrhona dark chocolate truffles dusted with organic cocoa powder and crushed roasted hazelnuts.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000004',
                title: 'Matcha & Berry Blossom Cupcakes (6 Pack)',
                category: 'Cupcakes & Tarts',
                price: 11500,
                originalPrice: 13500,
                rating: 4.7,
                reviewsCount: 115,
                image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
                badge: 'HOT',
                description: 'Uji matcha infused sponge topped with pink buttercream frosting, fresh raspberries, and edible gold leaf flakes.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000005',
                title: 'Chunky Double Chocolate Chunk Cookies',
                category: 'Cookies',
                price: 9500,
                originalPrice: 11000,
                rating: 4.9,
                reviewsCount: 230,
                image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
                badge: 'BESTSELLER',
                description: 'Warm, gooey soft-baked cookies loaded with Belgian milk and dark chocolate chunks. Set of 8 large cookies.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000006',
                title: 'Fresh Blueberry Vanilla Custard Tart',
                category: 'Cupcakes & Tarts',
                price: 16000,
                originalPrice: 19000,
                rating: 4.8,
                reviewsCount: 86,
                image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
                badge: 'FRESH BAKED',
                description: 'Crisp buttery pastry shell filled with rich vanilla bean pastry cream and topped with fresh blueberries & mint.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000007',
                title: 'Caramel Glazed Artisan Donuts Box (6 Pack)',
                category: 'Cupcakes & Tarts',
                price: 10000,
                originalPrice: 12000,
                rating: 4.9,
                reviewsCount: 165,
                image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
                badge: 'HOT',
                description: 'Light and airy brioche donuts dipped in salted caramel glaze and sprinkled with toasted almond flakes.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000008',
                title: 'Honey Pistachio & Rose Water Baklava Platter',
                category: 'Macarons',
                price: 18500,
                originalPrice: 21000,
                rating: 4.8,
                reviewsCount: 72,
                image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
                badge: 'ORGANIC',
                description: 'Crisp golden phyllo pastry layers crushed pistachios, orange blossom honey syrup, and fragrant rose water.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000009',
                title: 'Raspberry White Chocolate Mousse Gateau',
                category: 'Cakes',
                price: 26000,
                originalPrice: 30000,
                rating: 5.0,
                reviewsCount: 54,
                image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
                badge: 'BESTSELLER',
                isNew: true,
                description: 'Decadent white chocolate mousse cake with tart raspberry mirror glaze, vanilla dacquoise base, and fresh berries.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000010',
                title: 'Red Velvet Cream Cheese Cupcakes (6 Pack)',
                category: 'Cupcakes & Tarts',
                price: 12000,
                originalPrice: 14000,
                rating: 4.9,
                reviewsCount: 198,
                image_url: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
                badge: 'FRESH BAKED',
                description: 'Classic red velvet cupcakes topped with lush tang-sweet cream cheese frosting and cocoa dust.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000011',
                title: 'Artisanal Mango Passionfruit Cheesecake Slice',
                category: 'Cakes',
                price: 7500,
                originalPrice: 9000,
                rating: 4.8,
                reviewsCount: 110,
                image_url: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?auto=format&fit=crop&w=800&q=80',
                badge: 'HOT',
                description: 'Silky smooth New York cheesecake with tropical Alphonso mango puree and passionfruit seeds on graham crust.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000012',
                title: 'Assorted Gourmet Cake Pops Gift Box (10 Pcs)',
                category: 'Cookies',
                price: 13500,
                originalPrice: 15500,
                rating: 4.7,
                reviewsCount: 89,
                image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
                badge: 'ORGANIC',
                description: 'Handcrafted cake bites dipped in pastel chocolate shell with rainbow sprinkles and gold sugar crystals.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000013',
                title: 'Butter Croissants – Flaky Golden Classic (4 Pcs)',
                category: 'Breads & Pastries',
                price: 8500,
                originalPrice: 10000,
                rating: 4.9,
                reviewsCount: 213,
                image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
                badge: 'FRESH BAKED',
                isNew: true,
                description: 'Laminated all-butter croissants with 72 layers of flaky, golden perfection. Baked fresh every morning.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000014',
                title: 'Classic Glazed Chocolate Éclair (4 Pcs)',
                category: 'Cupcakes & Tarts',
                price: 12500,
                originalPrice: 15000,
                rating: 4.8,
                reviewsCount: 127,
                image_url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80',
                badge: 'HOT',
                description: 'Choux pastry filled with silky Madagascan vanilla cream and dipped in rich Belgian chocolate ganache.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000015',
                title: 'Sourdough Artisan Loaf – Country Style',
                category: 'Breads & Pastries',
                price: 6500,
                originalPrice: 7800,
                rating: 4.8,
                reviewsCount: 178,
                image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
                badge: 'ORGANIC',
                description: 'Slow-fermented 48-hour sourdough with a crackling crust, open crumb, and tangy depth of flavour.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000016',
                title: 'Lemon Drizzle Bundt Cake (Whole)',
                category: 'Cakes',
                price: 19500,
                originalPrice: 23000,
                rating: 4.9,
                reviewsCount: 91,
                image_url: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=800&q=80',
                badge: 'BESTSELLER',
                description: 'Fragrant lemon zest butter cake soaked in warm lemon syrup and crowned with a shiny lemon glaze.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000017',
                title: 'Snickerdoodle & Brown Butter Cookies (8 Pcs)',
                category: 'Cookies',
                price: 8000,
                originalPrice: 9500,
                rating: 4.7,
                reviewsCount: 144,
                image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
                badge: 'HOT',
                description: 'Soft centres with crinkled cinnamon-sugar edges. Made with nutty browned butter for deep caramel aroma.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000018',
                title: 'Strawberry Cream Puffs Tower (12 Pcs)',
                category: 'Cupcakes & Tarts',
                price: 21000,
                originalPrice: 24500,
                rating: 5.0,
                reviewsCount: 67,
                image_url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
                badge: 'BESTSELLER',
                isNew: true,
                description: 'Delicate choux puffs filled with Chantilly cream and fresh strawberry compote, dusted with icing sugar.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000019',
                title: 'Praline Milk Chocolate Bonbons (16 Pcs)',
                category: 'Chocolates',
                price: 17500,
                originalPrice: 20000,
                rating: 4.9,
                reviewsCount: 82,
                image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
                badge: 'ORGANIC',
                description: 'Handcrafted bonbons with creamy hazelnut praline centres enrobed in 40% Callebaut milk chocolate.'
            },
            {
                id: 'p2000000-0000-0000-0000-000000000020',
                title: 'Tres Leches Celebration Layer Cake',
                category: 'Cakes',
                price: 29500,
                originalPrice: 35000,
                rating: 4.9,
                reviewsCount: 49,
                image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
                badge: 'NEW',
                isNew: true,
                description: 'Three-milk-soaked vanilla sponge with fluffy whipped cream frosting and fresh tropical fruit decoration.'
            },

            // ── 3D AI-Illustrated Breads & Pastries ─────────────────────────
            {
                id: 'p3000000-0000-0000-0000-000000000021',
                title: 'Powdered Butter Croissant – Marble Slab (1 Pc)',
                category: 'Breads & Pastries',
                price: 4500,
                originalPrice: 5500,
                rating: 5.0,
                reviewsCount: 311,
                image_url: '/images/croissant_3d.png',
                badge: 'FRESH BAKED',
                isNew: true,
                description: 'All-butter laminated croissant with 72 golden flaky layers, lightly dusted with icing sugar. Baked at dawn and served warm.'
            },
            {
                id: 'p3000000-0000-0000-0000-000000000022',
                title: 'Country Sourdough Boule – 48hr Ferment',
                category: 'Breads & Pastries',
                price: 7200,
                originalPrice: 8500,
                rating: 4.9,
                reviewsCount: 198,
                image_url: '/images/sourdough_3d.png',
                badge: 'ORGANIC',
                description: 'Slow-fermented sourdough boule with a crackling scored crust, open crumb structure, and deep tangy flavour. Best enjoyed warm.'
            },
            {
                id: 'p3000000-0000-0000-0000-000000000023',
                title: 'Gold-Flaked Dark Chocolate Éclair',
                category: 'Breads & Pastries',
                price: 6500,
                originalPrice: 8000,
                rating: 4.9,
                reviewsCount: 145,
                image_url: '/images/eclair_3d.png',
                badge: 'HOT',
                isNew: true,
                description: 'Choux pastry shell piped with Madagascan vanilla Chantilly cream and crowned with glossy Belgian chocolate ganache and gold leaf.'
            },
            {
                id: 'p3000000-0000-0000-0000-000000000024',
                title: 'Giant Cinnamon Roll – Cream Cheese Flood',
                category: 'Breads & Pastries',
                price: 8000,
                originalPrice: 9500,
                rating: 5.0,
                reviewsCount: 276,
                image_url: '/images/cinnamon_roll_3d.png',
                badge: 'BESTSELLER',
                isNew: true,
                description: 'Pillowy brioche dough rolled with cinnamon-brown sugar, baked until golden and buried under a flood of tangy cream cheese frosting.'
            },
            {
                id: 'p3000000-0000-0000-0000-000000000025',
                title: 'Bavarian Soft Pretzel – Sea Salt & Butter',
                category: 'Breads & Pastries',
                price: 5500,
                originalPrice: 6500,
                rating: 4.8,
                reviewsCount: 133,
                image_url: '/images/pretzel_3d.png',
                badge: 'HOT',
                description: 'Lye-dipped authentic Bavarian pretzel with a dark mahogany gloss, coarse sea salt crystals, and a pillowy-soft pull-apart interior.'
            },
            {
                id: 'p3000000-0000-0000-0000-000000000026',
                title: 'Pain au Chocolat – Double Dark Chocolate (2 Pcs)',
                category: 'Breads & Pastries',
                price: 7500,
                originalPrice: 9000,
                rating: 5.0,
                reviewsCount: 204,
                image_url: '/images/pain_au_chocolat_3d.png',
                badge: 'BESTSELLER',
                isNew: true,
                description: 'Buttery laminated pastry encasing two batons of 70% Valrhona dark chocolate. Flaky outside, molten chocolate within.'
            }
        ];
    }

    bindEvents() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-view');
                if (target) this.switchView(target);
            });
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderCatalog();
            });
        }

        // Category filter buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.getAttribute('data-category');
                this.renderCatalog();
            });
        });

        // Sort selector
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderCatalog();
            });
        }

        // Cart Drawer Toggles
        document.getElementById('open-cart-btn')?.addEventListener('click', () => this.toggleCartDrawer(true));
        document.getElementById('close-cart-btn')?.addEventListener('click', () => this.toggleCartDrawer(false));
        document.getElementById('cart-backdrop')?.addEventListener('click', () => this.toggleCartDrawer(false));

        // Checkout Button
        document.getElementById('proceed-checkout-btn')?.addEventListener('click', () => {
            this.toggleCartDrawer(false);
            this.switchView('checkout-view');
        });

        // Promo Code
        document.getElementById('apply-promo-btn')?.addEventListener('click', () => this.applyPromoCode());

        // Checkout Form Submit
        document.getElementById('checkout-form')?.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
    }

    switchView(viewId) {
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (viewId === 'checkout-view') {
            this.autoFillCheckoutDetails();
            this.renderCheckoutSummary();
        }
    }

    renderCatalog() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        let filtered = this.products.filter(item => {
            const matchesCategory = this.currentCategory === 'all' || item.category.toLowerCase() === this.currentCategory.toLowerCase();
            const matchesSearch = item.title.toLowerCase().includes(this.searchQuery) || item.category.toLowerCase().includes(this.searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (this.currentSort === 'low-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (this.currentSort === 'high-low') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (this.currentSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="ph ph-cookie" style="font-size: 48px; margin-bottom: 12px; display:block; color:#db2777;"></i>
                    <h3 style="color:#2d1822;">No sweet treats found</h3>
                    <p>Try searching for a different sweet keyword or bakery category.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(item => `
            <div class="product-card">
                <div class="product-image-wrap" onclick="app.openImageModal('${item.id}')" style="cursor:pointer;" title="Click to view full image">
                    ${item.badge ? `<span class="badge ${item.badge === 'FRESH BAKED' ? 'badge-fresh' : (item.badge === 'ORGANIC' ? 'badge-organic' : 'badge-bestseller')} product-badge-pos">${item.badge}</span>` : ''}
                    <img src="${item.image_url}" alt="${item.title}" class="product-image" loading="lazy" />
                    <div class="image-zoom-hint">🔍 View Picture</div>
                </div>
                <div class="product-info">
                    <span class="product-category">${item.category}</span>
                    <h3 class="product-title" onclick="app.openImageModal('${item.id}')" style="cursor:pointer;">${item.title}</h3>
                    <div class="product-rating">
                        <span>★ ${item.rating}</span>
                        <span style="color: var(--text-muted);">(${item.reviewsCount} reviews)</span>
                    </div>
                    <div class="product-price-row">
                        <div class="price-box">
                            <span class="current-price">${formatNaira(item.price)}</span>
                            ${item.originalPrice ? `<span class="original-price">${formatNaira(item.originalPrice)}</span>` : ''}
                        </div>
                        <button class="add-cart-btn" onclick="app.addToCart('${item.id}')">
                            + Add to Order
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Modal to view full picture & product details
    openImageModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        let modal = document.getElementById('image-view-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'image-view-modal';
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-card modal-large" style="background:#ffffff; border:2px solid #fbcfe8;">
                <div class="modal-header">
                    <h3 style="font-family:var(--font-heading); color:#2d1822; font-size:20px;">🍰 ${product.title}</h3>
                    <button class="icon-btn" onclick="document.getElementById('image-view-modal').classList.remove('active')">&times;</button>
                </div>
                <div class="modal-body" style="padding:24px; display:grid; grid-template-columns: 1fr 1fr; gap:24px; align-items:center;">
                    <div style="border-radius:var(--radius-md); overflow:hidden; border:2px solid #fce7f3; height:320px;">
                        <img src="${product.image_url}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                    <div>
                        <span class="badge badge-bestseller" style="margin-bottom:10px;">${product.category}</span>
                        <p style="color:#4a303b; font-size:15px; margin:12px 0 20px 0; line-height:1.6;">${product.description}</p>
                        <div style="font-family:var(--font-heading); font-size:30px; font-weight:700; color:#db2777; margin-bottom:20px;">
                            ${formatNaira(product.price)}
                            ${product.originalPrice ? `<span style="font-size:16px; color:#785a66; text-decoration:line-through; margin-left:8px;">${formatNaira(product.originalPrice)}</span>` : ''}
                        </div>
                        <button class="btn btn-primary" style="width:100%;" onclick="app.addToCart('${product.id}'); document.getElementById('image-view-modal').classList.remove('active');">
                            Add to Basket (${formatNaira(product.price)})
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    // CART MANAGEMENT
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existing = this.cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.updateCartBadge();
        this.renderCartDrawer();
        this.showToast(`Added "${product.title}" to basket! 🍰`);
    }

    updateCartQuantity(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(i => i.id !== productId);
            }
        }
        this.saveCart();
        this.updateCartBadge();
        this.renderCartDrawer();
        if (document.getElementById('checkout-view')?.classList.contains('active')) {
            this.renderCheckoutSummary();
        }
    }

    saveCart() {
        localStorage.setItem('sweettooth_cart', JSON.stringify(this.cart));
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('sweettooth_cart');
            if (saved) this.cart = JSON.parse(saved);
        } catch (e) {
            this.cart = [];
        }
    }

    updateCartBadge() {
        const count = this.cart.reduce((total, i) => total + i.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
    }

    toggleCartDrawer(open) {
        const drawer = document.getElementById('cart-drawer');
        const backdrop = document.getElementById('cart-backdrop');
        if (open) {
            this.renderCartDrawer();
            drawer?.classList.add('active');
            backdrop?.classList.add('active');
        } else {
            drawer?.classList.remove('active');
            backdrop?.classList.remove('active');
        }
    }

    renderCartDrawer() {
        const container = document.getElementById('cart-items-container');
        const subtotalEl = document.getElementById('cart-subtotal');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="ph ph-cookie" style="font-size: 48px; margin-bottom: 12px; display:block; color:#db2777;"></i>
                    <p>Your Sweet Tooth basket is empty.</p>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = '₦0.00';
            return;
        }

        let subtotal = 0;
        container.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${item.image_url}" alt="${item.title}" class="cart-item-img" />
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${formatNaira(item.price)}</div>
                        <div class="cart-qty-ctrl">
                            <button class="qty-btn" onclick="app.updateCartQuantity('${item.id}', -1)">-</button>
                            <span style="font-weight:700; font-size:14px; color:#2d1822;">${item.quantity}</span>
                            <button class="qty-btn" onclick="app.updateCartQuantity('${item.id}', 1)">+</button>
                            <button class="icon-btn" style="margin-left:auto; font-size:16px;" onclick="app.updateCartQuantity('${item.id}', -${item.quantity})">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (subtotalEl) subtotalEl.textContent = formatNaira(subtotal);
    }

    applyPromoCode() {
        const input = document.getElementById('promo-input');
        const val = input ? input.value.trim().toUpperCase() : '';

        if (val === 'SWEET10') {
            this.discountRate = 0.10;
            this.promoCode = 'SWEET10';
            this.showToast('Promo Code SWEET10 Applied! 10% Sweet Discount ✨');
        } else if (val === 'BAKERY20') {
            this.discountRate = 0.20;
            this.promoCode = 'BAKERY20';
            this.showToast('Promo Code BAKERY20 Applied! 20% Discount 🎉');
        } else {
            this.showToast('Invalid Promo Code. Try SWEET10 or BAKERY20');
            return;
        }
        this.renderCheckoutSummary();
    }

    // CHECKOUT SUMMARY & AUTOFILL
    autoFillCheckoutDetails() {
        const user = window.authService ? window.authService.currentUser : null;
        if (user) {
            const nameInput = document.getElementById('cust-name');
            const emailInput = document.getElementById('cust-email');
            if (nameInput && !nameInput.value) nameInput.value = user.name || '';
            if (emailInput && !emailInput.value) emailInput.value = user.email || '';
        }
    }

    renderCheckoutSummary() {
        const list = document.getElementById('checkout-items-list');
        const subtotalEl = document.getElementById('summary-subtotal');
        const taxEl = document.getElementById('summary-tax');
        const shippingEl = document.getElementById('summary-shipping');
        const discountEl = document.getElementById('summary-discount');
        const totalEl = document.getElementById('summary-total');

        if (!list) return;

        let subtotal = 0;
        list.innerHTML = this.cart.map(item => {
            const line = item.price * item.quantity;
            subtotal += line;
            return `
                <div class="order-summary-item">
                    <img src="${item.image_url}" alt="${item.title}" />
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px; color:#2d1822;">${item.title}</div>
                        <div style="font-size:12px; color:var(--text-muted);">Qty: ${item.quantity} × ${formatNaira(item.price)}</div>
                    </div>
                    <div style="font-weight:700; color:#db2777;">${formatNaira(line)}</div>
                </div>
            `;
        }).join('');

        const tax = subtotal * 0.075; // 7.5% VAT in Nigeria
        const shipping = subtotal > 35000 ? 0 : 2500; // ₦2,500 delivery fee
        const discount = subtotal * this.discountRate;
        const grandTotal = Math.max(0, subtotal + tax + shipping - discount);

        if (subtotalEl) subtotalEl.textContent = formatNaira(subtotal);
        if (taxEl) taxEl.textContent = formatNaira(tax);
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatNaira(shipping);
        if (discountEl) discountEl.textContent = '-' + formatNaira(discount);
        if (totalEl) totalEl.textContent = formatNaira(grandTotal);
    }

    // CHECKOUT SUBMISSION
    async handleCheckoutSubmit(e) {
        e.preventDefault();

        if (this.cart.length === 0) {
            this.showToast('Your basket is empty! Add sweet treats before checking out.');
            return;
        }

        const name = document.getElementById('cust-name').value;
        const email = document.getElementById('cust-email').value;
        const address = document.getElementById('cust-address').value;
        const city = document.getElementById('cust-city').value;
        const postalCode = document.getElementById('cust-zip').value;
        const country = document.getElementById('cust-country').value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'credit_card';

        const subtotal = this.cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const tax = subtotal * 0.075;
        const shippingFee = subtotal > 35000 ? 0 : 2500;
        const discount = subtotal * this.discountRate;
        const totalAmount = subtotal + tax + shippingFee - discount;

        const orderData = {
            orderNumber: 'SWT-' + Math.floor(100000 + Math.random() * 900000),
            customerName: name,
            customerEmail: email,
            shippingAddress: { address, city, postalCode, country },
            paymentMethod,
            subtotal,
            tax,
            shippingFee,
            discount,
            totalAmount,
            items: [...this.cart]
        };

        const submitBtn = document.getElementById('place-order-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Preparing Order... 🧁';
        }

        try {
            // 1. Persist to Database (Supabase / Neon DB or fallback)
            const dbResult = await window.dbService.saveOrder(orderData);

            // 2. Dispatch Confirmation Email via Brevo Service
            const brevoResult = await window.brevoService.sendOrderConfirmation(orderData);

            // Clear Cart & Render Confirmation View
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();

            this.renderConfirmationPage(orderData, dbResult, brevoResult);

        } catch (err) {
            console.error('[Checkout Execution Error]', err);
            this.showToast('Checkout encountered an issue. Saved locally.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Place Sweet Order & Pay';
            }
        }
    }

    renderConfirmationPage(orderData, dbResult, brevoResult) {
        this.switchView('order-confirmation-view');

        document.getElementById('conf-order-num').textContent = `#${orderData.orderNumber}`;
        document.getElementById('conf-email').textContent = orderData.customerEmail;
        document.getElementById('conf-db-status').textContent = dbResult.provider || 'Supabase Database';
        document.getElementById('conf-total').textContent = formatNaira(orderData.totalAmount);

        // Attach action listener for email preview
        const previewBtn = document.getElementById('preview-email-btn');
        if (previewBtn) {
            previewBtn.onclick = () => {
                window.brevoService.openEmailPreviewModal(orderData, brevoResult);
            };
        }
    }

    renderUserProfile(user) {
        const container = document.getElementById('user-profile-container');
        if (!container) return;

        if (user) {
            container.innerHTML = `
                <div class="user-profile-btn" onclick="window.authService.signOut()">
                    <img src="${user.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" class="user-avatar" />
                    <span style="font-size:13px; font-weight:700; color:#2d1822;">${user.givenName || user.name.split(' ')[0]}</span>
                    <i class="ph ph-sign-out" style="font-size:14px; color:#db2777;"></i>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="btn btn-secondary" style="padding: 6px 14px; font-size:13px;" onclick="app.openAuthModal()">
                    Sign In
                </button>
            `;
        }
    }

    openAuthModal() {
        let modal = document.getElementById('auth-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'auth-modal';
            modal.className = 'modal-backdrop';
            modal.innerHTML = `
                <div class="modal-card">
                    <div class="modal-header">
                        <h3 style="color:#2d1822; font-family:var(--font-heading);">🧁 Account Sign In</h3>
                        <button class="icon-btn" onclick="document.getElementById('auth-modal').classList.remove('active')">&times;</button>
                    </div>
                    <div class="modal-body" style="text-align:center;">
                        <p style="color:var(--text-secondary); margin-bottom:20px; font-weight:500;">
                            Sign in using your Google Cloud Console credentials to save your orders to your Sweet Tooth profile.
                        </p>
                        <div id="google-btn-container" style="display:flex; justify-content:center; margin-bottom:16px;"></div>
                        <div style="margin: 16px 0; font-size:12px; color:var(--text-muted);">OR</div>
                        <button class="btn btn-secondary" style="width:100%;" onclick="window.authService.simulateGoogleSignIn(); document.getElementById('auth-modal').classList.remove('active');">
                            🚀 Sign In with Google Sandbox
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.classList.add('active');
        if (window.authService) window.authService.renderGoogleButton();
    }

    showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
