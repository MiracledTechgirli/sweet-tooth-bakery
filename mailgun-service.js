/**
 * SWEET TOOTH BAKERY - MULTI-PROVIDER EMAIL CONFIRMATION SERVICE
 * Supports Resend (FREE 3,000 emails/mo with onboarding@resend.dev domain),
 * Brevo (FREE 300 emails/day), Mailgun, and Live Interactive HTML Preview.
 */

class EmailService {
    constructor() {
        this.provider = localStorage.getItem('sweet_email_provider') || 'resend';
        this.apiKey = localStorage.getItem('sweet_email_key') || '';
        this.domain = localStorage.getItem('sweet_email_domain') || '';
        this.sender = localStorage.getItem('sweet_email_sender') || 'Sweet Tooth Bakery <onboarding@resend.dev>';
    }

    saveCredentials(provider, apiKey, domain, sender) {
        this.provider = provider || 'resend';
        this.apiKey = apiKey;
        this.domain = domain;
        this.sender = sender || (provider === 'resend' ? 'Sweet Tooth <onboarding@resend.dev>' : `orders@${domain}`);

        localStorage.setItem('sweet_email_provider', this.provider);
        localStorage.setItem('sweet_email_key', apiKey);
        localStorage.setItem('sweet_email_domain', domain);
        localStorage.setItem('sweet_email_sender', this.sender);
    }

