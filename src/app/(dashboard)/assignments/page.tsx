import { Header } from "@/components/layout/Header";
import { getAssignmentsList, getUsers, getAssetsList } from "@/lib/data";
import { AssignmentForm } from "@/components/features/assignments/AssignmentForm";

export default async function AssignmentsPage() {
    const assignments = await getAssignmentsList();
    const users = await getUsers();
    const availableAssets = await getAssetsList({ status: 'stock' });
    const assignedAssets = await getAssetsList({ status: 'assigned' });

    // Transform assets to match component interface
    const formAvailableAssets = availableAssets.map(a => ({
        id: a.id,
        name: a.name,
        assetTag: a.assetTag
    }));

    const formAssignedAssets = assignedAssets.map(a => ({
        id: a.id,
        name: a.name,
        assetTag: a.assetTag
    }));

    return (
        <>
            <Header title="Asignación y Préstamos" />
            <div className="px-10 py-8 flex flex-col gap-8 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 text-3xl font-black tracking-tight">Gestión de Asignaciones</h1>
                    <p className="text-slate-500 text-base">Seguimiento de entregas y devoluciones de activos tecnológicos corporativos.</p>
                </div>

                {/* Formulario de Asignación */}
                <AssignmentForm
                    users={users}
                    assets={formAvailableAssets}
                    assignedAssets={formAssignedAssets}
                />

                {/* Tabla de Asignaciones Recientes */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Asignaciones Locales Recientes</h3>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">Activo</th>
                                    <th className="px-6 py-4">Asignado A</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No hay asignaciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-slate-50 transition-colors text-slate-900">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{assignment.assetName}</span>
                                                    <span className="text-xs text-slate-500 font-mono">{assignment.assetTag}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{assignment.userName}</td>
                                            <td className="px-6 py-4 text-sm">{assignment.assignmentDate}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded 
                                                    ${assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {assignment.status === 'active' ? 'CONFIRMADO' : 'DEVUELTO'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
