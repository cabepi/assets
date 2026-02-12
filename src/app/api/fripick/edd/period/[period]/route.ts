import { sql } from "@vercel/postgres";
import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";

// Helper: format cost_center digits separated by dashes. E.g. "811" -> "8-1-1"
function formatCostCenter(raw: string | null | undefined): string {
    if (!raw) return "";
    const digits = raw.replace(/\D/g, ""); // keep only digits
    return digits.split("").join("-");
}

// Helper: format current date as d/M/yy (e.g. 31/1/26)
function formatDate(): string {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = String(now.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

// Helper: get MM-YYYY for description from stored periodo (yyyymm format)
function formatPeriodForDescription(periodo: string | null): string {
    if (!periodo || periodo.length !== 6) {
        // Fallback to current date
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        return `${month}-${year}`;
    }
    const year = periodo.slice(0, 4);
    const month = periodo.slice(4, 6);
    return `${month}-${year}`;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ period: string }> }
) {
    const { period } = await params;

    // Basic validation of period format (yyyymm)
    if (!/^\d{6}$/.test(period)) {
        return NextResponse.json({ error: "Periodo inválido. Formato requerido: YYYYMM" }, { status: 400 });
    }

    try {
        const searchParams = _request.nextUrl.searchParams;
        const documentNumber = searchParams.get('documentNumber') || "EDD-002347";

        // 1. Get all ACEPTADO batches for this period and their period from DB
        const batchesResult = await sql`
            SELECT id, file_type, period 
            FROM asset.processing_batches 
            WHERE period = ${period} 
            AND status = 'ACEPTADO'
        `;

        if (batchesResult.rows.length === 0) {
            return NextResponse.json({ error: "No se encontraron cargas aceptadas para este periodo." }, { status: 404 });
        }

        // Extract batch IDs and period from DB (use the first one found as they match)
        const batchIds = batchesResult.rows.map(row => row.id);
        const storedPeriod = batchesResult.rows[0].period;

        // 2. Get consumption details for ALL these batches
        // We use ANY() to match any of the batch IDs
        const result = await sql`
            SELECT 
                dc.employee_deduction,
                dc.total_billed,
                dc.employee_code,
                u.employee_code as user_employee_code,
                u.cost_center,
                u.fripick_subsidy_account,
                u.employee_receivable_account
            FROM asset.consumption_details dc
            LEFT JOIN asset.users u ON TRIM(dc.employee_code) = TRIM(u.employee_code)
            WHERE dc.batch_id = ANY(${batchIds as any}) 
            ORDER BY dc.employee_code ASC, dc.id ASC
        `;

        const rows = result.rows;
        const fecha = formatDate();
        // Use the period retrieved from the database table processing_batches
        const periodoDesc = formatPeriodForDescription(storedPeriod);
        const descripcion = `Consumos almuerzo y farmacia ${periodoDesc}`;

        // 3. Build data rows (Unified List)
        const excelRows = rows.map((row) => ({
            "Fecha registro": fecha,
            "Fecha de IVA": fecha,
            "Tipo documento": "",
            "Nº documento": documentNumber,
            "RFC/Curp": "",
            "No. Comprobante Fiscal": "",
            "Beneficiario": "",
            "Nº documento externo": "",
            "Tipo mov.": "Cuenta",
            "Nº cuenta": row.fripick_subsidy_account || "",
            "Nombre de cuenta": "Subsidio Friipick",
            "Descripción": descripcion,
            "Cód. divisa": "",
            " Importe ": Number(row.total_billed),
            " Importe ($) ": Number(row.total_billed),
            "Tipo contrapartida": "Cuenta",
            "Cta. contrapartida": "",
            "Dim Centro Costo": formatCostCenter(row.cost_center),
            "Dim Empleados": row.user_employee_code || row.employee_code || "",
            "Dim Flujo de Efectivo": "",
            "Dim Nominas": "",
            "Dim Proyectos": "",
            "CXC EMPLEADOS": row.employee_receivable_account || "12301", // Default fallback if null
            "Presupuesto Ejecutado": "",
        }));

        // 4. Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelRows);

        // Set column widths for readability
        ws["!cols"] = [
            { wch: 14 }, // Fecha registro
            { wch: 14 }, // Fecha de IVA
            { wch: 14 }, // Tipo documento
            { wch: 14 }, // Nº documento
            { wch: 12 }, // RFC/Curp
            { wch: 22 }, // No. Comprobante Fiscal
            { wch: 14 }, // Beneficiario
            { wch: 20 }, // Nº documento externo
            { wch: 10 }, // Tipo mov.
            { wch: 10 }, // Nº cuenta
            { wch: 18 }, // Nombre de cuenta
            { wch: 40 }, // Descripción
            { wch: 12 }, // Cód. divisa
            { wch: 14 }, // Importe
            { wch: 14 }, // Importe ($)
            { wch: 18 }, // Tipo contrapartida
            { wch: 18 }, // Cta. contrapartida
            { wch: 16 }, // Dim Centro Costo
            { wch: 14 }, // Dim Empleados
            { wch: 20 }, // Dim Flujo de Efectivo
            { wch: 14 }, // Dim Nominas
            { wch: 14 }, // Dim Proyectos
            { wch: 16 }, // CXC EMPLEADOS
            { wch: 20 }, // Presupuesto Ejecutado
        ];

        XLSX.utils.book_append_sheet(wb, ws, "EDD");

        // Write to buffer
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        const fileName = `EDD Unificado ${periodoDesc}.xlsx`;

        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("EDD Generation Error:", error);
        return NextResponse.json(
            { error: "Error generando el archivo EDD" },
            { status: 500 }
        );
    }
}
