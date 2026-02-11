"use client";

import { useState } from "react";
import { updateLunchObservation } from "@/lib/fripick-actions";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    uploadId: number;
    initialObservation: string;
}

export function ObservationModal({ isOpen, onClose, uploadId, initialObservation }: Props) {
    const [observation, setObservation] = useState(initialObservation || "");
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateLunchObservation(uploadId, observation);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar la observación");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">Observaciones</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6">
                    <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none text-sm"
                        placeholder="Escribe aquí las observaciones..."
                        autoFocus
                    />
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
