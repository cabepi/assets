'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Asset {
    id: number;
    assetTag: string;
    name: string;
    model: string;
    status: string;
    purchaseDate: string;
    category: { name: string };
    location: { name: string };
}

interface InventoryTableProps {
    assets: Asset[];
}

export function InventoryTable({ assets }: InventoryTableProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === assets.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(assets.map(a => a.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handlePrintQR = () => {
        // Mock print action
        alert(`Generando etiquetas para ${selectedIds.length} activos...\n\n(Funcionalidad de impresión en desarrollo)`);
        // In a real implementation, this would open a new window with the QR codes layout for printing.
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {selectedIds.length > 0 && (
                <div className="bg-primary/5 px-6 py-3 flex items-center justify-between border-b border-primary/10">
                    <span className="text-sm font-bold text-primary">
                        {selectedIds.length} activos seleccionados
                    </span>
                    <button
                        onClick={handlePrintQR}
                        className="flex items-center gap-2 bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Imprimir Etiquetas
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-bold">
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                    checked={assets.length > 0 && selectedIds.length === assets.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Modelo</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Fecha de Compra</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {assets.map((asset) => (
                            <tr key={asset.id} className={`hover:bg-slate-50 transition-colors text-slate-900 ${selectedIds.includes(asset.id) ? 'bg-primary/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                        checked={selectedIds.includes(asset.id)}
                                        onChange={() => toggleSelect(asset.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{asset.assetTag}</td>
                                <td className="px-6 py-4 font-medium text-sm">{asset.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{asset.model}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{asset.category?.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded 
                                        ${asset.status === 'assigned' ? 'bg-green-100 text-green-700' :
                                            asset.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                                                asset.status === 'stock' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">{asset.purchaseDate}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/inventory/${asset.id}`} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 flex items-center justify-center" title="Ver Detalle">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 text-sm border-t border-slate-200">
                <span className="text-slate-500">Mostrando {assets.length} registros</span>
            </div>
        </div>
    );
}
