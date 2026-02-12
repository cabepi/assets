import { sql } from "@vercel/postgres";

async function main() {
    console.log('Starting migration: renaming accounting_account to fripick_subsidy_account...');

    try {
        await sql`
      ALTER TABLE asset.users 
      RENAME COLUMN accounting_account TO fripick_subsidy_account;
    `;
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
