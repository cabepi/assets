import { getUserById, getUserAssignments } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [user, assignments] = await Promise.all([
        getUserById(id),
        getUserAssignments(id)
    ]);

    if (!user) {
        notFound();
    }

    const currentAssignments = assignments.filter(a => a.isCurrent);
    const pastAssignments = assignments.filter(a => !a.isCurrent);

    return (
        <>
            <Header title={`Usuario: ${user.name}`} />
            <div className="px-4 md:px-10 py-8 max-w-5xl mx-auto w-full">
                {/* Back Link */}
                <Link
                    href="/users"
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-6"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Volver a Usuarios
                </Link>

                {/* User Header */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <div className="flex items-start gap-4">
                        <div className="size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-black">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                                {user.isActive ? (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                                        ACTIVO
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold">
                                        INACTIVO
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Departamento</p>
                            <p className="text-base font-bold text-slate-900">{user.department || 'Sin asignar'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Rol</p>
                            <p className="text-base font-bold text-slate-900">{user.role || 'Sin rol'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Fecha Registro</p>
                            <p className="text-base font-bold text-slate-900">{user.createdAt}</p>
                        </div>
                    </div>
                </div>

                {/* Current Assignments */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">assignment_turned_in</span>
                        Activos Asignados Actualmente
                        <span className="ml-auto px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                            {currentAssignments.length}
                        </span>
                    </h2>

                    {currentAssignments.length > 0 ? (
                        <div className="space-y-3">
                            {currentAssignments.map((assignment) => (
                                <Link
                                    key={assignment.id}
                                    href={`/inventory/${assignment.asset.id}`}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="size-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400">devices</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                            {assignment.asset.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {assignment.asset.brand} {assignment.asset.model} • {assignment.asset.category}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Etiqueta</p>
                                        <p className="font-mono font-bold text-slate-900">{assignment.asset.assetTag}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Asignado</p>
                                        <p className="text-sm font-medium text-slate-700">{assignment.assignedAt}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">
                                        chevron_right
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                            <p>Este usuario no tiene activos asignados actualmente</p>
                        </div>
                    )}
                </div>

                {/* Past Assignments */}
                {pastAssignments.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">history</span>
                            Historial de Asignaciones
                            <span className="ml-auto px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                                {pastAssignments.length}
                            </span>
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-500">
                                        <th className="text-left pb-3 font-medium">Activo</th>
                                        <th className="text-left pb-3 font-medium">Etiqueta</th>
                                        <th className="text-left pb-3 font-medium">Asignado</th>
                                        <th className="text-left pb-3 font-medium">Devuelto</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pastAssignments.map((assignment) => (
                                        <tr key={assignment.id} className="group">
                                            <td className="py-3">
                                                <p className="font-medium text-slate-900">{assignment.asset.name}</p>
                                                <p className="text-xs text-slate-500">{assignment.asset.category}</p>
                                            </td>
                                            <td className="py-3 font-mono text-slate-600">{assignment.asset.assetTag}</td>
                                            <td className="py-3 text-slate-600">{assignment.assignedAt}</td>
                                            <td className="py-3 text-slate-600">{assignment.returnedAt}</td>
                                            <td className="py-3">
                                                <Link
                                                    href={`/inventory/${assignment.asset.id}`}
                                                    className="text-slate-400 hover:text-primary"
                                                >
                                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
