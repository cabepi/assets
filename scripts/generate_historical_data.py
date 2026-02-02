import unicodedata
import re
import csv

# --- Helpers from generate_users.py ---
def normalize_text(text):
    """Normalize text: remove accents, lower case."""
    if not text: return ""
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                  if unicodedata.category(c) != 'Mn').lower().strip()

def generate_email(name):
    # Same logic as before to match existing users
    clean_name = re.sub(r'\s*\(.*?\)\s*', '', name).strip()
    parts = clean_name.split()
    if not parts: return None
        
    first_name = parts[0]
    if len(parts) == 1:
        surname = parts[0]
    elif len(parts) == 2:
        surname = parts[1]
    else:
        if parts[1].lower() in ['de', 'del', 'la', 'las', 'los']:
             surname = "".join(parts[1:])
        else:
             surname = parts[-1]

    initial = normalize_text(first_name)[0]
    surname_clean = normalize_text(surname)
    return f"{initial}{surname_clean}@unipago.com.do"

# --- Main Parsing Logic ---

input_file = 'historical_data.txt'
output_file = 'historical_data.sql'

# Mappings
TYPE_MAPPING = {
    'Laptop': 'Laptop',
    'iPhone': 'Mobile',
    'Android': 'Mobile',
    'Tablet': 'Tablet'
}

# Values for SQL generation
update_user_stmts = []
insert_asset_stmts = []
insert_assignment_stmts = []

processed_serials = set()
processed_emails = set()

# We need to look up userId by email in the SQL context? 
# Or we can just use the email as a join key if we do a big DO block, 
# but simplest is:
# 1. Update users table based on email match.
# 2. Insert assets.
# 3. Insert assignments pointing to asset_id (lookup by serial?) and user_id (lookup by email).

# Let's read the file
with open(input_file, 'r', encoding='utf-8') as f:
    # It looks like tab separated or fixed width?
    # User said: "Name Rol Unidad Dirección / Area Activo Marca / Modelo asset_tag serial number Fecha compra Nombre del equipo Estado TIC"
    # The copy paste looks tab separated.
    reader = csv.DictReader(f, delimiter='\t')
    
    # Headers might be messy due to copy paste. Let's normalize headers manually or be flexible.
    # The file content saved has headers:
    # Name, Rol, Unidad, Dirección / Area, Activo, Marca / Modelo, asset_tag, serial number, Fecha compra, Nombre del equipo, Estado TIC
    
    for row in reader:
        # 1. User Info
        name = (row.get('Name') or '').strip()
        if not name or "KONEKSI" in name or "Conserje" in name:
            continue
            
        role = (row.get('Rol') or 'employee').strip()
        dept = (row.get('Unidad') or '').strip()
        
        email = generate_email(name)
        
        if email and email not in processed_emails:
            safe_role = role.replace("'", "''")
            safe_dept = dept.replace("'", "''")
            
            stmt = f"UPDATE asset.users SET role = '{safe_role}', department = '{safe_dept}' WHERE email = '{email}';"
            update_user_stmts.append(stmt)
            processed_emails.add(email)

        # 2. Asset Info
        raw_type = (row.get('Activo') or '').strip()
        asset_type = TYPE_MAPPING.get(raw_type, 'Other')
        
        brand_model = (row.get('Marca / Modelo') or '').strip()
        parts = brand_model.split(' ', 1)
        brand = parts[0] if len(parts) > 0 else 'Unknown'
        model = parts[1] if len(parts) > 1 else 'Unknown'
        
        asset_tag = (row.get('asset_tag') or '').strip()
        serial = (row.get('serial number') or '').strip()
        purchase_date_raw = (row.get('Fecha compra') or '').strip() 
        purchase_date = f"'{purchase_date_raw}'" if purchase_date_raw and purchase_date_raw != 'N/A' else 'CURRENT_DATE'
        
        hostname = (row.get('Nombre del equipo') or '').strip()
        status_tic = (row.get('Estado TIC') or '').strip()
        
        # Asset Status Mapping
        status = 'in_stock'
        if status_tic == 'Asignada': status = 'assigned'
        elif status_tic == 'Disponible': status = 'in_stock'
        elif status_tic == 'En reparación': status = 'maintenance'
        elif status_tic == 'Retirado': status = 'retired'
        
        if not serial or serial == 'N/A':
            # Generate a temporary serial if needed? Or skip?
            # Some entries have N/A serial but have asset tag.
            # Use Asset Tag as serial fallback?
            if asset_tag and asset_tag != 'N/A':
                serial = f"TAG-{asset_tag}"
            else:
                serial = f"GEN-{hash(name+brand_model)}"
        
        if serial in processed_serials:
            continue
            
        processed_serials.add(serial)

        # INSERT Asset using correct schema
        # Schema: asset_tag, name, brand, model, serial_number, status, purchase_date, purchase_price
        safe_tag = (asset_tag if asset_tag and asset_tag != 'N/A' else serial).replace("'", "''")
        safe_serial = serial.replace("'", "''")
        safe_model = model.replace("'", "''")
        safe_brand = brand.replace("'", "''")
        safe_name = f"{brand} {model}".replace("'", "''")
        
        insert_asset_stmts.append(f"""
        INSERT INTO asset.fixed_assets (asset_tag, name, brand, model, serial_number, status, purchase_date, purchase_price)
        VALUES ('{safe_tag}', '{safe_name}', '{safe_brand}', '{safe_model}', '{safe_serial}', '{status}', {purchase_date}, 0)
        ON CONFLICT (serial_number) DO UPDATE SET 
            status = EXCLUDED.status,
            asset_tag = EXCLUDED.asset_tag,
            model = EXCLUDED.model,
            purchase_date = COALESCE(EXCLUDED.purchase_date, asset.fixed_assets.purchase_date);
        """)

        # 3. Assignment Info
        if status == 'assigned' and email:
            # Use correct schema: user_id, assigned_at, is_current
            insert_assignment_stmts.append(f"""
            INSERT INTO asset.assignments (asset_id, user_id, assigned_at, is_current)
            SELECT 
                a.asset_id, 
                u.user_id, 
                CURRENT_TIMESTAMP, 
                true
            FROM asset.fixed_assets a, asset.users u
            WHERE a.serial_number = '{safe_serial}' 
              AND u.email = '{email}'
            ON CONFLICT DO NOTHING;
            """)


# Generate SQL File
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("-- Carga de Datos Históricos\n")
    f.write("BEGIN;\n\n")
    
    f.write("-- 1. Actualizar Usuarios\n")
    for stmt in update_user_stmts:
        f.write(stmt + "\n")
        
    f.write("\n-- 2. Insertar Activos\n")
    for stmt in insert_asset_stmts:
        f.write(stmt + "\n")
        
    f.write("\n-- 3. Crear Asignaciones\n")
    for stmt in insert_assignment_stmts:
        f.write(stmt + "\n")
        
    f.write("\nCOMMIT;\n")

print(f"Generated SQL with {len(update_user_stmts)} user updates, {len(insert_asset_stmts)} assets, {len(insert_assignment_stmts)} assignments.")
