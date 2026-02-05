-- 1. CREACIÓN DEL ESQUEMA
CREATE SCHEMA IF NOT EXISTS asset;

-- 2. TABLAS DE CATÁLOGOS (Tablas maestras)
CREATE TABLE IF NOT EXISTS asset.categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    depreciation_years INT DEFAULT 3 -- Útil para el cálculo automático
);

CREATE TABLE IF NOT EXISTS asset.locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS asset.users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'employee', -- admin, manager, employee, auditor
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA PRINCIPAL DE ACTIVOS
CREATE TABLE IF NOT EXISTS asset.fixed_assets (
    asset_id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(20) UNIQUE NOT NULL, -- Código QR/Barras
    name VARCHAR(255) NOT NULL, -- Nombre descriptivo del activo
    category_id INT REFERENCES asset.categories(category_id),
    brand VARCHAR(50),
    model VARCHAR(50),
    serial_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'stock', -- stock, assigned, maintenance, retired
    
    -- Especificaciones técnicas (JSON para flexibilidad tecnológica)
    technical_specs JSONB, 
    
    -- Datos Financieros
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15, 2) NOT NULL,
    salvage_value DECIMAL(15, 2) DEFAULT 0, -- Valor residual
    depreciation_method VARCHAR(50), -- Método de depreciación específico del activo
    
    -- Información de Garantía
    warranty_provider VARCHAR(150),
    warranty_type VARCHAR(100),
    warranty_expiration_date DATE,
    
    location_id INT REFERENCES asset.locations(location_id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Campos para Bajas/Retiros
    retirement_date DATE,
    retirement_reason TEXT
);

-- 3.1 HISTORIAL DE UBICACIONES
CREATE TABLE IF NOT EXISTS asset.location_history (
    history_id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES asset.fixed_assets(asset_id),
    previous_location_id INT REFERENCES asset.locations(location_id),
    new_location_id INT REFERENCES asset.locations(location_id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- 4. GESTIÓN DE ASIGNACIONES (Check-in / Check-out)
CREATE TABLE IF NOT EXISTS asset.assignments (
    assignment_id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES asset.fixed_assets(asset_id),
    user_id INT REFERENCES asset.users(user_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP,
    condition_on_delivery TEXT,
    condition_on_return TEXT,
    digital_signature_path TEXT, -- Ruta a la imagen de la firma
    is_current BOOLEAN DEFAULT TRUE
);

-- 5. HISTORIAL DE MANTENIMIENTO
CREATE TABLE IF NOT EXISTS asset.maintenance_logs (
    log_id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES asset.fixed_assets(asset_id),
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(50), -- Preventivo, Correctivo, Upgrade
    description TEXT,
    cost DECIMAL(15, 2) DEFAULT 0,
    performed_by VARCHAR(100),
    next_service_date DATE
);

-- 6. DOCUMENTACIÓN ADJUNTA
CREATE TABLE IF NOT EXISTS asset.documents (
    document_id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES asset.fixed_assets(asset_id),
    file_name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- invoice, warranty, manual, photo
    file_url TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 7. CÓDIGOS OTP (2FA)
CREATE TABLE IF NOT EXISTS asset.otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES asset.users(user_id),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(4) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON asset.otp_codes(email);
