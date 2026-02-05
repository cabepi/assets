
import { sql } from "@vercel/postgres";
import { config } from 'dotenv';

config({ path: '.env.local' });

async function createAuthSchema() {
    try {
        console.log('Creating asset.otp_codes table...');

        await sql`
            CREATE TABLE IF NOT EXISTS asset.otp_codes (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES asset.users(user_id),
                email VARCHAR(255) NOT NULL,
                code VARCHAR(4) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used BOOLEAN DEFAULT FALSE
            );
        `;

        // Index for faster lookups
        await sql`CREATE INDEX IF NOT EXISTS idx_otp_email ON asset.otp_codes(email)`;

        console.log('✅ Auth schema created successfully!');
    } catch (error) {
        console.error('Error creating auth schema:', error);
    }
}

createAuthSchema();
