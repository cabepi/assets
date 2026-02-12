import { sql } from '@vercel/postgres';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
    try {
        console.log('Starting migration to English naming convention...');

        // 1. Drop old tables if they exist
        console.log('Dropping old tables...');
        await sql`DROP TABLE IF EXISTS asset.detalles_consumos CASCADE`;
        await sql`DROP TABLE IF EXISTS asset.procesamientos CASCADE`;

        // Also drop new tables if they exist to ensure clean state during development/testing of this script
        await sql`DROP TABLE IF EXISTS asset.consumption_details CASCADE`;
        await sql`DROP TABLE IF EXISTS asset.processing_batches CASCADE`;


        // 2. Create new parent table: processing_batches
        console.log('Creating table asset.processing_batches...');
        await sql`
            CREATE TABLE asset.processing_batches (
                id SERIAL PRIMARY KEY,
                file_name VARCHAR(255) NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'PROCESADO',
                total_records INT DEFAULT 0,
                comments TEXT,
                file_type VARCHAR(50) NOT NULL,
                period VARCHAR(6),
                metadata JSONB
            )
        `;

        // 3. Create new child table: consumption_details
        console.log('Creating table asset.consumption_details...');
        await sql`
            CREATE TABLE asset.consumption_details (
                id SERIAL PRIMARY KEY,
                batch_id INT NOT NULL,
                employee_code VARCHAR(50) NOT NULL,
                employee_name VARCHAR(200),
                cost_center VARCHAR(50),
                
                quantity NUMERIC(10, 2) DEFAULT 0,
                subtotal NUMERIC(15, 2) DEFAULT 0,
                taxes NUMERIC(15, 2) DEFAULT 0,
                tip_amount NUMERIC(15, 2) DEFAULT 0,
                total_billed NUMERIC(15, 2) DEFAULT 0,
                company_subsidy NUMERIC(15, 2) DEFAULT 0,
                employee_deduction NUMERIC(15, 2) DEFAULT 0,

                CONSTRAINT fk_batch_detail
                    FOREIGN KEY (batch_id)
                    REFERENCES asset.processing_batches(id)
                    ON DELETE CASCADE
            )
        `;

        // 4. Create Indices
        console.log('Creating indices...');
        await sql`CREATE INDEX idx_details_employee_code ON asset.consumption_details(employee_code)`;
        await sql`CREATE INDEX idx_details_cost_center ON asset.consumption_details(cost_center)`;
        await sql`CREATE INDEX idx_details_employee_name ON asset.consumption_details(employee_name varchar_pattern_ops)`;
        await sql`CREATE INDEX idx_details_batch_id ON asset.consumption_details(batch_id)`;

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration error:', error);
    }
    process.exit(0);
}

migrate();
