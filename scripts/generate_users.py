import unicodedata
import re

employees = """
Francis Mariñez
Carmen Turbides
Gina Cordero
Gina Cordero
Francis Mariñez
Candida Hernandez
Gina Ogando
Lucas Gaitan
Lucas Gaitan
Jennifer Calcaño
Francisco Guillermo
Francisco Guillermo
Gina Cordero
Teresa Correas
Francis Mariñez
Carmen Turbides
Candida Hernandez
Ingrid Gonzalez
Rocio Vargas
Lucas Gaitan
Jennifer Calcaño
Francisco Guillermo
Conserje (Solo uso en oficina)
Yomaris Rodriguez
Miguel Angel Ramirez
Engels Santos
Teodoro Gonzalez
Luis Amaro
Luis Amaro
Yudelka Roberts
Yira Hernández
Juan Pablo Alonso
Karla González
Maricris González
Dilena Sanchez
Claudia Andujar
Arilyn Jiménez
Luciano Gomez
Gina Peña
Carmen Quiñones
Claudia Andujar
Carmen Quiñones
Miguel Angel Ramirez
Engels Santos
Teodoro Gonzalez
Luis Amaro
Yudelka Roberts
Johanna Rojas
Yira Hernández
Juan Pablo Alonso
Karla González
Karla González
Maricris González
Gabriel Marmolejos
Arilyn Jimenez
Luciano Gomez
Gina Peña
Yudelka Velasquez
Alexander Rodriguez
Francisco Gil
Marcos Perez
Anuard Michelén
Enmanuel Batista
Erickson Suero
Gloury Piñeyro
Hipolito Lopez
Jose De Leon
Josue Ferrera
Sandy Ramirez
Alejandro Cortorreal
Damian Evangelista
Elvin Guzman
Gerson Lamarche
Isaac Avelino
Jerermy Solano
Raysom Almánzar
Samuel Vilorio
Tulio Mercedes
Amy Martinez
Andromedis Beltre
Luis Caraballo
Esdra Encarnacion
Gabriel Perez
Gerson Santos
Sadia Cuello
Sadia Cuello
Angel Parra
Esther Estrella
Francisco Mateo
Gabriel Marmolejos
Jadison Abreu
Raymund Mejía
Yeicol Camacho
Tandry Leguen
Dannerys Nuñez
Bianca Mariñez
Lanhya Suriel
Ana Luisa Fernandez
Digna Hernandez
Digna Hernandez
Emmy Ramirez
Kelvin Encarnación
Leticia Melendez
Ismael Paredes
Jorge Luis Alamanzar
Jorge Luis Alamanzar
Jose Suarez
Yohanna Diaz
Franklyn Brea
Geraldo Perez
Darfry Contreras
Guillermo Prenza
Jose Payano
Juan Castillo
Carolina Zapata
Luis Cruz
Paula Garcia
Oscar Alcantara
Audris Paulino
Carlos Gutierrez
Carmen Mabely Hernandez
Nadia Rodriguez
Purina Hidalgo
Rosa Rodriguez
Sonia Telleria
Vanessa Vallejo
Angel Garcia
Jhomer Somon
Luis Herrera
Victor Diaz
Carlos Pinales
Franklin Volquez
Gerson Lamarche
Sony Cespedes
Ana Luisa Fernandez
Luis Cruz
Isabel Santana
Leonor Ogando
Ashly Inoa
Frank Estevez
Heidy Almonte
Karolin Aybar
Yunely Encarnación
Carlos Gutierrez
Vanessa  Vallejo
Marcos Perez
America Montilla
Wilber Flores
Francisco Mateo
Gabriel Marmolejos
Jadison Abreu
Miguel De la Cruz
Yeicol Camacho
Dannerys Nuñez
Jhomary Serrano
Madeline Soto
Lanhya Suriel
Eulises Matias
Kelvin Encarnación
Leticia Melendez
Angel Parra
Darfry Contreras
Guillermo Prenza
Jose Payano
Juan Castillo
Carolina Zapata
Oscar Alcantara
Paula Gacia
Victor Díaz
Jhomer Somon
Luis Herrera
Andrea Gonzalez
Juan Tavarez
Raymund Mejia
Constancio Bocio
Andromedis Beltre
Audris Paulino
Rosa Rodriguez
KONEKSI WHATSAPP (Resp. Ramon R.)
Carmen Hernandez
Abel Feliz
Francis Mariñez
Ramon Rodriguez
Samuel Paez
Harold Morillo
Wendy Garcia
Henderson Diaz
Emmy Ramírez
Yomaris Rodríguez
Ramon Rodriguez
Abel Feliz
Carlos Betancur
Dilena Sánchez
Rode Briceño
Andrea Gonzalez
Alexandra Alecon
Yismeiry Lopez
Cenia Cid
Ashly Inoa
Leonor Ogando
Yunely Encarnación
Lorenza Martínez
Isabel Santana
Frank Estévez
Karolin Aybar
Alexandra Alecon
Heidy Almonte
Ivan Sanchez
Ismael Paredes
Lorenza Martinez
Iris Vidal
Angel Garcia
Jose Suarez
Gina Peña
Carlos Pinales
Laidy Contreras
Laidy Contreras
Nelson Santana
Cenia Cid
Yudelka Velasquez
Nelson Santana
Lisa Moya
Lisa Moya
Esther Estrella
Luciano Gomez
Alam Gomez
Ivan Sanchez
Eulises Matias
Madeline Soto
Joel Arias
Rocio Vargas
Wilber Flores
Jhomary Serrano
Cristina Silfa
Juan Adames
Conserje Madeinsa- Martha
Alam Gómez
Franklin Volquez
Yohanna Diaz
Henderson Diaz
Miguel De la Cruz
Carlos Betancur
Wendy Garcia
Yeicol Camacho
America Montilla
Arilyn Jimenez
Benito Adames
Juan Adames
Elin Florentino
Juan Tavarez
Yira Hernández
Johanna Rojas
Jeferson Bernabel
Miguel Mejia
Guillermo Prenza
Isabel Santana
Frank Estevez
"""

