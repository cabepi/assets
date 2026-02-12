-- 1. Parent Table: Processing Batches (Control de Cargas)
CREATE TABLE IF NOT EXISTS asset.processing_batches (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PROCESADO', -- E.g., PENDING, PROCESSED, ERROR
    total_records INT DEFAULT 0,
    comments TEXT,
    file_type VARCHAR(50) NOT NULL, -- ALMUERZO, FARMACIA
    period VARCHAR(6) -- Format YYYYMM, e.g. 202601
);

-- 2. Child Table: Consumption Details (Detalle de consumos)
CREATE TABLE IF NOT EXISTS asset.consumption_details (
    id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL, -- Relation to parent table
    employee_code VARCHAR(50) NOT NULL, -- VARCHAR to support leading zeros or dashes
    employee_name VARCHAR(200),
    cost_center VARCHAR(50),
    
    quantity NUMERIC(10, 2) DEFAULT 0,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    taxes NUMERIC(15, 2) DEFAULT 0,
    tip_amount NUMERIC(15, 2) DEFAULT 0,
    total_billed NUMERIC(15, 2) DEFAULT 0,
    company_subsidy NUMERIC(15, 2) DEFAULT 0,
    employee_deduction NUMERIC(15, 2) DEFAULT 0,
    
    -- Foreign key with cascade delete
    CONSTRAINT fk_batch_detail
        FOREIGN KEY (batch_id)
        REFERENCES asset.processing_batches(id)
        ON DELETE CASCADE
);

-- 3. Indices for Fast Search

-- Index for searching by Employee Code (Exact match)
CREATE INDEX IF NOT EXISTS idx_details_employee_code 
ON asset.consumption_details(employee_code);

-- Index for searching by Cost Center
CREATE INDEX IF NOT EXISTS idx_details_cost_center 
ON asset.consumption_details(cost_center);

-- Index for searching by Name (using 'text_pattern_ops' for LIKE operator)
CREATE INDEX IF NOT EXISTS idx_details_employee_name 
ON asset.consumption_details(employee_name varchar_pattern_ops);

-- Index to optimize JOINS with parent table
CREATE INDEX IF NOT EXISTS idx_details_batch_id 
ON asset.consumption_details(batch_id);
