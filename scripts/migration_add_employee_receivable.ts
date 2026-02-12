import { sql } from "@vercel/postgres";

async function main() {
    console.log('Starting migration: adding employee_receivable_account...');

    try {
        // 1. Add column
        await sql`
      ALTER TABLE asset.users 
      ADD COLUMN IF NOT EXISTS employee_receivable_account VARCHAR(25);
    `;
        console.log('Column added.');

        // 2. Update existing records
        await sql`
      UPDATE asset.users 
      SET employee_receivable_account = '12301'
      WHERE employee_receivable_account IS NULL;
    `;
        console.log('Existing records updated with default value.');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
