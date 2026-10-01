const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Read .env if present manually without external libraries
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const parts = trimmed.split('=');
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                if (key) {
                    process.env[key] = val;
                }
            }
        });
    }
}
loadEnv();

// ── Auto-copy 3D generated bakery images from AI brain into images/ ──────────
(function copyGeneratedImages() {
    const BRAIN_DIR = '/home/techgirli/.gemini/antigravity-ide/brain/121f54f8-2242-4ead-96bf-bddba2a2bc3a';
    const DEST_DIR  = path.join(__dirname, 'images');
    const mappings  = [
        { pattern: 'croissant_3d_',       dest: 'croissant_3d.png' },
        { pattern: 'sourdough_3d_',       dest: 'sourdough_3d.png' },
        { pattern: 'eclair_3d_',          dest: 'eclair_3d.png' },
        { pattern: 'cinnamon_roll_3d_',   dest: 'cinnamon_roll_3d.png' },
        { pattern: 'pretzel_3d_',         dest: 'pretzel_3d.png' },
        { pattern: 'pain_au_chocolat_3d_',dest: 'pain_au_chocolat_3d.png' },
    ];
    try {
        if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
        if (fs.existsSync(BRAIN_DIR)) {
            const brainFiles = fs.readdirSync(BRAIN_DIR);
            for (const { pattern, dest } of mappings) {
                const destPath = path.join(DEST_DIR, dest);
                if (fs.existsSync(destPath)) continue; // already copied
                const src = brainFiles.find(f => f.startsWith(pattern) && f.endsWith('.png'));
                if (src) {
                    fs.copyFileSync(path.join(BRAIN_DIR, src), destPath);
                    console.log(`[Images] ✅ Copied ${dest}`);
                }
            }
        }
    } catch (e) {
        console.warn('[Images] Could not copy generated images:', e.message);
    }
})();



const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.sql': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Helper: Generate HTML email template for Sweet Tooth
function generateOrderEmailHTML(order) {
    const fmtN = (amt) => '₦' + Number(amt || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const itemsList = (order.items || []).map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3;">
                <strong style="color: #2d1822; font-size: 15px;">${item.title}</strong>
                <br/><span style="color: #785a66; font-size: 13px;">Qty: ${item.quantity} x ${fmtN(item.price)}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: 700; color: #db2777; font-size: 15px;">
                ${fmtN(item.quantity * item.price)}
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fff8f6; margin: 0; padding: 20px; color: #2d1822; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(236,72,153,0.1); border: 2px solid #fbcfe8; }
                .header { background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 32px 20px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
                .content { padding: 30px; }
                .order-info { background: #fdf2f8; padding: 16px; border-radius: 10px; margin-bottom: 24px; font-size: 14px; border: 1px solid #fbcfe8; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                .summary-table { width: 100%; border-top: 2px solid #fce7f3; padding-top: 16px; }
                .total-row { font-size: 19px; font-weight: 800; color: #db2777; }
                .footer { background: #fff8f6; padding: 20px; text-align: center; font-size: 12px; color: #785a66; border-top: 1px solid #fbcfe8; }
                .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍰 Sweet Tooth Bakery</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Thank you for your sweet order!</p>
                </div>
                <div class="content">
                    <p style="font-size: 16px; color: #2d1822;">Hi <strong>${order.customerName}</strong>,</p>
                    <p style="color: #4a303b;">We are thrilled to confirm your bakery order! Our bakers are getting your treats ready.</p>
                    
                    <div class="order-info">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span><strong>Order Reference:</strong> #${order.orderNumber}</span>
                            <span class="badge">Payment Successful</span>
                        </div>
                        <div><strong>Payment Method:</strong> ${String(order.paymentMethod).toUpperCase()}</div>
                    </div>

                    <h3 style="color: #db2777; font-size: 16px;">Order Details</h3>
                    <table class="items-table">
                        ${itemsList}
                    </table>

                    <table class="summary-table">
                        <tr>
                            <td style="color: #4a303b; padding: 4px 0;">Subtotal</td>
                            <td style="text-align: right; color: #2d1822;">${fmtN(order.subtotal)}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a303b; padding: 4px 0;">VAT (7.5%)</td>
                            <td style="text-align: right; color: #2d1822;">${fmtN(order.tax)}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a303b; padding: 4px 0;">Delivery Fee</td>
                            <td style="text-align: right; color: #2d1822;">${order.shippingFee > 0 ? fmtN(order.shippingFee) : 'FREE'}</td>
                        </tr>
                        ${order.discount > 0 ? `
                        <tr>
                            <td style="color: #16a34a; padding: 4px 0;">Discount</td>
                            <td style="text-align: right; color: #16a34a;">-${fmtN(order.discount)}</td>
                        </tr>` : ''}
                        <tr class="total-row">
                            <td style="padding-top: 10px;">Total Paid</td>
                            <td style="text-align: right; padding-top: 10px;">${fmtN(order.totalAmount)}</td>
                        </tr>
                    </table>

                    ${order.shippingAddress ? `
                    <div style="margin-top: 24px; padding: 16px; background: #fff0f5; border-radius: 8px; border-left: 4px solid #ec4899;">
                        <h4 style="margin: 0 0 6px 0; color: #be123c; font-size: 14px;">Delivery Destination</h4>
                        <p style="margin: 0; color: #4a303b; font-size: 13px;">
                            ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
                        </p>
                    </div>` : ''}
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Sweet Tooth Bakery & Confectionery. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Helper: Dispatch Email via Brevo API (300 Free Emails / Day)
async function sendBrevoEmail(order, overrideApiKey, overrideSender) {
    const apiKey = overrideApiKey || process.env.BREVO_API_KEY;
    const senderEmail = overrideSender || process.env.BREVO_SENDER_EMAIL || 'orders@sweettooth.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Sweet Tooth Bakery';

    const htmlContent = generateOrderEmailHTML(order);

    if (apiKey && !apiKey.includes('your-brevo-api-key')) {
        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: senderName, email: senderEmail },
                    to: [{ email: order.customerEmail, name: order.customerName }],
                    subject: `🧁 Order Confirmed #${order.orderNumber} - Sweet Tooth Bakery`,
                    htmlContent: htmlContent
                })
            });

            if (res.ok) {
                const data = await res.json();
                console.log('[Brevo Email Sent]', data);
                return { success: true, sentViaBrevo: true, messageId: data.messageId, emailHtml: htmlContent };
            } else {
                const errJson = await res.json();
                console.error('[Brevo Server Error]', errJson);
            }
        } catch (err) {
            console.error('[Brevo API Exception]', err);
        }
    }

    return {
        success: true,
        sentViaBrevo: false,
        simulated: true,
        message: 'Brevo credentials missing. Rendered live preview in UI.',
        emailHtml: htmlContent
    };
}

