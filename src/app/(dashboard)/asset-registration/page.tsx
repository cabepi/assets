import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/data";
import { createAsset } from "@/lib/actions";

export default async function AssetRegistrationPage() {
    const categories = await getCategories();

    return (
        <>
            <Header title="Registro de Activo" />
            <div className="px-10 py-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 text-3xl font-black tracking-tight">Nuevo Activo</h1>
                    <p className="text-slate-500 text-base">Complete el formulario para registrar un nuevo equipo en el sistema.</p>
                </div>

                <form action={createAsset} className="space-y-8">
                    {/* Información General */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">feed</span>
                            Información General
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Nombre del Activo <span className="text-red-500">*</span></label>
                                <input name="name" type="text" required className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: MacBook Pro 16" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Categoría <span className="text-red-500">*</span></label>
                                <select name="categoryId" required className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary">
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Marca</label>
                                <input name="brand" type="text" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: Apple" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Modelo</label>
                                <input name="model" type="text" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: M2 Max 2023" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Número de Serie</label>
                                <input name="serialNumber" type="text" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: C02..." />
                            </div>
                        </div>
                    </div>

                    {/* Especificaciones Técnicas */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">memory</span>
                            Especificaciones Técnicas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Procesador (CPU)</label>
                                <input name="cpu" type="text" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: Apple M2 Max" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Memoria RAM</label>
                                <input name="ram" type="text" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: 32GB" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Almacenamiento</label>
                                <input name="storage" type="text" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Ej: 1TB SSD" />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Detalles Adicionales</label>
                                <textarea name="details" rows={3} className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" placeholder="Especificaciones adicionales..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Datos Financieros */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">attach_money</span>
                            Datos Financieros
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Fecha de Compra <span className="text-red-500">*</span></label>
                                <input name="purchaseDate" type="date" required className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Precio de Compra <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input name="purchasePrice" type="number" step="0.01" required className="w-full rounded-lg border-slate-300 pl-8 focus:ring-primary focus:border-primary" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">Método de Depreciación</label>
                                <select name="depreciationMethod" className="w-full rounded-lg border-slate-300 focus:ring-primary focus:border-primary">
                                    <option value="straight_line">Línea Recta</option>
                                    <option value="sum_of_years">Suma de Dígitos</option>
                                    <option value="double_declining">Doble Saldo Decreciente</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Documentación & QR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">upload_file</span>
                                Documentación
                            </h2>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
                                <p className="text-sm font-bold text-slate-900">Haga clic o arrastre archivos aquí</p>
                                <p className="text-xs text-slate-500 mt-1">Soporta PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                    Etiqueta de Activo
                                </h2>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_2</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600 mb-1">
                                            El código QR único se generará automáticamente al guardar el activo.
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Incluirá URL de verificación y ID del activo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button type="button" disabled className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg border border-slate-200 shadow-sm cursor-not-allowed flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">print</span>
                                Generar e Imprimir Etiqueta
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                        <button type="button" className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-md shadow-primary/20">
                            Guardar Activo
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
