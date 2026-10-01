-- ==========================================================
-- SWEET TOOTH BAKERY DATABASE SCHEMA FOR SUPABASE / NEON
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    image_url TEXT NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.9,
    reviews_count INT DEFAULT 0,
    stock INT DEFAULT 50,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'credit_card',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'completed',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    mailgun_email_sent BOOLEAN DEFAULT FALSE,
    mailgun_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    product_image TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public order creation" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public order items creation" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow user profile creation" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user profile update" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow user profile select" ON users FOR SELECT USING (true);

-- ==========================================================
-- SEED DATA FOR SWEET TOOTH BAKERY & CONFECTIONERY
-- ==========================================================

INSERT INTO categories (id, name, slug, description) VALUES
('c2000000-0000-0000-0000-000000000001', 'Cakes', 'cakes', 'Artisanal celebration cakes & gateaux'),
('c2000000-0000-0000-0000-000000000002', 'Macarons', 'macarons', 'Handcrafted French macarons'),
('c2000000-0000-0000-0000-000000000003', 'Cookies', 'cookies', 'Freshly baked gourmet cookies'),
('c2000000-0000-0000-0000-000000000004', 'Cupcakes & Tarts', 'cupcakes-tarts', 'Delicate individual pastries'),
('c2000000-0000-0000-0000-000000000005', 'Chocolates', 'chocolates', 'Fine Belgian pralines & truffles')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, title, slug, description, price, original_price, category_name, image_url, rating, reviews_count, stock, is_featured, is_new) VALUES
(
    'p2000000-0000-0000-0000-000000000001',
    'Royal French Macarons Gift Box (12 Pcs)',
    'royal-french-macarons-box',
    'Assorted French macarons featuring salted caramel, pistachio, rose raspberry, and Madagascar vanilla.',
    34.50, 39.99, 'Macarons',
    'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
    4.9, 184, 40, true, true
),
(
    'p2000000-0000-0000-0000-000000000002',
    'Velvet Strawberry Shortcake & Fresh Cream',
    'velvet-strawberry-shortcake',
    'Fluffy vanilla sponge layered with organic strawberries, whipped white chocolate ganache, and edible rose petals.',
    48.00, 55.00, 'Cakes',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    4.9, 142, 25, true, false
),
(
    'p2000000-0000-0000-0000-000000000003',
    'Belgian Dark Chocolate Truffles Box',
    'belgian-dark-chocolate-truffles',
    'Hand-rolled 70% Valrhona dark chocolate truffles dusted with organic cocoa powder and crushed hazelnuts.',
    28.99, 32.50, 'Chocolates',
    'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    4.8, 98, 60, false, true
),
(
    'p2000000-0000-0000-0000-000000000004',
    'Matcha & Berry Blossom Cupcakes (6 Pack)',
    'matcha-berry-cupcakes',
    'Uji matcha infused sponge topped with pink buttercream frosting, fresh raspberries, and edible gold leaf.',
    26.00, 30.00, 'Cupcakes & Tarts',
    'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
    4.7, 115, 35, true, false
),
(
    'p2000000-0000-0000-0000-000000000005',
    'Chunky Double Chocolate Chunk Cookies',
    'chunky-double-chocolate-cookies',
    'Warm, gooey soft-baked cookies loaded with Belgian milk and dark chocolate chips. Set of 8 cookies.',
    22.50, 26.00, 'Cookies',
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    4.9, 230, 80, false, false
),
(
    'p2000000-0000-0000-0000-000000000006',
    'Fresh Blueberry Vanilla Tart with Mint',
    'fresh-blueberry-vanilla-tart',
    'Crisp buttery pastry crust filled with rich vanilla bean pastry cream and topped with fresh berries.',
    32.00, 38.00, 'Cupcakes & Tarts',
    'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    4.8, 86, 30, false, true
)
ON CONFLICT (slug) DO NOTHING;
