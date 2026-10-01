/**
 * SUPABASE & NEON DATABASE SERVICE MODULE
 * Handles database operations with automatic fallback to client-side store if keys are not provided.
 */

class SupabaseService {
    constructor() {
        this.client = null;
        this.isConfigured = false;
        this.fallbackStoreKey = 'apex_store_db_fallback_v1';
        this.init();
    }

    init() {
        const savedUrl = localStorage.getItem('apex_supabase_url');
        const savedKey = localStorage.getItem('apex_supabase_key');

        if (savedUrl && savedKey) {
            this.connect(savedUrl, savedKey);
        } else if (window.supabase) {
            // Check if window has default environment credentials supplied
            fetch('/api/config')
                .then(res => res.json())
                .then(config => {
                    if (config.supabaseUrl && config.supabaseAnonKey) {
                        this.connect(config.supabaseUrl, config.supabaseAnonKey);
                    }
                })
                .catch(() => {});
        }
    }

    connect(url, key) {
        try {
            if (window.supabase && url && key) {
                this.client = window.supabase.createClient(url, key);
                this.isConfigured = true;
                localStorage.setItem('apex_supabase_url', url);
                localStorage.setItem('apex_supabase_key', key);
                console.log('[Supabase Client] Connected successfully.');
                return true;
            }
        } catch (err) {
            console.error('[Supabase Client] Connection failed:', err);
            this.isConfigured = false;
        }
        return false;
    }

    disconnect() {
        this.client = null;
        this.isConfigured = false;
        localStorage.removeItem('apex_supabase_url');
        localStorage.removeItem('apex_supabase_key');
    }

    // Save order to Supabase DB (or local fallback)
    async saveOrder(orderData) {
        if (this.isConfigured && this.client) {
            try {
                // 1. Insert into orders table
                const { data: orderRow, error: orderErr } = await this.client
                    .from('orders')
                    .insert([{
                        order_number: orderData.orderNumber,
                        customer_email: orderData.customerEmail,
                        customer_name: orderData.customerName,
                        shipping_address: orderData.shippingAddress,
                        payment_method: orderData.paymentMethod || 'credit_card',
                        subtotal: orderData.subtotal,
                        tax: orderData.tax,
                        shipping_fee: orderData.shippingFee,
                        discount: orderData.discount || 0,
                        total_amount: orderData.totalAmount,
                        status: 'processing'
                    }])
                    .select()
                    .single();

                if (orderErr) throw orderErr;

                // 2. Insert into order_items table
                const itemsToInsert = orderData.items.map(item => ({
                    order_id: orderRow.id,
                    product_id: item.id && item.id.length > 20 ? item.id : null,
                    product_title: item.title,
                    product_image: item.image_url,
                    price: item.price,
                    quantity: item.quantity,
                    total_price: item.price * item.quantity
                }));

                const { error: itemsErr } = await this.client
                    .from('order_items')
                    .insert(itemsToInsert);

                if (itemsErr) console.warn('[Supabase Order Items Error]', itemsErr);

                return { success: true, dbSaved: true, orderId: orderRow.id, provider: 'Supabase DB' };
            } catch (err) {
                console.error('[Supabase DB Save Error, utilizing local fallback]', err);
                return this.saveOrderLocalFallback(orderData);
            }
        } else {
            return this.saveOrderLocalFallback(orderData);
        }
    }

    saveOrderLocalFallback(orderData) {
        try {
            const existing = JSON.parse(localStorage.getItem(this.fallbackStoreKey) || '[]');
            const record = {
                id: 'local-' + Date.now(),
                ...orderData,
                created_at: new Date().toISOString()
            };
            existing.unshift(record);
            localStorage.setItem(this.fallbackStoreKey, JSON.stringify(existing));
            return { success: true, dbSaved: true, orderId: record.id, provider: 'Browser Local Storage (Fallback DB)' };
        } catch (err) {
            console.error('Failed to save to local fallback DB', err);
            return { success: false, error: err.message };
        }
    }

    async getOrders() {
        if (this.isConfigured && this.client) {
            try {
                const { data, error } = await this.client
                    .from('orders')
                    .select('*, order_items(*)')
                    .order('created_at', { ascending: false });

                if (!error && data) return data;
            } catch (err) {
                console.warn('[Supabase Fetch Orders Error]', err);
            }
        }
        // Local fallback
        return JSON.parse(localStorage.getItem(this.fallbackStoreKey) || '[]');
    }

    async syncUser(googleUser) {
        if (!this.isConfigured || !this.client) return null;
        try {
            const { data, error } = await this.client
                .from('users')
                .upsert([{
                    google_id: googleUser.sub || googleUser.id,
                    email: googleUser.email,
                    full_name: googleUser.name,
                    avatar_url: googleUser.picture
                }], { onConflict: 'email' })
                .select()
                .single();

            if (!error) return data;
        } catch (err) {
            console.warn('[Supabase User Sync Error]', err);
        }
        return null;
    }
}

window.dbService = new SupabaseService();
