'use client';

import { useState } from 'react';
import { updateAssetLocation, logMaintenance, retireAsset, recoverAsset } from '@/lib/actions';

interface Location {
    id: number;
    name: string;
}

interface AssetActionsProps {
    assetId: string;
    currentLocationId?: number; // Optional if not loaded yet
    locations: Location[];
    isRetired: boolean;
    currentStatus: string;
}

export function AssetActions({ assetId, currentLocationId, locations, isRetired, currentStatus }: AssetActionsProps) {
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [isMaintOpen, setIsMaintOpen] = useState(false);
    const [isRetireOpen, setIsRetireOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isRetired) {
        return <div className="px-3 py-1 bg-red-100 text-red-700 rounded font-bold text-sm">ACTIVO DADO DE BAJA</div>;
    }

    async function handleAction(action: (formData: FormData) => Promise<void>, formData: FormData, closeFn?: () => void) {
        setIsSubmitting(true);
        try {
            await action(formData);
            if (closeFn) closeFn();
        } catch (e) {
            console.error(e);
            alert('Error al procesar acción');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => setIsMoveOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                <span className="material-symbols-outlined text-lg">move_location</span>
                Mover
            </button>
            {currentStatus === 'maintenance' ? (
                <form action={(formData) => handleAction(recoverAsset, formData)}>
                    <input type="hidden" name="assetId" value={assetId} />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-bold text-green-700 hover:bg-green-100">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Reincorporar (Stock)
                    </button>
                </form>
            ) : (
                <button
                    onClick={() => setIsMaintOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-lg">build</span>
                    Mantenimiento
                </button>
            )}
            <button
                onClick={() => setIsRetireOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50">
                <span className="material-symbols-outlined text-lg">delete</span>
                Dar de Baja
            </button>

            {/* Move Modal */}
            {isMoveOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Mover Activo</h3>
                        <form action={(formData) => handleAction(updateAssetLocation, formData, () => setIsMoveOpen(false))}>
                            <input type="hidden" name="assetId" value={assetId} />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Ubicación</label>
                                    <select name="locationId" className="w-full border rounded p-2" required>
                                        <option value="">Seleccione...</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Notas</label>
                                    <textarea name="notes" className="w-full border rounded p-2" rows={3}></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsMoveOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded font-bold">Guadar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {isMaintOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Registrar Mantenimiento</h3>
                        <form action={(formData) => handleAction(logMaintenance, formData, () => setIsMaintOpen(false))}>
                            <input type="hidden" name="assetId" value={assetId} />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                    <select name="type" className="w-full border rounded p-2" required>
                                        <option value="Preventivo">Preventivo</option>
                                        <option value="Correctivo">Correctivo</option>
                                        <option value="Upgrade">Upgrade</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                        <input type="date" name="date" className="w-full border rounded p-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Costo ($)</label>
                                        <input type="number" step="0.01" name="cost" className="w-full border rounded p-2" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Realizado por</label>
                                    <input type="text" name="performedBy" className="w-full border rounded p-2" placeholder="Proveedor o Técnico" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                    <textarea name="description" className="w-full border rounded p-2" rows={3} required></textarea>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="setStatusMaintenance" name="setStatusMaintenance" className="size-4 text-primary rounded border-gray-300 focus:ring-primary" defaultChecked />
                                    <label htmlFor="setStatusMaintenance" className="text-sm text-slate-600 font-medium">Cambiar estado a "En Mantenimiento"</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsMaintOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded font-bold">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Retire Modal */}
            {isRetireOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Dar de Baja Activo</h3>
                        <p className="text-sm text-slate-500 mb-4">Esta acción no se puede deshacer fácilmente. El activo pasará a estado RETIRED.</p>
                        <form action={(formData) => handleAction(retireAsset, formData, () => setIsRetireOpen(false))}>
                            <input type="hidden" name="assetId" value={assetId} />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Baja</label>
                                    <textarea name="reason" className="w-full border rounded p-2" rows={2} required placeholder="Ej: Obsoleto, Vendido, Robado..."></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Baja</label>
                                        <input type="date" name="date" className="w-full border rounded p-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Recuperado ($)</label>
                                        <input type="number" step="0.01" name="salvageValue" className="w-full border rounded p-2" defaultValue="0" required />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsRetireOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Confirmar Baja</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
