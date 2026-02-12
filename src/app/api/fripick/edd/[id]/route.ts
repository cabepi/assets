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
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        // Get procesamiento to retrieve billing_period
        const procResult = await sql`
            SELECT period FROM asset.processing_batches WHERE id = ${id}
        `;
        const periodoStored = procResult.rows[0]?.period || null;

        // Join consumption_details with users on employee_code
        const result = await sql`
            SELECT 
                dc.employee_deduction,
                dc.employee_code,
                u.employee_code as user_employee_code,
                u.cost_center,
                u.accounting_account
            FROM asset.consumption_details dc
            LEFT JOIN asset.users u ON TRIM(dc.employee_code) = TRIM(u.employee_code)
            WHERE dc.batch_id = ${id}
              AND dc.employee_deduction > 0
            ORDER BY dc.id ASC
        `;

        const rows = result.rows;
        const fecha = formatDate();
        const periodo = formatPeriodForDescription(periodoStored);
        const descripcion = `Consumos almuerzo y farmacia ${periodo}`;

        // Build data rows
        const excelRows = rows.map((row) => ({
            "Fecha registro": fecha,
            "Fecha de IVA": fecha,
            "Tipo documento": "",
            "Nº documento": "EDD-002347",
            "RFC/Curp": "",
            "No. Comprobante Fiscal": "",
            "Beneficiario": "",
            "Nº documento externo": "",
            "Tipo mov.": "Cuenta",
            "Nº cuenta": row.accounting_account || "",
            "Nombre de cuenta": "Subsidio Friipick",
            "Descripción": descripcion,
            "Cód. divisa": "",
            " Importe ": Number(row.employee_deduction),
            " Importe ($) ": Number(row.employee_deduction),
            "Tipo contrapartida": "Cuenta",
            "Cta. contrapartida": "",
            "Dim Centro Costo": formatCostCenter(row.cost_center),
            "Dim Empleados": row.user_employee_code || row.employee_code || "",
            "Dim Flujo de Efectivo": "",
            "Dim Nominas": "",
            "Dim Proyectos": "",
            "CXC EMPLEADOS": "",
            "Presupuesto Ejecutado": "",
        }));

        // Create workbook
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

        const fileName = `EDD Almuerzo y Farmacia ${id}.xlsx`;

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
