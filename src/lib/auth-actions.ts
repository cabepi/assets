'use server';

import { sql } from "@vercel/postgres";
import { generateOTP, sendOTPEmail, createSession } from "./auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function sendLoginOTP(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: "Email is required" };
    }

    try {
        // 1. Verify user exists
        const userResult = await sql`
            SELECT user_id, email, role, full_name, department FROM asset.users WHERE email = ${email} AND is_active = true
        `;

        if (userResult.rowCount === 0) {
            return { error: "Usuario no encontrado o inactivo." };
        }

        const user = userResult.rows[0];

        // 2. Generate and Save OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        console.log("🔐 DEV OTP:", code); // Log for local testing

        await sql`
            INSERT INTO asset.otp_codes (user_id, email, code, expires_at)
            VALUES (${user.user_id}, ${email}, ${code}, ${expiresAt.toISOString()})
        `;

        // 3. Send Email
        await sendOTPEmail(email, code);

        return { success: true, email };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Error interno del servidor." };
    }
}

export async function verifyLoginOTP(email: string, code: string) {
    if (!email || !code) {
        return { error: "Email y código son requeridos" };
    }

    try {
        // 1. Validate OTP
        const result = await sql`
            SELECT * FROM asset.otp_codes 
            WHERE email = ${email} 
              AND code = ${code}
              AND used = false
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;

        if (result.rowCount === 0) {
            return { error: "Código inválido o expirado." };
        }

        const otpRecord = result.rows[0];

        // 2. Mark as used
        await sql`UPDATE asset.otp_codes SET used = true WHERE id = ${otpRecord.id}`;

        // 3. Get User Details (Again, to be safe)
        const userResult = await sql`SELECT user_id, email, role, full_name FROM asset.users WHERE user_id = ${otpRecord.user_id}`;
        const user = userResult.rows[0];

        // 4. Create Session
        const token = await createSession({
            user_id: user.user_id,
            email: user.email,
            role: user.role
        });

        // 5. Set Cookie
        const cookieStore = await cookies();
        cookieStore.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return { success: true };
    } catch (error) {
        console.error("Verify Error:", error);
        return { error: "Error verificando código." };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    redirect('/login');
}