def normalize_text(text):
    """Normalize text: remove accents, lower case."""
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                  if unicodedata.category(c) != 'Mn').lower()

def generate_email(name):
    # Remove things in parens
    clean_name = re.sub(r'\s*\(.*?\)\s*', '', name).strip()
    
    parts = clean_name.split()
    if not parts:
        return None
        
    # Heuristic: 
    # If 2 parts: First Last
    # If 3 parts: Likely First Middle Last (OR First Last Last).
    # Rule provided: Initial First Name + First Surname.
    # In "Miguel Angel Ramirez", "Miguel" is First, "Ramirez" is Surname. (Skipping Angel).
    # In "Jose De Leon", "Jose" is First, "De" is Surname? No "De Leon".
    # Let's try to detect composite surnames? Hard without list.
    # Simple logic: Last token is the surname for 3+ words?
    # Or 2nd token? 
    # User said: "cbetancur" from "Carlos Betancur".
    # User said: "Miguel Angel Ramirez". If "mramirez", then surname is last.
    
    first_name = parts[0]
    
    if len(parts) == 1:
        surname = parts[0] # Fallback
    elif len(parts) == 2:
        surname = parts[1]
    else:
        # If 3 or more, try to guess.
        # Check for particles
        if parts[1].lower() in ['de', 'del', 'la', 'las', 'los']:
             # likely "Jose De Leon" -> surname starts at 1
             # simplistic join
             surname = "".join(parts[1:])
        else:
             # "Miguel Angel Ramirez" -> Ramirez (Last) or Angel (Middle)?
             # Standard RD: First Middle Last. So Surname is parts[2].
             # "Francisco Guillermo" -> ? Guillermo might be surname.
             # "Carmen Mabely Hernandez" -> Hernandez.
             # Safest bet for 3 words: Default to LAST word as surname.
             surname = parts[-1]

    # Normalize
    initial = normalize_text(first_name)[0]
    surname_clean = normalize_text(surname)
    
    return f"{initial}{surname_clean}@unipago.com.do"

unique_emails = set()
sql_values = []

# Deduplicate names logic
raw_lines = [line.strip() for line in employees.split('\n') if line.strip()]
seen_normalized_names = set()
unique_lines = []

for name in raw_lines:
    if "KONEKSI" in name or "Conserje" in name:
        continue 

    # Normalize for deduplication check (remove accents, lower)
    norm = normalize_text(name)
    
    # Check if we have seen this name already (ignoring accents/case)
    if norm in seen_normalized_names:
        continue
        
    seen_normalized_names.add(norm)
    unique_lines.append(name)

# Sort strictly for consistent output
unique_lines.sort()

seen_emails = {} # email -> count

for name in unique_lines:
    email = generate_email(name)
    if not email: 
        continue
        
    base_email = email.split('@')[0]
    domain = email.split('@')[1]
    
    final_email = email
    if base_email in seen_emails:
        seen_emails[base_email] += 1
        final_email = f"{base_email}{seen_emails[base_email]}@{domain}"
    else:
        seen_emails[base_email] = 0
        final_email = email
        
    # SQL Value
    safe_name = name.replace("'", "''")
    sql_values.append(f"('{safe_name}', '{final_email}', 'Por Definir', 'employee', 'hashed_pw_default')")

# Generate File
sql_content = f"""-- Carga Inicial de Usuarios
-- Generado automàticamente

INSERT INTO asset.users (full_name, email, department, role, password_hash)
VALUES
{',\n'.join(sql_values)}
ON CONFLICT (email) DO NOTHING;
"""

with open('users_carga_inicial.sql', 'w') as f:
    f.write(sql_content)

print(f"Generated {len(sql_values)} users.")
