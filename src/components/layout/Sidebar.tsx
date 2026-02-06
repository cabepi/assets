"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";
import { AuthSession } from "@/lib/auth";

interface SidebarProps {
    session: AuthSession;
    permissions: string[];
}

export function Sidebar({ session, permissions }: SidebarProps) {
    const pathname = usePathname();

    // Helper to check permission
    const can = (code: string) => permissions.includes('*') || permissions.includes(code);

    const navItems = [
        { name: "Tablero", href: "/", icon: "dashboard", requiredPerm: null },
        { name: "Inventario", href: "/inventory", icon: "inventory_2", requiredPerm: 'asset_view' },
        { name: "Asignaciones", href: "/assignments", icon: "assignment_ind", requiredPerm: 'asset_view' },
        { name: "Usuarios", href: "/users", icon: "group", requiredPerm: 'asset_view' }, // Creating users is probably admin, but viewing list ok for all?
        { name: "Reportes", href: "/reports", icon: "description", requiredPerm: 'view_depreciation' },
        { name: "Configuración", href: "/settings/categories", icon: "settings", requiredPerm: 'edit_valuation' },
    ];

    const filteredNav = navItems.filter(item =>
        !item.requiredPerm || can(item.requiredPerm)
    );

    return (
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-full">
            <div className="p-6 flex flex-col gap-8 h-full">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 text-base font-bold leading-none">AssetCorp</h1>
                        <p className="text-slate-500 text-xs font-medium">Operaciones Tech</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1 grow">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                <span className="text-sm font-semibold">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3">
                        <div
                            className="size-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs"
                        >
                            {session.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate w-24" title={session.email}>{session.email.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-500 truncate w-24" title={session.job_title}>{session.job_title}</p>
                        </div>
                        <form action={logout} className="ml-auto">
                            <button className="text-slate-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
                                <span className="material-symbols-outlined text-xl">logout</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </aside>
    );
}
