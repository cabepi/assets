import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
    try {
        console.log("Starting migration for Features 4, 6, 7...");

        // 1. Create Location History Table
        await sql`
      CREATE TABLE IF NOT EXISTS asset.location_history (
        history_id SERIAL PRIMARY KEY,
        asset_id INT REFERENCES asset.fixed_assets(asset_id),
        previous_location_id INT REFERENCES asset.locations(location_id),
        new_location_id INT REFERENCES asset.locations(location_id),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT
      );
    `;
        console.log("Created asset.location_history table.");

        // 2. Add Retirement Columns to fixed_assets
        // We use DO block or simple ALTER. ALTER IF NOT EXISTS is not standard in all Postgres versions for columns.
        // simpler to just try adding them.
        try {
            await sql`ALTER TABLE asset.fixed_assets ADD COLUMN IF NOT EXISTS retirement_date DATE;`;
            await sql`ALTER TABLE asset.fixed_assets ADD COLUMN IF NOT EXISTS retirement_reason TEXT;`;
            console.log("Added retirement columns to asset.fixed_assets.");
        } catch (e) {
            console.log("Columns might already exist or error adding them:", e);
        }

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
