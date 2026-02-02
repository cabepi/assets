'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface InventoryControlsProps {
    categories: { id: number; name: string }[];
}

export function InventoryControls({ categories }: InventoryControlsProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <label className="flex flex-col h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                        <div className="text-slate-400 flex bg-slate-50 items-center justify-center pl-4 rounded-l-lg border-r border-slate-200">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-slate-900 focus:outline-none border-none bg-slate-50 h-full placeholder:text-slate-400 px-4 text-base"
                            placeholder="Buscar por ID, nombre, modelo..."
                            defaultValue={searchParams.get('query')?.toString()}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </label>
            </div>

            <div className="flex gap-4">
                <select
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary"
                    defaultValue={searchParams.get('categoryId')?.toString()}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                >
                    <option value="">Todas las Categorías</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary"
                    defaultValue={searchParams.get('status')?.toString()}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">Todos los Estados</option>
                    <option value="stock">En Stock</option>
                    <option value="assigned">Asignado</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="retired">Baja</option>
                </select>
            </div>
        </div>
    );
}
