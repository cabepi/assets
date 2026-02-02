"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Tablero", href: "/", icon: "dashboard" },
    { name: "Inventario", href: "/inventory", icon: "inventory_2" },
    { name: "Asignaciones", href: "/assignments", icon: "assignment_ind" },
    { name: "Usuarios", href: "/users", icon: "group" },
    { name: "Reportes", href: "/reports", icon: "description" },
];

export function Sidebar() {
    const pathname = usePathname();

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
                    {navItems.map((item) => {
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
                            className="size-8 rounded-full bg-slate-200 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsxawJbgDsVe0-rMWHdDuZxR8OwvKH9ED9hzyK-u2q1LB_6jhf1Tzguql6-hTeKt1EFKn-2Ae3k4ApyASIZPvsF56hbN1o8OD0ACkOXvB4uD4mudxHTswydgRCTice5tf5EtIkF6rIptkYpAG97GIRn4d539AjVRzSIVAdJeA5RX1oS-24lsTac0LlpnNmaqgXbisNKIw5Cn9QAAO3KxO6Vyac05SXPCjPZAb_5Ea7nSVKqKtMUBcTJ3uIO1Ly4T2b39HcWm2PhWC9')",
                            }}
                        ></div>
                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-900">Alex Rivera</p>
                            <p className="text-[10px] text-slate-500">Oficina CFO</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 ml-auto text-sm cursor-pointer">
                            settings
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
