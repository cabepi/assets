"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { LunchUpload, deleteLunchUpload, acceptLunchUpload } from "@/lib/fripick-actions";
import { ObservationModal } from "./ObservationModal";
import { EddGenerationModal } from "./EddGenerationModal";

interface Props {
    uploads: LunchUpload[];
}

export function LunchHistoryTable({ uploads }: Props) {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [observationModal, setObservationModal] = useState<{ isOpen: boolean; uploadId: number; observation: string }>({
        isOpen: false,
        uploadId: 0,
        observation: "",
    });
    const [eddModal, setEddModal] = useState<{ isOpen: boolean; period: string }>({
        isOpen: false,
        period: "",
    });

    const toggleRow = (id: number) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const openObservationModal = (upload: LunchUpload) => {
        setObservationModal({
            isOpen: true,
            uploadId: upload.id,
            observation: upload.comments || "",
        });
    };

    const closeObservationModal = () => {
        setObservationModal({ ...observationModal, isOpen: false });
    };

    const handleAccept = async (id: number) => {
        if (confirm("¿Estás seguro de ACEPTAR esta carga? Una vez aceptada no se podrá eliminar.")) {
            const result = await acceptLunchUpload(id);
            if (result.error) {
                alert(result.error);
            }
        }
    };

    const openEddModal = (period: string) => {
        setEddModal({ isOpen: true, period });
    };

    const closeEddModal = () => {
        setEddModal({ ...eddModal, isOpen: false });
    };

    // Group uploads by period
    const periodsMap = uploads.reduce((acc, upload) => {
        if (!acc[upload.period]) {
            acc[upload.period] = {
                period: upload.period,
                hasLunch: false,
                hasPharmacy: false,
                lunchId: null as number | null,
                pharmacyId: null as number | null,
                uploads: [] as LunchUpload[],
                lunchStatus: '',
                pharmacyStatus: ''
            };
        }
        acc[upload.period].uploads.push(upload);
        if (upload.file_type === 'ALMUERZO') {
            acc[upload.period].hasLunch = true;
            acc[upload.period].lunchId = upload.id;
            acc[upload.period].lunchStatus = upload.status;
        } else if (upload.file_type === 'FARMACIA') {
            acc[upload.period].hasPharmacy = true;
            acc[upload.period].pharmacyId = upload.id;
            acc[upload.period].pharmacyStatus = upload.status;
        }
        return acc;
    }, {} as Record<string, { period: string, hasLunch: boolean, hasPharmacy: boolean, lunchId: number | null, pharmacyId: number | null, uploads: LunchUpload[], lunchStatus: string, pharmacyStatus: string }>);

    // Sort periods descending
    const periodKeys = Object.keys(periodsMap).sort((a, b) => b.localeCompare(a));

    if (uploads.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-8 text-center text-slate-500">
                No hay cargas registradas. Sube un archivo Excel para comenzar.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Period Summary Section */}
            <div className="grid grid-cols-1 gap-4">
                {periodKeys.map((periodKey) => {
                    const group = periodsMap[periodKey];
                    const isLunchAccepted = group.lunchStatus === 'ACEPTADO';
                    const isPharmacyAccepted = group.pharmacyStatus === 'ACEPTADO';

                    const isReady = group.hasLunch && group.hasPharmacy && isLunchAccepted && isPharmacyAccepted;

                    return (
                        <div key={periodKey} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 font-bold border border-blue-100">
                                    {periodKey.slice(4, 6)}-{periodKey.slice(0, 4)}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold text-slate-900">Estado del Periodo</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${group.hasLunch ? (isLunchAccepted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200') : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${group.hasLunch ? (isLunchAccepted ? 'bg-green-500' : 'bg-yellow-500') : 'bg-slate-300'}`}></span>
                                            Almuerzo
                                        </span>
                                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${group.hasPharmacy ? (isPharmacyAccepted ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200') : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${group.hasPharmacy ? (isPharmacyAccepted ? 'bg-purple-500' : 'bg-yellow-500') : 'bg-slate-300'}`}></span>
                                            Farmacia
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {!isReady ? (
                                    <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">info</span>
                                        <span>Requiere ambos archivos ACEPTADOS para generar EDD</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openEddModal(periodKey)}
                                        className="btn btn-primary flex items-center gap-2 shadow-sm shadow-blue-500/20"
                                    >
                                        <span className="material-symbols-outlined">sim_card_download</span>
                                        Generar Archivo EDD
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 w-10"></th>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Periodo</th>
                            <th className="px-6 py-3">Archivo</th>
                            <th className="px-6 py-3">Fecha Carga</th>
                            <th className="px-6 py-3 text-center">Registros</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3 text-center">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {periodKeys.map((periodKey) => (
                            <Fragment key={periodKey}>
                                {periodsMap[periodKey].uploads.map((upload) => (
                                    <Fragment key={upload.id}>
                                        <tr className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() => toggleRow(upload.id)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <span className={`material-symbols-outlined transform transition-transform ${expandedRowId === upload.id ? 'rotate-90' : ''}`}>
                                                        chevron_right
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-slate-900">#{upload.id}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${upload.file_type === 'FARMACIA'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {upload.file_type || 'ALMUERZO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600 font-mono text-xs">
                                                {upload.period ? `${upload.period.slice(4, 6)}-${upload.period.slice(0, 4)}` : '—'}
                                            </td>
                                            <td className="px-6 py-3 text-slate-700 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-600">description</span>
                                                <div className="flex flex-col">
                                                    <span>{upload.file_name}</span>
                                                    {upload.comments && (
                                                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <span className="material-symbols-outlined text-[10px]">sticky_note_2</span>
                                                            {upload.comments.length > 50 ? upload.comments.substring(0, 50) + '...' : upload.comments}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-500">
                                                {formatInTimeZone(new Date(upload.upload_date), 'America/Santo_Domingo', "dd/MM/yyyy HH:mm")}
                                            </td>
                                            <td className="px-6 py-3 text-center font-mono">
                                                {upload.total_records}
                                            </td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-700">
                                                {formatMoney(upload.metadata?.totals?.total_billed || 0)}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                {upload.status === 'PROCESADO' ? (
                                                    <button
                                                        onClick={() => handleAccept(upload.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                                                        title="Clic para Aceptar"
                                                    >
                                                        {upload.status}
                                                        <span className="material-symbols-outlined text-[10px]">check</span>
                                                    </button>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${upload.status === 'ACEPTADO'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {upload.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openObservationModal(upload)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Editar Observaciones"
                                                    >
                                                        <span className="material-symbols-outlined">edit_note</span>
                                                    </button>

                                                    {/* Individual download disabled/removed to enforce unified generation */}
                                                    {/* 
                                        <a
                                            href={`/api/fripick/edd/${upload.id}`}
                                            download
                                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                            title="Descargar EDD Excel"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                        </a> 
                                        */}

                                                    <Link
                                                        href={`/fripick/processes/${upload.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                                                        title="Ver Detalle"
                                                    >
                                                        <span className="material-symbols-outlined">visibility</span>
                                                    </Link>

                                                    {upload.status !== 'ACEPTADO' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("¿Estás seguro de eliminar esta carga?")) {
                                                                    await deleteLunchUpload(upload.id);
                                                                }
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRowId === upload.id && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={8} className="px-6 py-4">
                                                    <div className="bg-white border boundary border-slate-200 rounded-lg p-4 shadow-sm">
                                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resumen de Totales</h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <span className="block text-slate-500 text-xs">Cantidad Total</span>
                                                                <span className="font-mono font-medium text-slate-900">{upload.metadata?.totals?.quantity || 0}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-slate-500 text-xs">Subtotal</span>
                                                                <span className="font-mono font-medium text-slate-900">{formatMoney(upload.metadata?.totals?.subtotal || 0)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-slate-500 text-xs">Impuestos</span>
                                                                <span className="font-mono font-medium text-slate-900">{formatMoney(upload.metadata?.totals?.taxes || 0)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-slate-500 text-xs">Propina (10%)</span>
                                                                <span className="font-mono font-medium text-slate-900">{formatMoney(upload.metadata?.totals?.tip_amount || 0)}</span>
                                                            </div>
                                                            <div className="pt-2 mt-2 border-t border-slate-100 col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div>
                                                                    <span className="block text-slate-500 text-xs">Total Facturado</span>
                                                                    <span className="font-mono font-bold text-slate-900">{formatMoney(upload.metadata?.totals?.total_billed || 0)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-slate-500 text-xs">Asignación</span>
                                                                    <span className="font-mono font-medium text-blue-700">{formatMoney(upload.metadata?.totals?.company_subsidy || 0)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-slate-500 text-xs">A Descontar</span>
                                                                    <span className="font-mono font-medium text-red-600">{formatMoney(upload.metadata?.totals?.employee_deduction || 0)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {upload.comments && (
                                                            <div className="mt-4 pt-3 border-t border-slate-100">
                                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observaciones</h4>
                                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{upload.comments}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>

                <ObservationModal
                    isOpen={observationModal.isOpen}
                    onClose={closeObservationModal}
                    uploadId={observationModal.uploadId}
                    initialObservation={observationModal.observation}
                    key={observationModal.uploadId}
                />

                <EddGenerationModal
                    isOpen={eddModal.isOpen}
                    onClose={closeEddModal}
                    period={eddModal.period}
                />
            </div>
        </div>
    );
}
