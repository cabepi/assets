import { Header } from "@/components/layout/Header";

export default function ReportsPage() {
    return (
        <>
            <Header title="Reportes y Depreciación Contable" />
            <div className="px-8 py-6 flex flex-col gap-6">
                <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">
                            Reportes y Depreciación Contable
                        </h1>
                        <p className="text-slate-500 text-base max-w-2xl">
                            Generación de reportes financieros y seguimiento de valoración de activos para fines de
                            auditoría. Trazabilidad integral para pistas de auditoría y conciliación fiscal.
                        </p>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Exportar Datos
                    </button>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-4 flex flex-col gap-6">
                        <section className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-slate-900 text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                Configuración del Reporte
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-3">
                                        Seleccionar Tipo de Reporte
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center p-3 border border-primary bg-primary/5 rounded-lg cursor-pointer group">
                                            <input
                                                defaultChecked
                                                className="text-primary focus:ring-primary h-4 w-4"
                                                name="reportType"
                                                type="radio"
                                            />
                                            <span className="ml-3">
                                                <span className="block text-sm font-bold text-slate-900">
                                                    Depreciación Mensual
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    Seguimiento del valor en libros y pérdida acumulada.
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-primary/50 cursor-pointer transition-colors group">
                                            <input
                                                className="text-primary focus:ring-primary h-4 w-4"
                                                name="reportType"
                                                type="radio"
                                            />
                                            <span className="ml-3">
                                                <span className="block text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                                                    Inventario Físico
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    Verificar ubicación física y estado actual.
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-3">
                                        Rango de Fechas
                                    </label>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-slate-200">
                                            <button className="p-1 hover:bg-slate-200 rounded">
                                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                                            </button>
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                Oct 2023 - Nov 2023
                                            </p>
                                            <button className="p-1 hover:bg-slate-200 rounded">
                                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 text-[10px] text-center font-bold text-slate-400 mb-1">
                                            <span>D</span>
                                            <span>L</span>
                                            <span>M</span>
                                            <span>M</span>
                                            <span>J</span>
                                            <span>V</span>
                                            <span>S</span>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {[24, 25, 26, 27, 28, 29, 30].map((d) => (
                                                <div
                                                    key={d}
                                                    className="h-6 flex items-center justify-center text-[11px] text-slate-300"
                                                >
                                                    {d}
                                                </div>
                                            ))}
                                            <div className="h-6 flex items-center justify-center text-[11px] font-medium bg-primary text-white rounded-full">
                                                1
                                            </div>
                                            {[2, 3, 4, 5, 6].map((d) => (
                                                <div
                                                    key={d}
                                                    className="h-6 flex items-center justify-center text-[11px] font-medium bg-primary/20 text-primary"
                                                >
                                                    {d}
                                                </div>
                                            ))}
                                            <div className="h-6 flex items-center justify-center text-[11px] font-medium bg-primary/20 text-primary rounded-r-full">
                                                7
                                            </div>
                                            {[8, 9, 10, 11, 12, 13, 14].map((d) => (
                                                <div key={d} className="h-6 flex items-center justify-center text-[11px]">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-2 italic text-center">
                                        Periodo seleccionado: 1 Oct - 7 Nov 2023
                                    </p>
                                </div>
                                <button className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-2.5 rounded-lg font-bold transition-all">
                                    Actualizar Resumen
                                </button>
                            </div>
                        </section>
                    </div>
                    <div className="xl:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Costo Original Total
                                </p>
                                <p className="text-2xl font-black text-slate-900">$1,452,800.00</p>
                                <div className="flex items-center gap-1 text-green-500 text-xs mt-2 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                    <span>+4.2% desde último periodo</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Depreciación Acumulada
                                </p>
                                <p className="text-2xl font-black text-slate-900">$432,150.25</p>
                                <div className="flex items-center gap-1 text-slate-400 text-xs mt-2 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">history</span>
                                    <span>29.7% de la base total de activos</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-primary/20 bg-primary/5">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                    Valor Neto
                                </p>
                                <p className="text-2xl font-black text-primary">$1,020,649.75</p>
                                <div className="flex items-center gap-1 text-primary/70 text-xs mt-2 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    <span>Disponible para conciliación</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-slate-900 font-bold">Vista Previa de Depreciación</h3>
                                <div className="flex gap-2">
                                    <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">filter_list</span>
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">fullscreen</span>
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-slate-200">
                                            <th className="px-6 py-4 font-bold">ID Activo</th>
                                            <th className="px-6 py-4 font-bold">Descripción</th>
                                            <th className="px-6 py-4 font-bold text-right">Costo Original</th>
                                            <th className="px-6 py-4 font-bold text-right">Depreciación Acum.</th>
                                            <th className="px-6 py-4 font-bold text-right">Valor Neto</th>
                                            <th className="px-6 py-4 font-bold text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">AST-2023-001</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">MacBook Pro 16&quot; M2</p>
                                                <p className="text-[11px] text-slate-500">
                                                    Equipos de TI / Depto: Ingeniería
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">$3,499.00</td>
                                            <td className="px-6 py-4 text-right text-slate-500">$583.17</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">$2,915.83</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                                    ACTIVO
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">AST-2021-452</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">Dell PowerEdge R750</p>
                                                <p className="text-[11px] text-slate-500">
                                                    Infraestructura / Depto: DevOps
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">$12,850.00</td>
                                            <td className="px-6 py-4 text-right text-slate-500">$6,425.00</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">$6,425.00</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                                    ACTIVO
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">AST-2020-112</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">Tesla Model 3 (Flota)</p>
                                                <p className="text-[11px] text-slate-500">Vehículos / Depto: Ventas</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">$45,000.00</td>
                                            <td className="px-6 py-4 text-right text-slate-500">$33,750.00</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">$11,250.00</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                                    EXPIRANDO
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">AST-2018-005</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">Cisco Nexus Switch</p>
                                                <p className="text-[11px] text-slate-500">Redes / Depto: TI Admin</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">$8,200.00</td>
                                            <td className="px-6 py-4 text-right text-slate-500">$8,200.00</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">$0.00</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                    DEP. TOTAL
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-xs text-slate-500">Mostrando 4 de 285 activos</p>
                                <div className="flex gap-1">
                                    <button
                                        className="px-3 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
                                        disabled
                                    >
                                        Anterior
                                    </button>
                                    <button className="px-3 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-50">
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
