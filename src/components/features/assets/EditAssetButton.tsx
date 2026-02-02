'use client';

import { useState } from 'react';
import { EditAssetModal } from './EditAssetModal';

interface Category {
    id: number;
    name: string;
}

interface EditAssetButtonProps {
    asset: any;
    categories: Category[];
}

export function EditAssetButton({ asset, categories }: EditAssetButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
            >
                <span className="material-symbols-outlined">edit</span>
                Editar
            </button>

            {isOpen && (
                <EditAssetModal
                    asset={asset}
                    categories={categories}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
