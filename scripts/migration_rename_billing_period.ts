import { sql } from '@vercel/postgres';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
    try {
        console.log('Renaming periodo -> billing_period...');
        await sql`ALTER TABLE asset.procesamientos RENAME COLUMN periodo TO billing_period`;
        console.log('Column renamed successfully.');
    } catch (error: any) {
        if (error.message?.includes('does not exist')) {
            console.log('Column "periodo" does not exist, checking if billing_period already exists...');
            const check = await sql`
                SELECT column_name FROM information_schema.columns 
                WHERE table_schema = 'asset' AND table_name = 'procesamientos' AND column_name = 'billing_period'
            `;
            if (check.rows.length > 0) {
                console.log('Column "billing_period" already exists. Nothing to do.');
            } else {
                console.log('Neither column exists. Adding billing_period...');
                await sql`ALTER TABLE asset.procesamientos ADD COLUMN billing_period VARCHAR(6)`;
                console.log('Column added.');
            }
        } else {
            console.error('Migration error:', error);
        }
    }
    process.exit(0);
}

migrate();
