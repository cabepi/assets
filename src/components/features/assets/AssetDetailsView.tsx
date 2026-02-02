import { Header } from "@/components/layout/Header";
import { QRCodeGenerator } from "@/components/features/assets/QRCodeGenerator";

interface AssetDetailsViewProps {
    asset: any; // Ideally stricter type
    qrValue: string;
    isPublic?: boolean;
    actions?: React.ReactNode;
    locationHistory?: any[];
    maintenanceLogs?: any[];
}

export function AssetDetailsView({ asset, qrValue, isPublic = false, actions, locationHistory = [], maintenanceLogs = [] }: AssetDetailsViewProps) {
    return (
        <>
            <Header title={`Activo: ${asset.assetTag}`} />
            <div className={`px-4 md:px-10 py-8 flex flex-col gap-6 ${isPublic ? 'max-w-3xl mx-auto' : 'max-w-5xl mx-auto'} w-full`}>

                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900">{asset.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase
                                ${asset.status === 'stock' ? 'bg-blue-100 text-blue-700' :
                                    asset.status === 'assigned' ? 'bg-green-100 text-green-700' :
                                        asset.status === 'retired' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                {asset.status}
                            </span>
                        </div>
                        <p className="text-slate-500 mt-1">{asset.brand} {asset.model}</p>
                    </div>

                    {!isPublic && (
                        <div className="flex gap-2">
                            {actions}
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">
                                <span className="material-symbols-outlined">edit</span>
                                Editar
                            </button>
                        </div>
                    )}
                </div>

                <div className={`grid grid-cols-1 ${isPublic ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
                    {/* Main Info */}
                    <div className="md:col-span-2 flex flex-col gap-6">

                        {asset.status === 'retired' && (
                            <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
                                <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined">block</span>
                                    Activo Dado de Baja
                                </h2>
                                <p className="text-red-800 text-sm">Este activo fue retirado del inventario. Razón: <strong>{asset.specs?.retirementReason || 'No especificada'}</strong></p>
                            </div>
                        )}

                        {asset.assignedTo && asset.status === 'assigned' && (
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-9xl text-blue-900">person</span>
                                </div>
                                <h2 className="text-lg font-bold text-blue-900 mb-4 pb-2 border-b border-blue-200 flex items-center gap-2">
                                    <span className="material-symbols-outlined">badge</span>
                                    Asignado A
                                </h2>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-6 relative z-10">
                                    <div className="col-span-2">
                                        <dt className="text-sm font-medium text-blue-700">Nombre del Empleado</dt>
                                        <dd className="text-xl font-bold text-blue-950">{asset.assignedTo.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-blue-700">Departamento</dt>
                                        <dd className="text-base font-medium text-blue-950">{asset.assignedTo.department}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-blue-700">Fecha Asignación</dt>
                                        <dd className="text-base font-medium text-blue-950">{asset.assignedTo.assignedAt}</dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="text-sm font-medium text-blue-700">Email</dt>
                                        <dd className="text-base font-medium text-blue-950">{asset.assignedTo.email}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Información General</h2>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">ID del Activo</dt>
                                    <dd className="text-base font-bold text-slate-900 font-mono">{asset.assetTag}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Número de Serie</dt>
                                    <dd className="text-base font-bold text-slate-900 font-mono">{asset.serialNumber || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Categoría</dt>
                                    <dd className="text-base font-medium text-slate-900">{asset.category.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Ubicación</dt>
                                    <dd className="text-base font-medium text-slate-900">{asset.location.name || 'Sin asignar'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Location History - Always show if data exists */}
                        {locationHistory.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">history</span>
                                    Historial de Ubicación
                                </h2>
                                <div className="space-y-4">
                                    {locationHistory.map((log: any) => (
                                        <div key={log.id} className="flex gap-4 text-sm border-l-2 border-slate-200 pl-4 py-1">
                                            <div className="flex-shrink-0 w-24 text-slate-500 font-mono text-xs">{log.date}</div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    Movido a <span className="font-bold">{log.newLocation}</span>
                                                </p>
                                                <p className="text-slate-500 text-xs">Desde: {log.prevLocation} • {log.reason || 'Sin notas'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Maintenance Logs - Always show if data exists */}
                        {maintenanceLogs.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">build_circle</span>
                                    Historial de Mantenimiento
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-500">
                                                <th className="pb-2 font-medium">Fecha</th>
                                                <th className="pb-2 font-medium">Tipo</th>
                                                <th className="pb-2 font-medium">Descr.</th>
                                                <th className="pb-2 font-medium">Costo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {maintenanceLogs.map((log: any) => (
                                                <tr key={log.id}>
                                                    <td className="py-2 text-slate-500 font-mono text-xs">{log.date}</td>
                                                    <td className="py-2"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{log.type}</span></td>
                                                    <td className="py-2 text-slate-700">{log.description}</td>
                                                    <td className="py-2 font-bold text-slate-900">${log.cost}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Especificaciones Técnicas</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(asset.specs as Record<string, any> || {}).map(([key, value]) => (
                                    <div key={key} className="p-3 bg-slate-50 rounded-lg">
                                        <span className="block text-xs uppercase font-bold text-slate-400 mb-1">{key}</span>
                                        <span className="block text-sm font-medium text-slate-900">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar / QR - Only show QR download internally. Externally just show QR ? or hide it since they are already scanning it?
                        Let's show it but maybe simplified.
                    */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                Etiqueta Digital
                            </h2>
                            <QRCodeGenerator value={qrValue} size={200} showDownload={!isPublic} className="w-full" />
                            <div className="mt-4 text-center">
                                <p className="text-xs text-slate-400">Escanee para verificar inventario</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Datos Financieros</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="text-slate-500 text-sm">Fecha Compra</span>
                                    <span className="font-medium">{asset.purchaseDate}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="text-slate-500 text-sm">Costo</span>
                                    <span className="font-bold text-emerald-600">${asset.purchasePrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
