'use server';

import { sql } from "@vercel/postgres";
import * as XLSX from 'xlsx';
import { revalidatePath } from "next/cache";

// Type definitions
export interface LunchUpload {
    id: number;
    file_name: string;
    upload_date: Date;
    status: string;
    total_records: number;
    comments: string;
    file_type: string;
    period: string;
    metadata: any;
}

export interface LunchDetail {
    id: number;
    batch_id: number;
    employee_code: string;
    employee_name: string;
    cost_center: string;
    quantity: number;
    subtotal: number;
    taxes: number;
    tip_amount: number;
    total_billed: number;
    company_subsidy: number;
    employee_deduction: number;
}

export async function uploadLunchFile(formData: FormData) {
    const file = formData.get('file') as File;
    const fileType = formData.get('tipo_archivo') as string;
    const periodRaw = formData.get('periodo') as string; // mm-yyyy from UI

    if (!file) {
        return { error: "No se seleccionó ningún archivo." };
    }

    if (!fileType) {
        return { error: "Debe seleccionar un tipo de archivo." };
    }

    if (!periodRaw || !/^\d{2}-\d{4}$/.test(periodRaw)) {
        return { error: "Debe indicar un periodo válido (mm-yyyy)." };
    }

    // Convert mm-yyyy to yyyymm for DB storage
    const [month, year] = periodRaw.split('-');
    const period = `${year}${month}`;

    try {
        // Check for existing upload for this period and type
        const existingUpload = await sql`
            SELECT id FROM asset.processing_batches 
            WHERE period = ${period} AND file_type = ${fileType}
            LIMIT 1
        `;

        if (existingUpload.rows.length > 0) {
            return {
                error: `Ya existe un archivo de tipo ${fileType} para el periodo ${periodRaw}. Debe eliminar el existente antes de cargar uno nuevo.`
            };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Use Buffer for xlsx
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];


        // Validate Column Headers
        const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

        if (!headerRow || headerRow.length === 0) {
            return { error: "El archivo parece estar vacío o no tiene encabezados." };
        }

        const commonColumns = [
            'CODIGO EMPLEADO',
            'NOMBRE',
            'CENTRO DE COSTO',
            'CANTIDAD',
            'SUBTOTAL',
            'IMPUESTOS',
            'FACTURADO',
            'ASIGNACION'
        ];

        let requiredColumns = [...commonColumns];

        // Add specific columns based on file type
        if (fileType === 'ALMUERZO') {
            requiredColumns.push('10% PROPINA');
        }

        // Check for required columns
        const missingColumns = requiredColumns.filter(col => !headerRow.includes(col));

        // Special check for 'MONTO A DESCONTAR' which sometimes comes with double spaces
        const discountColExists = headerRow.includes('MONTO A DESCONTAR') || headerRow.includes('MONTO  A DESCONTAR');

        if (missingColumns.length > 0 || !discountColExists) {
            const allMissing = [...missingColumns];
            if (!discountColExists) allMissing.push('MONTO A DESCONTAR');

            return {
                error: `Estructura de archivo inválida para ${fileType}. Faltan las columnas: ${allMissing.join(', ')}`
            };
        }

        // Convert to JSON (array of objects, using headers as keys)
        // defval: '' ensures empty cells have empty strings instead of undefined
        const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[];

        if (rawData.length === 0) {
            return { error: "El archivo parece estar vacío." };
        }

        const rowsToInsert: any[] = [];

        // Helper to parse currency string "$ 4,110.00" -> 4110.00
        const parseCurrency = (val: any) => {
            if (typeof val === 'number') return val;
            if (!val) return 0;
            return parseFloat(val.toString().replace(/[$,]/g, '').trim()) || 0;
        };

        // Metadata Accumulators
        const totals = {
            quantity: 0,
            subtotal: 0,
            taxes: 0,
            tip_amount: 0,
            total_billed: 0,
            company_subsidy: 0,
            employee_deduction: 0
        };

        for (const r of rawData) {
            // Check if it's a footer row (starts with "Total" in first few columns) or empty code
            // Access by column name directly
            let codigo = String(r['CODIGO EMPLEADO'] || '').trim();
            let nombre = r['NOMBRE'] || '';
            let centro = String(r['CENTRO DE COSTO'] || '').trim();

            const firstCols = [codigo, nombre, centro].join(' ').toLowerCase();

            if (firstCols.includes('total')) {
                continue; // Skip footer row
            }

            if (!codigo) continue; // Skip empty rows

            // Special Business Rule: Reassign specific employees to 10192 (Cándida Luz Hernández Santana)
            if (fileType === 'ALMUERZO') {
                const normalizedCode = codigo.replace(/[-\s]/g, '');
                const normalizedName = nombre.toLowerCase();

                // Check for Escarlin Maldonado Carela (027-0050946-2)
                const isEscarlin = normalizedCode === '02700509462' || normalizedName.includes('escarlin maldonado');

                // Check for Martha Delgado (00118935998)
                const isMartha = normalizedCode === '00118935998' || normalizedName.includes('martha delgado');

                if (isEscarlin || isMartha) {
                    codigo = '10192';
                    nombre = 'Cándida Luz Hernández Santana';
                }
            }

            // Handle propina based on file type
            let propina = 0;
            if (fileType === 'ALMUERZO') {
                propina = parseCurrency(r['10% PROPINA']);
            } else {
                // For FARMACIA, user explicitly requested NULL. 
                // However, our totals accumulator uses number matching the logic of previous code.
                // We will use 0 for totals calculation to avoid NaN, but insert NULL in DB if needed.
                propina = 0;
            }

            const rowData = {
                codigo: codigo,
                nombre: nombre,
                centro: centro,
                cantidad: Number(r['CANTIDAD'] || 0),
                subtotal: parseCurrency(r['SUBTOTAL']),
                taxes: parseCurrency(r['IMPUESTOS']),
                tip_amount: propina, // This is for accumulator and local logic
                total_billed: parseCurrency(r['FACTURADO']),
                company_subsidy: parseCurrency(r['ASIGNACION']),
                employee_deduction: parseCurrency(r['MONTO A DESCONTAR'] || r['MONTO  A DESCONTAR'])
            };

            rowsToInsert.push({
                ...rowData,
                // Explicitly valid tip for DB insertion later (null for pharmacy?)
                // User said "cuando sea farmacia tendra el valor nulo".
                db_tip_amount: fileType === 'FARMACIA' ? null : rowData.tip_amount
            });

            // Accumulate totals
            totals.quantity += rowData.cantidad;
            totals.subtotal += rowData.subtotal;
            totals.taxes += rowData.taxes;
            totals.tip_amount += rowData.tip_amount;
            totals.total_billed += rowData.total_billed;
            totals.company_subsidy += rowData.company_subsidy;
            totals.employee_deduction += rowData.employee_deduction;
        }

        const metadata = { totals };

        const comments = formData.get('observaciones') as string;

        const insertMaster = await sql`
            INSERT INTO asset.processing_batches (file_name, file_type, period, status, total_records, comments, metadata)
            VALUES (${file.name}, ${fileType}, ${period}, 'PROCESADO', ${rowsToInsert.length}, ${comments ? comments : null}, ${JSON.stringify(metadata)})
            RETURNING id
        `;
        // Note: 'comments' was undefined in original usage above, assuming null or empty string if not provided in form. 
        // Original code didn't accept comments in uploadLunchFile. Added null check.

        const batchId = insertMaster.rows[0].id;

        // Batch insert could be optimized, but loop is okay for moderate size
        // If file is huge -> might timeout. Assuming reasonable size (<1000 rows).

        for (const item of rowsToInsert) {
            await sql`
                INSERT INTO asset.consumption_details (
                    batch_id, 
                    employee_code, 
                    employee_name, 
                    cost_center, 
                    quantity, 
                    subtotal, 
                    taxes, 
                    tip_amount, 
                    total_billed, 
                    company_subsidy, 
                    employee_deduction
                ) VALUES (
                    ${batchId},
                    ${item.codigo},
                    ${item.nombre},
                    ${item.centro},
                    ${item.cantidad},
                    ${item.subtotal},
                    ${item.taxes},
                    ${item.db_tip_amount},
                    ${item.total_billed},
                    ${item.company_subsidy},
                    ${item.employee_deduction}
                )
             `;
        }

        revalidatePath('/fripick/processes');
        return { success: true, count: rowsToInsert.length };

    } catch (error) {
        console.error("Upload Error:", error);
        return { error: "Error procesando el archivo: " + (error instanceof Error ? error.message : String(error)) };
    }
}

