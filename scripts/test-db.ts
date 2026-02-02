import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Testing database connection...");
    try {
        const result = await db.execute(sql`SELECT NOW()`);
        console.log("Connection successful!");
        console.log("Server time:", result.rows[0]);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    }
}

main();
