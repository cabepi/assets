-- DUMMY DATA FOR ASSET TRACK PRO

-- 1. Locations
INSERT INTO asset.locations (name, address, city) VALUES
('Sede Central - Torre Reforma', 'Av. Paseo de la Reforma 483', 'Ciudad de México'),
('Oficina Norte - Monterrey', 'Av. Lázaro Cárdenas 2400', 'Monterrey'),
('Hub Tecnológico - Guadalajara', 'Av. Vallarta 1000', 'Guadalajara'),
('Almacén Central', 'Calle Industria 500', 'Ciudad de México');

-- 2. Categories
INSERT INTO asset.categories (name, description, depreciation_years) VALUES
('Laptops', 'Computadoras portátiles para empleados', 3),
('Monitores', 'Monitores externos de alta resolución', 5),
('Periféricos', 'Teclados, mouse, webcams, auriculares', 2),
('Mobiliario', 'Sillas ergonómicas, escritorios', 10),
('Servidores', 'Equipos de cómputo para centro de datos', 4);

-- 3. Users
INSERT INTO asset.users (full_name, email, department, is_active, role, password_hash) VALUES
('Carlos Méndez', 'carlos.mendez@techcorp.com', 'Ingeniería', TRUE, 'employee', 'hashed_pw_1'),
('Laura Gómez', 'laura.gomez@techcorp.com', 'Diseño', TRUE, 'employee', 'hashed_pw_2'),
('Ana Torres', 'ana.torres@techcorp.com', 'Recursos Humanos', TRUE, 'manager', 'hashed_pw_3'),
('Pedro Ruiz', 'pedro.ruiz@techcorp.com', 'Finanzas', TRUE, 'manager', 'hashed_pw_4'),
('Soporte IT', 'soporte@techcorp.com', 'TI', TRUE, 'admin', 'hashed_pw_5');

-- 4. Fixed Assets
INSERT INTO asset.fixed_assets 
(asset_tag, name, category_id, brand, model, serial_number, status, purchase_date, purchase_price, salvage_value, depreciation_method, warranty_provider, warranty_type, warranty_expiration_date, location_id, technical_specs) 
VALUES
('TECH-1001', 'MacBook Pro 16" M2', 1, 'Apple', 'MacBook Pro 16', 'C02FX1ABC2D3', 'assigned', '2023-01-15', 3500.00, 500.00, 'Línea Recta', 'Apple Store', 'AppleCare+', '2026-01-15', 1, '{"cpu": "M2 Max", "ram": "32GB", "storage": "1TB SSD"}'),
('TECH-1002', 'Dell XPS 15', 1, 'Dell', 'XPS 9520', '5XJ2K33', 'maintenance', '2022-11-20', 2200.00, 300.00, 'Línea Recta', 'Dell Support', 'ProSupport', '2025-11-20', 2, '{"cpu": "i7-12700H", "ram": "16GB", "storage": "512GB SSD"}'),
('TECH-2001', 'Monitor LG UltraFine', 2, 'LG', '32UN880', '904KELW112', 'stock', '2023-03-10', 650.00, 50.00, 'Línea Recta', 'Amazon', 'Standard', '2024-03-10', 4, '{"resolution": "4K", "size": "32 inch"}'),
('TECH-3001', 'Herman Miller Aeron', 4, 'Herman Miller', 'Aeron B', 'HM-AER-009', 'assigned', '2021-06-01', 1200.00, 200.00, 'Línea Recta', 'Herman Miller Mexico', '12 Year Warranty', '2033-06-01', 1, '{"size": "B", "color": "Carbon"}');

-- 5. Assignments
INSERT INTO asset.assignments (asset_id, user_id, assigned_at, condition_on_delivery, is_current) VALUES
(1, 1, '2023-01-20 09:00:00', 'Nuevo, caja sellada', TRUE), -- MacBook to Carlos
(4, 1, '2023-01-20 09:00:00', 'Excelente estado', TRUE), -- Chair to Carlos
(2, 2, '2022-11-25 10:30:00', 'Nuevo', TRUE); -- Dell to Laura (Before maintenance)

-- Update Dell assignment to returned regarding maintenance status (simulated logic)
UPDATE asset.assignments SET returned_at = '2024-01-15 14:00:00', condition_on_return = 'Pantalla parpadea', is_current = FALSE WHERE asset_id = 2;


-- 6. Maintenance Logs
INSERT INTO asset.maintenance_logs (asset_id, maintenance_date, maintenance_type, description, cost, performed_by, next_service_date) VALUES
(2, '2024-01-16', 'Correctivo', 'Reemplazo de pantalla por parpadeo intermitente', 350.00, 'Dell Service Center', '2024-07-16'),
(1, '2023-07-20', 'Preventivo', 'Limpieza interna y revisión de ventiladores', 50.00, 'Soporte IT Interno', '2024-01-20');

-- 7. Location History (New Feature)
INSERT INTO asset.location_history (asset_id, previous_location_id, new_location_id, changed_at, reason) VALUES
(2, 1, 2, '2024-01-16 10:00:00', 'Envío a soporte técnico (Oficina Norte)'),
(2, 2, 4, '2024-01-20 09:00:00', 'Regreso a Almacén tras reparación');

-- 8. Retired Asset Example (New Feature)
INSERT INTO asset.fixed_assets 
(asset_tag, name, category_id, brand, model, serial_number, status, purchase_date, purchase_price, salvage_value, depreciation_method, retirement_date, retirement_reason, location_id, technical_specs) 
VALUES
('TECH-0099', 'Old Server Rack', 5, 'HP', 'ProLiant G6', 'HP-OLD-999', 'retired', '2015-06-01', 5000.00, 200.00, 'Línea Recta', '2024-02-01', 'Obsoleto, reemplazado por R750', 4, '{"cpu": "Xeon E5520", "ram": "16GB"}');

-- 9. Documents
INSERT INTO asset.documents (asset_id, file_name, type, file_url) VALUES
(1, 'Factura_Apple_1001.pdf', 'Factura', '/docs/invoices/2023/apple_1001.pdf'),
(1, 'AppleCare_Cert.pdf', 'Garantía', '/docs/warranties/apple_care_1001.pdf');
