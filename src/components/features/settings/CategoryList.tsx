
'use client';

import { useState, useTransition } from "react";
import { updateCategory } from "@/lib/actions";

interface Category {
    id: number;
    name: string;
    depreciationYears: number;
}

export function CategoryList({ categories }: { categories: Category[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editYears, setEditYears] = useState<number>(0);
    const [isPending, startTransition] = useTransition();

    function startEdit(cat: Category) {
        setEditingId(cat.id);
        setEditYears(cat.depreciationYears);
    }

    function cancelEdit() {
        setEditingId(null);
    }

    async function handleSave(categoryId: number) {
        if (editYears < 1) return;

        const formData = new FormData();
        formData.append('categoryId', categoryId.toString());
        formData.append('years', editYears.toString());

        startTransition(async () => {
            try {
                await updateCategory(formData);
                setEditingId(null);
            } catch (e) {
                alert("Error actualizando categoría");
            }
        });
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Nombre de Categoría</th>
                        <th className="px-6 py-4">Vida Útil (Años)</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                            <td className="px-6 py-4">
                                {editingId === cat.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={editYears}
                                            onChange={(e) => setEditYears(Number(e.target.value))}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded text-center font-bold"
                                            autoFocus
                                        />
                                        <span className="text-slate-500 text-xs">años</span>
                                    </div>
                                ) : (
                                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-bold">
                                        {cat.depreciationYears} años
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {editingId === cat.id ? (
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleSave(cat.id)}
                                            disabled={isPending}
                                            className="text-primary hover:bg-primary/10 p-1 rounded transition-colors disabled:opacity-50"
                                            title="Guardar"
                                        >
                                            <span className="material-symbols-outlined">check</span>
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            disabled={isPending}
                                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                            title="Cancelar"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => startEdit(cat)}
                                        className="text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 p-1.5 rounded-lg flex items-center gap-1 ml-auto text-xs font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Editar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
