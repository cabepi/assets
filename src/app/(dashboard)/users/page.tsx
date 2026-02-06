import { getUsersList } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import Link from "next/link";

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query } = await searchParams;
    const users = await getUsersList(query);

    return (
        <>
            <Header title="Usuarios" />
            <div className="px-4 md:px-10 py-8 max-w-6xl mx-auto w-full">
                {/* Search */}
                <div className="mb-6">
                    <form className="flex gap-2">
                        <div className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                search
                            </span>
                            <input
                                type="text"
                                name="query"
                                placeholder="Buscar por nombre, email o departamento..."
                                defaultValue={query}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90"
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* Stats */}
                <div className="mb-6 flex gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">Total Usuarios</p>
                        <p className="text-2xl font-black text-slate-900">{users.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">Con Activos Asignados</p>
                        <p className="text-2xl font-black text-emerald-600">
                            {users.filter(u => u.activeAssignments > 0).length}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full" suppressHydrationWarning>
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left p-4 text-sm font-bold text-slate-600">Nombre</th>
                                <th className="text-left p-4 text-sm font-bold text-slate-600">Email</th>
                                <th className="text-left p-4 text-sm font-bold text-slate-600">Departamento</th>
                                <th className="text-left p-4 text-sm font-bold text-slate-600">Rol</th>
                                <th className="text-center p-4 text-sm font-bold text-slate-600">Activos</th>
                                <th className="text-center p-4 text-sm font-bold text-slate-600">Estado</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="p-4 text-sm text-slate-600">{user.department || '—'}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">
                                            {user.jobTitle || 'Sin cargo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {user.activeAssignments > 0 ? (
                                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                {user.activeAssignments}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">0</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                                <span className="size-2 bg-emerald-500 rounded-full"></span>
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                                <span className="size-2 bg-slate-300 rounded-full"></span>
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/users/${user.id}`}
                                            className="flex items-center justify-center size-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">person_off</span>
                            <p className="text-slate-500">No se encontraron usuarios</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
