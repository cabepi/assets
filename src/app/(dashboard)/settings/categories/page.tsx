
import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/data";
import { CategoryList } from "@/components/features/settings/CategoryList";

export const dynamic = 'force-dynamic';

export default async function CategoriesSettingsPage() {
    const categories = await getCategories();

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title="Configuración" />

            <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Gestión de Categorías</h1>
                    <p className="text-slate-500">Configure los parámetros globales para cada tipo de activo.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">category</span>
                                Listado de Categorías
                            </h2>
                            <CategoryList categories={categories} />
                        </section>
                    </div>

                    {/* Sidebar: Help / Info */}
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                            <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">info</span>
                                ¿Qué es la Vida Útil?
                            </h3>
                            <p className="text-sm text-blue-800 leading-relaxed mb-4">
                                Es el tiempo estimado (en años) durante el cual un activo es productivo.
                                Este valor es fundamental para calcular la <strong>depreciación mensual</strong> en el método de Línea Recta.
                            </p>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li><strong>Computadoras:</strong> Usualmente 3-5 años.</li>
                                <li><strong>Muebles:</strong> Usualmente 10 años.</li>
                                <li><strong>Vehículos:</strong> Usualmente 5 años.</li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
                            <h3 className="text-amber-900 font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">warning</span>
                                Impacto del Cambio
                            </h3>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                Al modificar estos valores, <strong>todos los activos</strong> asociados a la categoría recalcularán su valor en libros y depreciación acumulada inmediatamente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
