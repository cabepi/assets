import { Header } from "@/components/layout/Header";
import { getDashboardMetrics, getWarrantyAlerts, getDepreciationMetrics } from "@/lib/data";

export default async function Home() {
  const metrics = await getDashboardMetrics();
  const warrantyAlerts = await getWarrantyAlerts();
  const depreciation = await getDepreciationMetrics();

  // Graph Logic (Normalize projection to SVG ViewBox 100x40)
  const maxVal = Math.max(...depreciation.projection) * 1.1 || 100; // Add 10% buffering
  const minVal = Math.min(...depreciation.projection) * 0.9 || 0;
  const range = maxVal - minVal;

  // Create path points
  // We have 7 points (0, 2, 4, 6, 8, 10, 12 months) mapping to width 0..100
  const points = depreciation.projection.map((val, index) => {
    const x = (index / (depreciation.projection.length - 1)) * 100;
    // Y is inverted (0 is top, 40 is bottom). Map val relative to range.
    // If val = max, y = 5 (padding). If val = min, y = 35.
    const normalizedY = 35 - ((val - minVal) / range) * 30; // 30 is drawing height
    return `${x} ${normalizedY}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L 100 40 L 0 40 Z`; // Close the area for gradient

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
              <p className="text-slate-500 text-sm font-medium">Valor de Compra (Histórico)</p>
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${new Intl.NumberFormat('en-US').format(metrics.totalValue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-slate-400 text-xs font-normal">Inversión bruta acumulada</span>
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
                <span className="material-symbols-outlined text-sm">warning</span>
                {metrics.totalAssets > 0 ? ((metrics.maintenanceCount / metrics.totalAssets) * 100).toFixed(1) : 0}%
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
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {metrics.totalAssets - metrics.maintenanceCount}
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
                <h3 className="text-slate-900 font-bold">Proyección de Valor (Libros)</h3>
                <p className="text-slate-500 text-xs font-medium">Depreciación proyectada (Próximos 12 meses)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  ${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(depreciation.currentBookValue)}
                </p>
                <p className="text-[10px] text-red-500 font-bold">
                  -${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(depreciation.monthlyRate)} /Mes
                </p>
              </div>
            </div>
            <div className="h-44 flex items-end gap-1 relative pt-4">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d={pathD} fill="none" stroke="#137fec" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                <path d={areaD} fill="url(#grad)" opacity="0.1"></path>
                <defs>
                  <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#137fec", stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: "#137fec", stopOpacity: 0 }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex w-full justify-between items-end h-full z-10 pt-10">
                <span className="text-[10px] text-slate-400 font-bold">Hoy</span>
                <span className="text-[10px] text-slate-400 font-bold">+2m</span>
                <span className="text-[10px] text-slate-400 font-bold">+4m</span>
                <span className="text-[10px] text-slate-400 font-bold">+6m</span>
                <span className="text-[10px] text-slate-400 font-bold">+8m</span>
                <span className="text-[10px] text-slate-400 font-bold">+10m</span>
                <span className="text-[10px] text-slate-400 font-bold">+12m</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">verified_user</span>
              <h3 className="text-slate-900 font-bold">Alertas de Garantía (Próximos 30 Días)</h3>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">
              {warrantyAlerts.length} Alertas Activas
            </button>
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
                {warrantyAlerts.length > 0 ? (
                  warrantyAlerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{alert.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{alert.serialNumber || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">{alert.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{alert.location || 'Sin asignar'}</td>
                      <td className="px-6 py-4 text-red-600 font-bold">{alert.expirationDate}</td>
                      <td className="px-6 py-4">
                        <button className="text-primary font-bold text-xs uppercase tracking-wider hover:text-blue-700 transition-colors">Renovar</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                      No hay garantías próximas a vencer en los siguientes 30 días.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
