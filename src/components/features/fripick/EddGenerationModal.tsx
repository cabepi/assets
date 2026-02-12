"use client";

import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    period: string; // yyyymm
}

export function EddGenerationModal({ isOpen, onClose, period }: Props) {
    const [documentNumber, setDocumentNumber] = useState("");

    if (!isOpen) return null;

    const handleDownload = () => {
        // Use provided number or fallback if empty (though better to enforce?)
        // The requirement says "campo abierto que pida el valor", implies required or optional?
        // User didn't specify required. I'll default if empty or just pass empty.
        // Actually, user said "pida el valor". I'll pass whatever is typed.
        // If empty, let the API decide (or pass empty string).

        const params = new URLSearchParams();
        if (documentNumber.trim()) {
            params.set("documentNumber", documentNumber.trim());
        } else {
            // If empty, maybe default or error? I'll let it be empty and API can use default or empty.
            // Actually, current API hardcodes EDD-002347. I should probably default to that in API if missing,
            // or let user type it.
            // Let's pass it if present.
        }

        const queryString = params.toString();
        const url = `/api/fripick/edd/period/${period}${queryString ? `?${queryString}` : ''}`;

        window.location.href = url;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Generar Archivo EDD</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 flex gap-2 items-start">
                        <span className="material-symbols-outlined text-lg">info</span>
                        <p>Se generará un archivo unificado con las cargas de Almuerzo y Farmacia para el periodo <strong>{period.slice(4, 6)}-{period.slice(0, 4)}</strong>.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Siguiente Nº Dynamics (Nº documento)
                        </label>
                        <input
                            type="text"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            placeholder="Ej. EDD-002347"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-1">Este valor se usará en la columna "Nº documento" del Excel.</p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!documentNumber.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">sim_card_download</span>
                        Generar Archivo
                    </button>
                </div>
            </div>
        </div>
    );
}
