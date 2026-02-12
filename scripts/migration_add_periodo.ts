import { sql } from '@vercel/postgres';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
    try {
        console.log('Adding periodo column to asset.procesamientos...');
        await sql`
            ALTER TABLE asset.procesamientos 
            ADD COLUMN IF NOT EXISTS periodo VARCHAR(6)
        `;
        console.log('Column added successfully.');
    } catch (error) {
        console.error('Migration error:', error);
    }
    process.exit(0);
}

migrate();