export async function getLunchUploads() {
    try {
        const result = await sql`
            SELECT * FROM asset.processing_batches 
            ORDER BY upload_date DESC
        `;
        return result.rows as LunchUpload[];
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
}


export async function getLunchDetails(uploadId: number, query?: string) {
    try {
        if (query) {
            const searchPattern = `%${query}%`;
            const result = await sql`
                SELECT * FROM asset.consumption_details 
                WHERE batch_id = ${uploadId}
                AND (
                    employee_code ILIKE ${searchPattern} OR
                    employee_name ILIKE ${searchPattern} OR
                    cost_center ILIKE ${searchPattern}
                )
                ORDER BY id ASC
            `;
            return result.rows as LunchDetail[];
        }

        const result = await sql`
            SELECT * FROM asset.consumption_details 
            WHERE batch_id = ${uploadId}
            ORDER BY id ASC
        `;
        return result.rows as LunchDetail[];
    } catch (error) {
        console.error("Fetch Details Error:", error);
        return [];
    }
}

export async function deleteLunchUpload(uploadId: number) {
    try {
        await sql`DELETE FROM asset.processing_batches WHERE id = ${uploadId}`;
        revalidatePath('/fripick/processes');
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { error: "Error eliminando el registro: " + (error instanceof Error ? error.message : String(error)) };
    }
}
export async function updateLunchObservation(id: number, observation: string) {
    try {
        await sql`UPDATE asset.processing_batches SET comments = ${observation} WHERE id = ${id}`;
        revalidatePath('/fripick/processes');
        return { success: true };
    } catch (error) {
        console.error('Update Observation Error:', error);
        return { error: 'Error actualizando la observación' };
    }
}

export async function acceptLunchUpload(id: number) {
    try {
        await sql`UPDATE asset.processing_batches SET status = 'ACEPTADO' WHERE id = ${id}`;
        revalidatePath('/fripick/processes');
        return { success: true };
    } catch (error) {
        console.error('Accept Upload Error:', error);
        return { error: 'Error aceptando el archivo' };
    }
}
