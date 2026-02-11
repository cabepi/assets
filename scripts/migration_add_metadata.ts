import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runMigration() {
    try {
        console.log("🚀 Running migration: Add metadata column to asset.procesamientos...");

        await sql`
            ALTER TABLE asset.procesamientos 
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
        `;

        console.log("✅ Migration successful: metadata column added.");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    }
}

runMigration();
