import { db } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedHistoricalData() {
    console.log('📦 Seeding historical assets and assignments...');

    try {
        const client = await db.connect();

        const sqlPath = path.join(process.cwd(), 'historical_data.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Execute raw SQL (the file is wrapped in BEGIN/COMMIT)
        await client.query(sqlContent);

        console.log('✅ Historical data inserted successfully.');

        // Validation counts
        const assetCount = await client.sql`SELECT count(*) FROM asset.fixed_assets`;
        const assignmentCount = await client.sql`SELECT count(*) FROM asset.assignments`;

        console.log(`📊 Total assets in DB: ${assetCount.rows[0].count}`);
        console.log(`📊 Total assignments in DB: ${assignmentCount.rows[0].count}`);

        client.release();
    } catch (err) {
        console.error('❌ Error seeding historical data:', err);
    }
}

seedHistoricalData();
