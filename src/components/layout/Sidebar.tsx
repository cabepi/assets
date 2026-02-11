"use client";

import { useState, useEffect } from "react";

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

    // Helper to check role
    const hasRole = (allowedRoles: string[]) => {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        const userRole = session.role_name || session.job_title || '';
        return allowedRoles.some(role => userRole.toLowerCase() === role.toLowerCase());
    };

    interface NavItem {
        name: string;
        href: string;
        icon: string;
        requiredPerm: string | null;
        allowedRoles?: string[];
        children?: NavItem[];
    }

    const navItems: NavItem[] = [
        { name: "Tablero", href: "/", icon: "dashboard", requiredPerm: null },
        { name: "Inventario", href: "/inventory", icon: "inventory_2", requiredPerm: 'asset_view' },
        { name: "Asignaciones", href: "/assignments", icon: "assignment_ind", requiredPerm: 'asset_view' },
        { name: "Usuarios", href: "/users", icon: "group", requiredPerm: 'view_users' },
        { name: "Reportes", href: "/reports", icon: "description", requiredPerm: 'view_depreciation' },
        {
            name: "Fripick",
            href: "#",
            icon: "restaurant_menu",
            requiredPerm: null,
            allowedRoles: ['Admin', 'Finanzas'],
            children: [
                { name: "Procesos", href: "/fripick/processes", icon: "view_list", requiredPerm: null },
            ]
        },
        { name: "Configuración", href: "/settings/categories", icon: "settings", requiredPerm: 'view_settings' },
    ];

    const filterNav = (items: NavItem[]): NavItem[] => {
        return items.filter(item => {
            const permCheck = !item.requiredPerm || can(item.requiredPerm);
            const roleCheck = !item.allowedRoles || hasRole(item.allowedRoles);
            return permCheck && roleCheck;
        }).map(item => {
            if (item.children) {
                return { ...item, children: filterNav(item.children) };
            }
            return item;
        });
    };

    const filteredNav = filterNav(navItems);

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
                <nav className="flex flex-col gap-1 grow overflow-y-auto">
                    {filteredNav.map((item) => (
                        <SidebarItem key={item.name} item={item} pathname={pathname} />
                    ))}
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

function SidebarItem({ item, pathname }: { item: any, pathname: string }) {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    const hasChildren = item.children && item.children.length > 0;
    // Auto-expand if a child is active
    const isChildActive = hasChildren && item.children.some((child: any) => pathname === child.href || pathname.startsWith(child.href));

    // Simple state for collapse could be added here, but for now let's just show children if present
    // or we can make it collapsible. Let's make it always expanded if child is active, otherwise collapsed?
    // For simplicity in this iteration, I'll render them hierarchically. 
    // Ideally use useState for toggling.

    // Since we are in a mapped loop inside the component which is "use client", we can use hooks if we extract this to a component.
    // Which I did: SidebarItem.

    const [isOpen, setIsOpen] = useState(isChildActive);

    // Update open state if external navigation happens
    useEffect(() => {
        if (isChildActive) setIsOpen(true);
    }, [isChildActive]);

    if (hasChildren) {
        return (
            <div className="flex flex-col gap-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg transition-colors w-full text-left",
                        isActive || isChildActive
                            ? "text-primary font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                    <span className="material-symbols-outlined text-lg">
                        {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
                {isOpen && (
                    <div className="flex flex-col gap-1 pl-9 border-l border-slate-100 ml-4">
                        {item.children.map((child: any) => (
                            <SidebarItem key={child.name} item={child} pathname={pathname} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
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
}