    // Main dispatcher for order confirmation email
    async sendOrderConfirmation(orderData) {
        // 1. Try server backend endpoint
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: orderData, provider: this.provider, apiKey: this.apiKey, domain: this.domain, sender: this.sender })
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            }
        } catch (err) {
            console.warn('[Email Service] Backend route unavailable, trying direct client dispatch:', err);
        }

        // 2. Direct client dispatch if Resend API key is set
        if (this.provider === 'resend' && this.apiKey) {
            return await this.sendResendAPI(orderData);
        }

        // 3. Fallback: Generate HTML and return simulated dispatch for visual preview modal
        const htmlContent = this.generateHTMLTemplate(orderData);
        return {
            success: true,
            sentViaAPI: false,
            simulated: true,
            provider: 'Live Visual Preview (Simulated)',
            message: 'Email confirmation rendered. You can enter a free Resend key in API settings.',
            emailHtml: htmlContent
        };
    }

    // Resend API Dispatch (Free 3,000 emails/month, works out of the box with onboarding@resend.dev)
    async sendResendAPI(orderData) {
        const htmlContent = this.generateHTMLTemplate(orderData);
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: this.sender || 'Sweet Tooth Bakery <onboarding@resend.dev>',
                    to: [orderData.customerEmail],
                    subject: `🧁 Order Confirmed #${orderData.orderNumber} - Sweet Tooth Bakery`,
                    html: htmlContent
                })
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, sentViaAPI: true, provider: 'Resend API (FREE)', messageId: data.id, emailHtml: htmlContent };
            } else {
                const errData = await res.json();
                return { success: false, error: errData.message || 'Resend error', emailHtml: htmlContent };
            }
        } catch (err) {
            return { success: false, error: err.message, emailHtml: htmlContent };
        }
    }

    // HTML Email Template Generator
    generateHTMLTemplate(order) {
        const items = order.items || [];
        const itemsRows = items.map(item => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #fce7f3; vertical-align: middle;">
                    <div style="font-weight: 700; color: #2d1822; font-size: 15px;">${item.title}</div>
                    <div style="color: #785a66; font-size: 13px; margin-top: 2px;">Qty: ${item.quantity} × $${Number(item.price).toFixed(2)}</div>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: 700; color: #db2777; vertical-align: middle; font-size: 15px;">
                    $${(item.quantity * item.price).toFixed(2)}
                </td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fff8f6; margin: 0; padding: 24px; color: #2d1822; }
                    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.1); border: 2px solid #fbcfe8; }
                    .banner { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
                    .banner-icon { font-size: 46px; margin-bottom: 8px; }
                    .banner h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                    .banner p { margin: 6px 0 0 0; opacity: 0.9; font-size: 15px; }
                    .body-content { padding: 32px 28px; }
                    .order-badge-row { display: flex; justify-content: space-between; align-items: center; background: #fdf2f8; padding: 14px 18px; border-radius: 10px; margin-bottom: 24px; border: 1px solid #fbcfe8; }
                    .status-pill { background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; }
                    .section-title { font-size: 15px; font-weight: 800; color: #db2777; margin: 24px 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                    .summary-box { background: #fdf2f8; border-radius: 12px; padding: 18px; border: 1px solid #fbcfe8; }
                    .summary-line { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; color: #4a303b; font-weight: 600; }
                    .summary-total { display: flex; justify-content: space-between; font-size: 19px; font-weight: 800; color: #db2777; padding-top: 10px; border-top: 2px dashed #fbcfe8; margin-top: 8px; }
                    .address-box { background: #fff0f5; border-left: 4px solid #ec4899; padding: 16px; border-radius: 8px; margin-top: 24px; }
                    .footer { text-align: center; padding: 24px; background: #fff8f6; border-top: 1px solid #fbcfe8; font-size: 12px; color: #785a66; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="banner">
                        <div class="banner-icon">🍰</div>
                        <h2>Order Confirmed!</h2>
                        <p>Order #${order.orderNumber} • Sweet Tooth Bakery</p>
                    </div>
                    <div class="body-content">
                        <div style="font-size: 17px; font-weight: 700; margin-bottom: 8px; color: #2d1822;">Hi ${order.customerName},</div>
                        <p style="margin: 0 0 20px 0; color: #4a303b; line-height: 1.5; font-size: 15px;">
                            Thank you for ordering with Sweet Tooth! We've received your request and our bakers are crafting your delicious treats now.
                        </p>

                        <div class="order-badge-row">
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; color: #785a66; font-weight: 700;">Order Reference</div>
                                <div style="font-weight: 800; color: #db2777; font-size: 16px;">#${order.orderNumber}</div>
                            </div>
                            <span class="status-pill">Freshly Preparing</span>
                        </div>

                        <div class="section-title">Your Sweet Treats</div>
                        <table class="table">
                            ${itemsRows}
                        </table>

                        <div class="summary-box">
                            <div class="summary-line">
                                <span>Subtotal</span>
                                <span>$${Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div class="summary-line">
                                <span>Sales Tax (8%)</span>
                                <span>$${Number(order.tax).toFixed(2)}</span>
                            </div>
                            <div class="summary-line">
                                <span>Delivery Fee</span>
                                <span>${order.shippingFee > 0 ? '$' + Number(order.shippingFee).toFixed(2) : 'FREE'}</span>
                            </div>
                            ${order.discount > 0 ? `
                            <div class="summary-line" style="color: #16a34a; font-weight: 700;">
                                <span>Promo Discount</span>
                                <span>-$${Number(order.discount).toFixed(2)}</span>
                            </div>` : ''}
                            <div class="summary-total">
                                <span>Total Amount Paid</span>
                                <span>$${Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="address-box">
                            <div style="font-weight: 700; font-size: 14px; color: #be123c; margin-bottom: 4px;">Delivery Destination</div>
                            <div style="font-size: 13px; color: #4a303b; line-height: 1.4;">
                                ${order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` : 'Provided at checkout'}
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <div>&copy; ${new Date().getFullYear()} Sweet Tooth Bakery & Confectionery. All rights reserved.</div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    openEmailPreviewModal(orderData, emailResult) {
        let modal = document.getElementById('email-preview-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'email-preview-modal';
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        const htmlBody = emailResult.emailHtml || this.generateHTMLTemplate(orderData);
        const statusBadge = emailResult.sentViaAPI
            ? `<span class="badge badge-fresh"><i class="ph ph-check-circle"></i> Sent via ${emailResult.provider || 'Email API'}</span>`
            : `<span class="badge badge-bestseller"><i class="ph ph-info"></i> Simulated Preview Mode</span>`;

        modal.innerHTML = `
            <div class="modal-card modal-large">
                <div class="modal-header">
                    <div>
                        <h3 style="margin:0; font-size:18px; font-family:var(--font-heading); color:#2d1822;">📩 Confirmation Email Preview</h3>
                        <div style="margin-top:4px;">${statusBadge}</div>
                    </div>
                    <button class="icon-btn" onclick="document.getElementById('email-preview-modal').classList.remove('active')">&times;</button>
                </div>
                <div class="modal-body" style="padding:16px; background:#fff8f6; height: 500px; display:flex; flex-direction:column;">
                    <div style="background:#fdf2f8; color:#4a303b; padding:8px 12px; border-radius:6px; font-size:13px; margin-bottom:12px; border:1px solid #fbcfe8;">
                        To: <span style="color:#db2777; font-weight:700;">${orderData.customerEmail}</span> | Subject: <span style="color:#db2777; font-weight:700;">🧁 Order Confirmed #${orderData.orderNumber}</span>
                    </div>
                    <iframe id="email-iframe" style="width:100%; height:100%; border:none; border-radius:8px; background:white;"></iframe>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('email-preview-modal').classList.remove('active')">Close</button>
                    <button class="btn btn-primary" onclick="window.print()">Print Bakery Receipt</button>
                </div>
            </div>
        `;

        modal.classList.add('active');
        const iframe = document.getElementById('email-iframe');
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(htmlBody);
        doc.close();
    }
}

// Global service bindings for compatibility
window.emailService = new EmailService();
window.mailgunService = window.emailService;
