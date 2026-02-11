import { sql } from "@vercel/postgres";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function initDB() {
    try {
        const schemaPath = path.join(process.cwd(), "bd/fripick_schema.sql");
        const sqlContent = fs.readFileSync(schemaPath, "utf8");

        console.log("🚀 Executing SQL schema...");
        // Split by semicolon to execute commands individually if needed, 
        // but sql template literal might handle it or fail on multiple statements.
        // Let's try executing the whole block if supported, or split.
        // Vercel postgres usually requires single statements or careful handling.
        // Splitting by ';' is safer for migration scripts.

        const commands = sqlContent
            .split(";")
            .map((cmd) => cmd.trim())
            .filter((cmd) => cmd.length > 0);

        for (const cmd of commands) {
            console.log(`Executing: ${cmd.substring(0, 50)}...`);
            await sql.query(cmd);
        }

        console.log("✅ Database initialized successfully.");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
    }
}

initDB();
