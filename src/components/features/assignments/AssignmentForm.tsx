'use client';

import { useState } from 'react';
import { assignAsset, returnAsset } from '@/lib/actions';

interface User {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    name: string;
    assetTag: string;
}

interface AssignmentFormProps {
    users: User[];
    assets: Asset[]; // Stock assets for Delivery
    assignedAssets: Asset[]; // Assigned assets for Return
}

export function AssignmentForm({ users, assets, assignedAssets }: AssignmentFormProps) {
    const [mode, setMode] = useState<'delivery' | 'return'>('delivery');

    // Choose which list of assets to show based on mode
    const currentAssets = mode === 'delivery' ? assets : assignedAssets;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                    {mode === 'delivery' ? 'Nueva Entrega de Activo' : 'Registrar Devolución'}
                </h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('return')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'return' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        MODO DEVOLUCIÓN
                    </button>
                    <button
                        onClick={() => setMode('delivery')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'delivery' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        MODO ENTREGA
                    </button>
                </div>
            </div>

            <form action={mode === 'delivery' ? assignAsset : returnAsset} className="space-y-6">

                {/* Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Seleccionar Activo</label>
                        <select name="assetId" required className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary">
                            <option value="">
                                {mode === 'delivery' ? 'Buscar en Stock...' : 'Buscar Activo Asignado...'}
                            </option>
                            {currentAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.assetTag} - {asset.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">
                            {mode === 'delivery'
                                ? "Solo se muestran activos disponibles ('Stock')"
                                : "Solo se muestran activos actualmente asignados"}
                        </p>
                    </div>

                    {/* User selection only needed for Delivery. For Return, it's implicit (or we could show read-only) */}
                    {mode === 'delivery' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-700">Seleccionar Usuario</label>
                            <select name="userId" required className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary">
                                <option value="">Nombre de empleado o ID</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">
                            {mode === 'delivery' ? 'Estado Físico (Entrega)' : 'Estado Físico (Recepción)'}
                        </label>
                        <select name="condition" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary">
                            <option value="Excelente">Excelente</option>
                            <option value="Bueno">Bueno</option>
                            <option value="Regular">Regular</option>
                            <option value="Malo">Malo</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Fecha Efectiva</label>
                        <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                    <button type="submit" className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-md flex items-center gap-2
                        ${mode === 'delivery' ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-slate-700 hover:bg-slate-800 shadow-slate-500/20'}`}>
                        <span className="material-symbols-outlined">{mode === 'delivery' ? 'save' : 'history_edu'}</span>
                        {mode === 'delivery' ? 'Guardar Asignación' : 'Confirmar Devolución'}
                    </button>
                </div>
            </form>
        </div>
    );
}
