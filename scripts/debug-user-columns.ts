
import { sql } from "@vercel/postgres";
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    try {
        const result = await sql`SELECT * FROM asset.users LIMIT 1`;
        console.log("Columns found:");
        if (result.rows.length > 0) {
            console.log(Object.keys(result.rows[0]));
        } else {
            console.log("No rows found, fetching column info directly");
            // Fallback to strict select column names
            const cols = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'asset' AND table_name = 'users'
            `;
            console.table(cols.rows);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
main();
