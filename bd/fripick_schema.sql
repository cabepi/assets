-- 1. Tabla Padre: Control de Cargas / Procesamientos
CREATE TABLE IF NOT EXISTS asset.procesamientos (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'PROCESADO', -- Ej: PENDIENTE, PROCESADO, ERROR
    total_registros INT DEFAULT 0,
    observaciones TEXT,
    tipo_archivo VARCHAR(50) NOT NULL, -- ALMUERZO, FARMACIA
    billing_period VARCHAR(6) -- Format YYYYMM, e.g. 202601
);

-- 2. Tabla Hija: Detalle de los consumos (Relacionada al Excel)
CREATE TABLE IF NOT EXISTS asset.detalles_consumos (
    id SERIAL PRIMARY KEY,
    carga_id INT NOT NULL, -- Relación con la tabla padre
    codigo_empleado VARCHAR(50) NOT NULL, -- VARCHAR para soportar ceros a la izq o guiones (ej: 027-0050946-2)
    nombre_empleado VARCHAR(200),
    centro_costo VARCHAR(50),
    cantidad NUMERIC(10, 2) DEFAULT 0,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    impuestos NUMERIC(15, 2) DEFAULT 0,
    propina_10 NUMERIC(15, 2) DEFAULT 0,
    total_facturado NUMERIC(15, 2) DEFAULT 0,
    asignacion NUMERIC(15, 2) DEFAULT 0,
    monto_a_descontar NUMERIC(15, 2) DEFAULT 0,
    
    -- Definición de la llave foránea con borrado en cascada
    CONSTRAINT fk_carga_consumo
        FOREIGN KEY (carga_id)
        REFERENCES asset.procesamientos(id)
        ON DELETE CASCADE
);

-- 3. Índices para Búsquedas Rápidas (Requerimiento Crítico)

-- Índice para buscar por Código de Empleado (Búsqueda exacta)
CREATE INDEX IF NOT EXISTS idx_consumos_codigo_emp 
ON asset.detalles_consumos(codigo_empleado);

-- Índice para buscar por Centro de Costo (Agrupaciones frecuentes)
CREATE INDEX IF NOT EXISTS idx_consumos_centro_costo 
ON asset.detalles_consumos(centro_costo);

-- Índice para buscar por Nombre (Usamos operador de clases 'text_pattern_ops' si usas LIKE 'Nombre%')
CREATE INDEX IF NOT EXISTS idx_consumos_nombre 
ON asset.detalles_consumos(nombre_empleado varchar_pattern_ops);

-- Índice para optimizar JOINS con la tabla padre (Muy importante para reportes)
CREATE INDEX IF NOT EXISTS idx_consumos_carga_id 
ON asset.detalles_consumos(carga_id);
