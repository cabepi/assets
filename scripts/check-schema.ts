
import { sql } from "@vercel/postgres";
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    try {
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'asset' 
            AND table_name = 'users'
        `;
        console.log("Schema for asset.users:");
        console.table(result.rows);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
