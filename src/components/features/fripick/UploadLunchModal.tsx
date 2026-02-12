"use client";

import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { uploadLunchFile } from "@/lib/fripick-actions";

export function UploadLunchModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadResult, setUploadResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
    const [periodo, setPeriodo] = useState("");
    const [fileName, setFileName] = useState("");

    const handlePeriodoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^\d]/g, ''); // Only digits
        if (val.length > 6) val = val.slice(0, 6);
        // Format as mm-yyyy
        if (val.length > 2) {
            val = val.slice(0, 2) + '-' + val.slice(2);
        }
        setPeriodo(val);
    };

    const handleSubmit = async (formData: FormData) => {
        formData.set('periodo', periodo);
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
                setPeriodo("");
                setFileName("");
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
                            <div className="grid grid-cols-2 gap-4">
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
                                        <option value="" disabled>Seleccione</option>
                                        <option value="ALMUERZO">Almuerzo</option>
                                        <option value="FARMACIA">Farmacia</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="periodo" className="block text-sm font-medium text-slate-700 mb-1">
                                        Periodo
                                    </label>
                                    <input
                                        type="text"
                                        id="periodo"
                                        value={periodo}
                                        onChange={handlePeriodoChange}
                                        placeholder="mm-yyyy"
                                        maxLength={7}
                                        required
                                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors relative ${fileName ? 'border-primary/50 bg-primary/5' : 'border-slate-300 hover:bg-slate-50'}`}>
                                <input
                                    type="file"
                                    name="file"
                                    accept=".xlsx, .xls"
                                    required
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setFileName(file ? file.name : "");
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    {fileName ? (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-primary">description</span>
                                            <p className="text-sm font-medium text-slate-900">{fileName}</p>
                                            <p className="text-xs text-primary font-medium">Click para cambiar archivo</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-slate-400">cloud_upload</span>
                                            <p className="text-sm font-medium text-slate-600">Haz clic o arrastra el archivo aquí</p>
                                            <p className="text-xs text-slate-400">Excel (.xlsx) solamente</p>
                                        </>
                                    )}
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
