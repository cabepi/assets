
// Import auth/config if needed, actually we just need env vars

const API_CONFIG = {
    sendUrl: process.env.EMAIL_API_URL || '',
    authUrl: process.env.EMAIL_AUTH_URL || '',
    username: process.env.EMAIL_AUTH_USER || '',
    password: process.env.EMAIL_AUTH_PASS || '',
};

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

class EmailService {
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    private async getToken(): Promise<string> {
        // Return valid cached token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        console.log("🔄 Fetching new Email API Token...");

        const credentials = Buffer.from(`${API_CONFIG.username}:${API_CONFIG.password}`).toString('base64');

        try {
            const response = await fetch(API_CONFIG.authUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json' // Often required even if body empty
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Auth Failed: ${response.status} ${text}`);
            }

            // The API returns the token directly in the response body? Or as JSON? 
            // The prompt implied a token response structure but didn't specify exact JSON keys for the auth endpoint, 
            // but typical OAuth/Token endpoints return JSON.
            // Wait, the prompt says: 
            // "debes entonces setear los valores subject, body, addresses
            // ... primero se debe obtener un token, aqui lo tienes: ... utiliza una autenticacion Basic Auth"
            // It doesn't explicitly show the JSON response format for the token endpoint.
            // Assuming standard { access_token: "..." } or similar. 
            // Let's assume the response IS the token or contains it. 
            // Commonly it's JSON. Let's try to parse as JSON.

            const data = await response.json();

            // Adjust based on actual API response. Usually it's `access_token` or similar.
            // If the user didn't specify, I'll log detailed output if it fails, but I'll assume standard oauth structure.
            // Wait, looking at the CURL example provided by the user, they show a raw token string in the Bearer header. 
            // "Authorization: Bearer eyJra..."
            // I will assume the endpoint returns { access_token: "..." }. 
            // If the response is just the string, I'll handle that too.

            // Let's inspect 'data'.
            const token = data.access_token || data.token || (typeof data === 'string' ? data : null);

            if (!token) {
                console.error("Auth Response:", data);
                throw new Error("No token found in auth response");
            }

            this.accessToken = token;
            // Set expiry (default 1 hour if not provided, buffer 5 mins)
            const expiresIn = (data.expires_in || 3600) * 1000;
            this.tokenExpiry = Date.now() + expiresIn - 300000;

            return token;

        } catch (error) {
            console.error("❌ Email Auth Error:", error);
            throw error;
        }
    }

    private getTemplate(otp: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .header { background-color: #2563eb; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                    .content { padding: 40px 30px; text-align: center; color: #334155; }
                    .otp-box { background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 8px; font-size: 36px; font-weight: 800; color: #1e40af; padding: 20px; margin: 30px 0; letter-spacing: 8px; display: inline-block; }
                    .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>AssetTrack Pro</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
                        <p style="font-size: 16px; line-height: 1.5;">Has solicitado iniciar sesión. Utiliza el siguiente código de verificación para continuar:</p>
                        
                        <div class="otp-box">${otp}</div>
                        
                        <p style="font-size: 14px; color: #64748b;">Este código es válido por 5 minutos. Si no solicitaste este acceso, por favor ignora este correo.</p>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} AssetTrack Pro. Todos los derechos reservados.
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    async sendEmail(to: string, otp: string, retryConfig = { retries: 1 }): Promise<void> {
        try {
            const token = await this.getToken();

            const payload = {
                subject: "AssetTrack - Código de Verificación",
                body: this.getTemplate(otp),
                addresses: [to]
            };

            const response = await fetch(API_CONFIG.sendUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401 && retryConfig.retries > 0) {
                console.warn("⚠️ Token expired (401), refreshing and retrying...");
                this.accessToken = null; // Force refresh
                this.tokenExpiry = null;
                return this.sendEmail(to, otp, { retries: retryConfig.retries - 1 });
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Email Send Failed: ${response.status} ${text}`);
            }

            console.log(`✅ Email sent successfully to ${to}`);

        } catch (error) {
            console.error("❌ Email Service Error:", error);
            // Don't throw for now to avoid blocking login flow in case of API issues, 
            // similar to how we handled SES dev mode. 
            // But usually we SHOULD throw so the UI knows. 
            // Given the previous instruction to "not block login", I'll throw but the caller (auth-actions) handles it.
            // Wait, auth-actions swallows error? No, auth-actions returns {error}.
            // Actually, in the previous fix we swallowed the error inside `sendOTPEmail`. 
            // I will implement this service to throw, and update `auth.ts` to handle the error policy.
            throw error;
        }
    }
}

export const emailService = new EmailService();
