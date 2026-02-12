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
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Use Buffer for xlsx
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

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
            cantidad: 0,
            subtotal: 0,
            impuestos: 0,
            propina: 0,
            facturado: 0,
            asignacion: 0,
            descuento: 0
        };

        for (const r of rawData) {
            // Check if it's a footer row (starts with "Total" in first few columns) or empty code
            // Access by column name directly
            const codigo = String(r['CODIGO EMPLEADO'] || '').trim();
            const nombre = r['NOMBRE'] || '';
            const centro = String(r['CENTRO DE COSTO'] || '').trim();

            const firstCols = [codigo, nombre, centro].join(' ').toLowerCase();

            if (firstCols.includes('total')) {
                continue; // Skip footer row
            }

            if (!codigo) continue; // Skip empty rows

            const rowData = {
                codigo: codigo,
                nombre: nombre,
                centro: centro,
                cantidad: Number(r['CANTIDAD'] || 0),
                subtotal: parseCurrency(r['SUBTOTAL']),
                impuestos: parseCurrency(r['IMPUESTOS']),
                propina: parseCurrency(r['10% PROPINA']),
                facturado: parseCurrency(r['FACTURADO']),
                asignacion: parseCurrency(r['ASIGNACION']),
                descuento: parseCurrency(r['MONTO A DESCONTAR'] || r['MONTO  A DESCONTAR']) // Handle potential double space typo in user request vs file
            };

            rowsToInsert.push(rowData);

            // Accumulate totals
            totals.cantidad += rowData.cantidad;
            totals.subtotal += rowData.subtotal;
            totals.impuestos += rowData.impuestos;
            totals.propina += rowData.propina;
            totals.facturado += rowData.facturado;
            totals.asignacion += rowData.asignacion;
            totals.descuento += rowData.descuento;
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
                    ${item.impuestos},
                    ${item.propina},
                    ${item.facturado},
                    ${item.asignacion},
                    ${item.descuento}
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
