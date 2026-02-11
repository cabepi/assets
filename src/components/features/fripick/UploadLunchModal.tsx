"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadLunchFile } from "@/lib/fripick-actions";

export function UploadProcessModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadResult, setUploadResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        // We can't use useFormStatus directly inside the submit handler to get pending state of the form
        // But we are using action prop on form.
        // We need to wrap the action to handle the result
        const result = await uploadLunchFile(formData);
        if (result.error) {
            setMessage(result.error);
            setUploadResult({ error: result.error });
        } else {
            setMessage(`Archivo cargado exitosamente. ${result.count} registros procesados.`);
            setUploadResult({ success: true, count: result.count });
            setTimeout(() => {
                setIsOpen(false);
                setMessage("");
                setUploadResult(null);
            }, 2000);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 text-sm font-medium"
            >
                <span className="material-symbols-outlined text-xl">upload_file</span>
                Cargar Archivo
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Cargar Archivo</h2>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form action={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label htmlFor="tipo_archivo" className="block text-sm font-medium text-slate-700 mb-1">
                                    Tipo de Archivo
                                </label>
                                <select
                                    name="tipo_archivo"
                                    id="tipo_archivo"
                                    required
                                    defaultValue=""
                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="ALMUERZO">Almuerzo</option>
                                    <option value="FARMACIA">Farmacia</option>
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative">
                                <input
                                    type="file"
                                    name="file"
                                    accept=".xlsx, .xls"
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">cloud_upload</span>
                                    <p className="text-sm font-medium text-slate-600">Haz clic o arrastra el archivo aquí</p>
                                    <p className="text-xs text-slate-400">Excel (.xlsx) solamente</p>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${uploadResult?.error ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                                    <span className="material-symbols-outlined text-lg">
                                        {uploadResult?.error ? 'error' : 'check_circle'}
                                    </span>
                                    <span>{message}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow"
        >
            {pending ? (
                <>
                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                    Procesando...
                </>
            ) : (
                "Subir y Procesar"
            )}
        </button>
    );
}
