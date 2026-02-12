import { getLunchDetails, LunchDetail } from "@/lib/fripick-actions";
import Link from "next/link";
// import { formatCurrency } from "@/lib/utils"; // Removed invalid import
import SearchInput from "@/components/ui/search-input";

// Helper if formatCurrency doesn't exist
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
};

export default async function LunchDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id: idStr } = await params;
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.query as string || "";

    const id = parseInt(idStr);
    const details = await getLunchDetails(id, query);

    // Calculate totals for summary
    // Calculate totals for summary
    const totalAmount = details.reduce((sum, item) => sum + Number(item.total_billed), 0);
    const totalEmployees = new Set(details.map(d => d.employee_code)).size;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/fripick/lunch" className="text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">Detalle de Carga #{id}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{details.length} Registros</span>
                        <span>•</span>
                        <span>{totalEmployees} Empleados</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">Total: {formatMoney(totalAmount)}</span>
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <SearchInput placeholder="Buscar por código, nombre..." />
                </div>
            </header>

            <div className="flex-1 p-6 overflow-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2">Código</th>
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Centro Costo</th>
                                    <th className="px-4 py-2 text-right">Cant.</th>
                                    <th className="px-4 py-2 text-right">Subtotal</th>
                                    <th className="px-4 py-2 text-right">Impuestos</th>
                                    <th className="px-4 py-2 text-right">Propina</th>
                                    <th className="px-4 py-2 text-right font-bold bg-slate-100">Facturado</th>
                                    <th className="px-4 py-2 text-right bg-blue-50">Asignación</th>
                                    <th className="px-4 py-2 text-right text-red-600 bg-red-50">A Descontar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {details.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 font-mono text-slate-500">{item.employee_code}</td>
                                        <td className="px-4 py-2 font-medium text-slate-900">{item.employee_name}</td>
                                        <td className="px-4 py-2 text-slate-500">{item.cost_center}</td>
                                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right text-slate-500">{formatMoney(Number(item.subtotal))}</td>
                                        <td className="px-4 py-2 text-right text-slate-500">{formatMoney(Number(item.taxes))}</td>
                                        <td className="px-4 py-2 text-right text-slate-500">{formatMoney(Number(item.tip_amount))}</td>
                                        <td className="px-4 py-2 text-right font-bold bg-slate-50">{formatMoney(Number(item.total_billed))}</td>
                                        <td className="px-4 py-2 text-right text-blue-700 bg-blue-50/50">{formatMoney(Number(item.company_subsidy))}</td>
                                        <td className="px-4 py-2 text-right text-red-600 font-medium bg-red-50/50">
                                            {Number(item.employee_deduction) > 0 ? formatMoney(Number(item.employee_deduction)) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
