/**
 * SWEET TOOTH BAKERY - BREVO (SENDINBLUE) EMAIL CONFIRMATION SERVICE
 * Dispatches bakery order confirmation emails via Brevo REST API (300 free emails/day) + visual preview modal.
 */

class BrevoEmailService {
    constructor() {
        this.apiKey = localStorage.getItem('sweet_brevo_key') || '';
        this.senderEmail = localStorage.getItem('sweet_brevo_sender') || '';
        this.senderName = 'Sweet Tooth Bakery';
    }

    saveCredentials(apiKey, senderEmail, senderName) {
        this.apiKey = apiKey;
        this.senderEmail = senderEmail || this.senderEmail;
        this.senderName = senderName || 'Sweet Tooth Bakery';

        localStorage.setItem('sweet_brevo_key', apiKey);
        localStorage.setItem('sweet_brevo_sender', this.senderEmail);
        localStorage.setItem('sweet_brevo_sender_name', this.senderName);
    }

    clearCredentials() {
        this.apiKey = '';
        this.senderEmail = '';
        localStorage.removeItem('sweet_brevo_key');
        localStorage.removeItem('sweet_brevo_sender');
        localStorage.removeItem('sweet_brevo_sender_name');
    }

    // Main method to dispatch confirmation email
    async sendOrderConfirmation(orderData) {
        // 1. Attempt backend server endpoint dispatch first
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order: orderData,
                    apiKey: this.apiKey,
                    senderEmail: this.senderEmail
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            }
        } catch (err) {
            console.warn('[Brevo Service] Backend endpoint unavailable, attempting direct client dispatch:', err);
        }

        // 2. Direct client Brevo API dispatch if key is saved in UI
        if (this.apiKey) {
            return await this.sendDirectBrevoAPI(orderData);
        }

        // 3. Fallback: Simulated preview mode
        const htmlContent = this.generateHTMLTemplate(orderData);
        return {
            success: true,
            sentViaBrevo: false,
            simulated: true,
            message: 'Brevo email dispatch simulated successfully. Live visual preview rendered.',
            emailHtml: htmlContent
        };
    }

    // Direct Brevo REST API v3 Caller
    async sendDirectBrevoAPI(orderData) {
        const htmlContent = this.generateHTMLTemplate(orderData);
        const sender = {
            name: this.senderName || 'Sweet Tooth Bakery',
            email: this.senderEmail || 'orders@sweettooth.com'
        };

        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: sender,
                    to: [
                        {
                            email: orderData.customerEmail,
                            name: orderData.customerName
                        }
                    ],
                    subject: `🧁 Order Confirmed #${orderData.orderNumber} - Sweet Tooth Bakery`,
                    htmlContent: htmlContent
                })
            });

            if (res.ok) {
                const data = await res.json();
                return {
                    success: true,
                    sentViaBrevo: true,
                    messageId: data.messageId,
                    emailHtml: htmlContent
                };
            } else {
                const errJson = await res.json();
                console.error('[Brevo Direct API Error]', errJson);
                return {
                    success: false,
                    error: errJson.message || 'Brevo API request failed',
                    emailHtml: htmlContent
                };
            }
        } catch (err) {
            console.error('[Brevo API Exception]', err);
            return {
                success: false,
                error: err.message,
                emailHtml: htmlContent
            };
        }
    }

    // HTML Email Template Generator
    generateHTMLTemplate(order) {
        const items = order.items || [];
        const fmtN = (amt) => '₦' + Number(amt || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const itemsRows = items.map(item => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #fce7f3; vertical-align: middle;">
                    <div style="font-weight: 700; color: #2d1822; font-size: 15px;">${item.title}</div>
                    <div style="color: #785a66; font-size: 13px; margin-top: 2px;">Qty: ${item.quantity} × ${fmtN(item.price)}</div>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #fce7f3; text-align: right; font-weight: 700; color: #db2777; vertical-align: middle; font-size: 15px;">
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
                                <span>${fmtN(order.subtotal)}</span>
                            </div>
                            <div class="summary-line">
                                <span>VAT (7.5%)</span>
                                <span>${fmtN(order.tax)}</span>
                            </div>
                            <div class="summary-line">
                                <span>Delivery Fee</span>
                                <span>${order.shippingFee > 0 ? fmtN(order.shippingFee) : 'FREE'}</span>
                            </div>
                            ${order.discount > 0 ? `
                            <div class="summary-line" style="color: #16a34a; font-weight: 700;">
                                <span>Promo Discount</span>
                                <span>-${fmtN(order.discount)}</span>
                            </div>` : ''}
                            <div class="summary-total">
                                <span>Total Amount Paid</span>
                                <span>${fmtN(order.totalAmount)}</span>
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
                        <div style="margin-top: 4px;">Powered by Brevo Email Infrastructure & Supabase Database.</div>
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
        const statusBadge = emailResult.sentViaBrevo
            ? `<span class="badge badge-fresh"><i class="ph ph-check-circle"></i> Sent via Brevo API</span>`
            : `<span class="badge badge-bestseller"><i class="ph ph-info"></i> Brevo Simulated Preview Mode</span>`;

        modal.innerHTML = `
            <div class="modal-card modal-large">
                <div class="modal-header">
                    <div>
                        <h3 style="margin:0; font-size:18px; font-family:var(--font-heading); color:#2d1822;">📩 Brevo Confirmation Email Preview</h3>
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

// Global service bindings
window.brevoService = new BrevoEmailService();
window.mailgunService = window.brevoService; // Backward compatibility alias