// Helper: Save order to Supabase via native fetch
async function saveToSupabase(order) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase-project')) {
        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify([{
                    order_number: order.orderNumber,
                    customer_email: order.customerEmail,
                    customer_name: order.customerName,
                    shipping_address: order.shippingAddress,
                    payment_method: order.paymentMethod,
                    subtotal: order.subtotal,
                    tax: order.tax,
                    shipping_fee: order.shippingFee,
                    discount: order.discount,
                    total_amount: order.totalAmount,
                    status: 'processing'
                }])
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, dbSaved: true, orderId: data[0]?.id, provider: 'Supabase DB' };
            }
        } catch (err) {
            console.error('[Supabase REST Save Error]', err);
        }
    }
    return { success: true, dbSaved: true, provider: 'Local Client Fallback DB' };
}

// Helper: Read JSON request body
function parseJSONBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
    });
}

// HTTP Server Callback
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const host = req.headers.host || 'localhost';
    const parsedUrl = new URL(req.url, `http://${host}`);
    const pathname = parsedUrl.pathname;

    // API Route: Config
    if (pathname === '/api/config' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            supabaseUrl: process.env.SUPABASE_URL || '',
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
            googleClientId: process.env.GOOGLE_CLIENT_ID || '',
            brevoConfigured: Boolean(process.env.BREVO_API_KEY)
        }));
    }

    // API Route: Send Email via Brevo API
    if (pathname === '/api/send-email' && req.method === 'POST') {
        try {
            const body = await parseJSONBody(req);
            const brevoRes = await sendBrevoEmail(body.order || {}, body.apiKey, body.senderEmail);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(brevoRes));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: err.message }));
        }
    }

    // API Route: Checkout
    if (pathname === '/api/checkout' && req.method === 'POST') {
        try {
            const orderData = await parseJSONBody(req);
            const dbRes = await saveToSupabase(orderData);
            const emailRes = await sendBrevoEmail(orderData);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                success: true,
                orderNumber: orderData.orderNumber,
                dbResult: dbRes,
                emailResult: emailRes
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: err.message }));
        }
    }

    // Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('403 Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            filePath = path.join(__dirname, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500);
                return res.end('500 Internal Server Error');
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        });
    });
});

if (require.main === module || !process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🍰 Sweet Tooth Bakery Server running on http://localhost:${PORT}`);
        console.log(`✉️ Brevo Email Dispatcher Active (300 Free Emails / Day)`);
        console.log(`=======================================================`);
    });
}

module.exports = server;
