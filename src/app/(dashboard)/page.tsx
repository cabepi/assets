import { Header } from "@/components/layout/Header";
import { getDashboardMetrics } from "@/lib/data";

export default async function Home() {
  const metrics = await getDashboardMetrics();

  return (
    <>
      <Header title="Dashboard Ejecutivo de Activos" />
      <div className="p-8 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Salud Financiera y de Activos</h1>
            <p className="text-slate-500 text-base">Métricas operacionales consolidadas y visión general de trazabilidad para todos los activos fijos.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">download</span>
              Exportar Datos
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-lg">add</span>
              Agregar Activo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-sm font-medium">Valor Total</p>
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${new Intl.NumberFormat('en-US').format(metrics.totalValue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex items-center text-emerald-600 text-sm font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span> 5.2%
              </span>
              <span className="text-slate-400 text-xs font-normal">vs último trimestre</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-sm font-medium">En Mantenimiento</p>
              <span className="material-symbols-outlined text-orange-500">engineering</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{metrics.maintenanceCount}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex items-center text-orange-600 text-sm font-bold">
                <span className="material-symbols-outlined text-sm">warning</span> 12%
              </span>
              <span className="text-slate-400 text-xs font-normal">de la flota total</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-sm font-medium">Activos Totales</p>
              <span className="material-symbols-outlined text-slate-500">inventory_2</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{metrics.totalAssets}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex items-center text-emerald-600 text-sm font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span> 98%
              </span>
              <span className="text-slate-400 text-xs font-normal">operativos</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-slate-900 font-bold">Distribución por Categoría</h3>
                <p className="text-slate-500 text-xs font-medium">Categorizado por recuento total de unidades</p>
              </div>
              <span className="text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">{metrics.totalAssets} Unidades</span>
            </div>
            <div className="space-y-6">
              {metrics.categoryDistribution.map((cat, index) => {
                const percentage = Math.round((cat.count / metrics.totalAssets) * 100);
                const colors = ["bg-primary", "bg-blue-400", "bg-indigo-300", "bg-slate-300"];
                return (
                  <div key={cat.name} className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">{cat.name}</span>
                      <span className="text-slate-900">{cat.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className={`${colors[index % colors.length]} h-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-slate-900 font-bold">Proyección de Depreciación</h3>
                <p className="text-slate-500 text-xs font-medium">Amortización financiera proyectada (12 meses)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">$840k</p>
                <p className="text-[10px] text-red-500 font-bold">-$12k Prom/Mes</p>
              </div>
            </div>
            <div className="h-44 flex items-end gap-1 relative pt-4">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 35 Q 25 32, 50 20 T 100 5" fill="none" stroke="#137fec" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                <path d="M0 35 Q 25 32, 50 20 T 100 5 L 100 40 L 0 40 Z" fill="url(#grad)" opacity="0.1"></path>
                <defs>
                  <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#137fec", stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: "#137fec", stopOpacity: 0 }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex w-full justify-between items-end h-full z-10 pt-10">
                <span className="text-[10px] text-slate-400 font-bold">Jul</span>
                <span className="text-[10px] text-slate-400 font-bold">Sep</span>
                <span className="text-[10px] text-slate-400 font-bold">Nov</span>
                <span className="text-[10px] text-slate-400 font-bold">Ene</span>
                <span className="text-[10px] text-slate-400 font-bold">Mar</span>
                <span className="text-[10px] text-slate-400 font-bold">May</span>
                <span className="text-[10px] text-slate-400 font-bold">Jul</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">verified_user</span>
              <h3 className="text-slate-900 font-bold">Alertas de Garantía (30 Días)</h3>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">Ver Todas las Alertas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 font-bold text-slate-600 border-b border-slate-200">Nombre del Activo</th>
                  <th className="px-6 py-4 font-bold text-slate-600 border-b border-slate-200">Número de Serie</th>
                  <th className="px-6 py-4 font-bold text-slate-600 border-b border-slate-200">Categoría</th>
                  <th className="px-6 py-4 font-bold text-slate-600 border-b border-slate-200">Ubicación</th>
                  <th className="px-6 py-4 font-bold text-slate-600 border-b border-slate-200">Fecha de Expiración</th>
                  <th className="px-6 py-4 font-bold text-slate-600 border-b border-slate-200">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">MacBook Pro 16&quot; - M2 Max</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">AAPL-99231-X</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">Laptop</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">San Francisco, HQ</td>
                  <td className="px-6 py-4 text-red-600 font-bold">12 Oct, 2024</td>
                  <td className="px-6 py-4">
                    <button className="text-primary font-bold text-xs uppercase tracking-wider hover:text-blue-700 transition-colors">Renovar</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">Dell PowerEdge R750</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">DELL-SRV-0042</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">Servidor</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">Dublín, IE DC</td>
                  <td className="px-6 py-4 text-orange-600 font-bold">28 Oct, 2024</td>
                  <td className="px-6 py-4">
                    <button className="text-primary font-bold text-xs uppercase tracking-wider hover:text-blue-700 transition-colors">Ticket Soporte</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">Fortinet 100F Firewall</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">FG-100F-8822</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">Redes</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">Oficina Singapur</td>
                  <td className="px-6 py-4 text-red-600 font-bold">05 Oct, 2024</td>
                  <td className="px-6 py-4">
                    <button className="text-primary font-bold text-xs uppercase tracking-wider hover:text-blue-700 transition-colors">Renovar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
