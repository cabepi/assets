import { db } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function seedUsers() {
    console.log('🌱 Seeding users from SQL file...');

    try {
        const client = await db.connect();

        const sqlPath = path.join(process.cwd(), 'users_carga_inicial.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Execute raw SQL
        // Note: simple execution, might fail if multiple statements are strictly separated,
        // but our file is one big INSERT statement.
        await client.query(sqlContent);

        console.log('✅ Users inserted successfully.');

        // Validation count
        const count = await client.sql`SELECT count(*) FROM asset.users`;
        console.log(`📊 Total users in DB: ${count.rows[0].count}`);

        client.release();
    } catch (err) {
        console.error('❌ Error seeding users:', err);
    }
}

seedUsers();
