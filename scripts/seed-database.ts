import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

async function seed() {
    console.log("🌱 Starting database seeding...");

    try {
        // Paths to SQL files
        const schemaPath = path.resolve(__dirname, "../../bd/scripts.sql");
        const dataPath = path.resolve(__dirname, "../../bd/dummy_data.sql");

        console.log(`📖 Reading SQL files from:\n - ${schemaPath}\n - ${dataPath}`);

        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        const dataSql = fs.readFileSync(dataPath, "utf8");

        // Execute Schema Creation
        console.log("🛠️  Creating Schema and Tables...");
        // Split by semicolons to execute statements individually if needed, 
        // but vercel/postgres might handle blocks. Let's try executing as block first or splitting.
        // For robust execution, splitting by ';' is safer for simple scripts.
        // However, CREATE SCHEMA and CREATE TABLE are DDL.

        // Simple split strategy (might break on semicolons in strings but unlikely in this specific schema)
        // A better approach for @vercel/postgres is usually one query per command, but let's try sending the whole block if supported or use a simplified split.

        console.log("   Executing scripts.sql...");
        await sql.query(schemaSql);
        console.log("✅ Schema created successfully.");

        // Execute Dummy Data
        console.log("📝 Inserting Dummy Data...");
        await sql.query(dataSql);
        console.log("✅ Dummy data inserted successfully.");

        console.log("🚀 Database setup complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
