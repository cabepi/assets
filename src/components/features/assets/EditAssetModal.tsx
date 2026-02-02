'use client';

import { useState, useTransition } from 'react';
import { updateAsset } from '@/lib/actions';

interface Category {
    id: number;
    name: string;
}

interface EditAssetModalProps {
    asset: any;
    categories: Category[];
    onClose: () => void;
}

export function EditAssetModal({ asset, categories, onClose }: EditAssetModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Parse specs from asset
    const specs = asset.specs || {};

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            try {
                await updateAsset(formData);
                onClose();
            } catch (e: any) {
                setError(e.message || 'Error al actualizar activo');
            }
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    Editar Activo
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <form action={handleSubmit}>
                    <input type="hidden" name="assetId" value={asset.id} />

                    {/* Información General */}
                    <section className="mb-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                            Información General
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Etiqueta/Tag *
                                </label>
                                <input
                                    type="text"
                                    name="assetTag"
                                    defaultValue={asset.assetTag}
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={asset.name}
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Marca
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    defaultValue={asset.brand}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Modelo
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    defaultValue={asset.model}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Número de Serie
                                </label>
                                <input
                                    type="text"
                                    name="serialNumber"
                                    defaultValue={asset.serialNumber}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Categoría
                                </label>
                                <select
                                    name="categoryId"
                                    defaultValue={asset.category?.id || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">Seleccione...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Especificaciones Técnicas */}
                    <section className="mb-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                            Especificaciones Técnicas
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CPU</label>
                                <input
                                    type="text"
                                    name="cpu"
                                    defaultValue={specs.cpu || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
                                <input
                                    type="text"
                                    name="ram"
                                    defaultValue={specs.ram || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Almacenamiento</label>
                                <input
                                    type="text"
                                    name="storage"
                                    defaultValue={specs.storage || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Detalles adicionales</label>
                                <input
                                    type="text"
                                    name="details"
                                    defaultValue={specs.details || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Datos Financieros */}
                    <section className="mb-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                            Datos Financieros
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Compra</label>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    defaultValue={asset.purchaseDateRaw || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Costo ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="purchasePrice"
                                    defaultValue={asset.purchasePrice || 0}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Depreciación</label>
                                <select
                                    name="depreciationMethod"
                                    defaultValue={asset.depreciationMethod || ''}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">Ninguno</option>
                                    <option value="straight-line">Línea Recta</option>
                                    <option value="declining-balance">Saldos Decrecientes</option>
                                    <option value="sum-of-years">Suma de Años</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
