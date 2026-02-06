
import { emailService } from "./email-service";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

// --- Types ---
export interface AuthSession {
    user_id: number;
    email: string;
    job_title: string;
}

// --- OTP Logic ---
export function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendOTPEmail(toAddress: string, code: string) {
    try {
        await emailService.sendEmail(toAddress, code);
    } catch (error) {
        console.error("❌ Error sending email (Ignored for DEV mode):", error);
        // In DEV/Sandbox, we swallow the error so you can still log in with the Console OTP.
        // throw new Error("Failed to send email"); 
    }
}

// --- JWT Logic ---
export async function createSession(payload: AuthSession): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<AuthSession | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as AuthSession;
    } catch (error) {
        return null;
    }
}
