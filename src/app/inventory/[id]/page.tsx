import { Header } from "@/components/layout/Header";
import { getAssetById } from "@/lib/data";
import { QRCodeGenerator } from "@/components/features/assets/QRCodeGenerator";
import { notFound } from "next/navigation";

export default async function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const asset = await getAssetById(id);

    if (!asset) {
        notFound();
    }

    // In production, use env var. Locally:
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrValue = `${baseUrl}/inventory/${asset.id}`;

    return (
        <>
            <Header title={`Activo: ${asset.assetTag}`} />
            <div className="px-10 py-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900">{asset.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase
                                ${asset.status === 'stock' ? 'bg-blue-100 text-blue-700' :
                                    asset.status === 'assigned' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                {asset.status}
                            </span>
                        </div>
                        <p className="text-slate-500 mt-1">{asset.brand} {asset.model}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">
                            <span className="material-symbols-outlined">edit</span>
                            Editar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="md:col-span-2 flex flex-col gap-6">

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

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Especificaciones Técnicas</h2>
                            {/* Rendering JSONB specs cleanly */}
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

                    {/* Sidebar / QR */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                Etiqueta Digital
                            </h2>
                            <QRCodeGenerator value={qrValue} size={200} showDownload={true} className="w-full" />
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
