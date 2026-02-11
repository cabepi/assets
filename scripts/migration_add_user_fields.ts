
import { sql } from "@vercel/postgres";
import { config } from 'dotenv';

config({ path: '.env.local' });

async function migrateUserFields() {
    try {
        console.log('Adding new columns to asset.users table...');

        await sql`
            ALTER TABLE asset.users
            ADD COLUMN IF NOT EXISTS employee_code VARCHAR(25),
            ADD COLUMN IF NOT EXISTS document_number VARCHAR(25),
            ADD COLUMN IF NOT EXISTS cost_center VARCHAR(25),
            ADD COLUMN IF NOT EXISTS accounting_account VARCHAR(25);
        `;

        console.log('✅ asset.users table updated successfully!');
    } catch (error) {
        console.error('Error updating asset.users table:', error);
    }
}

migrateUserFields();
