import { cn } from "@/lib/utils";

interface HeaderProps {
    title: string;
    className?: string;
}

export function Header({ title, className }: HeaderProps) {
    return (
        <header className={cn("sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 py-4", className)}>
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-slate-900 text-lg font-bold">{title}</h2>
                <div className="relative max-w-sm w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl leading-none">search</span>
                    <input className="w-full bg-slate-50 border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 outline-none" placeholder="Buscar activos, números de serie o ubicaciones..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">help</span>
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">FY 2024 Q3</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                </div>
            </div>
        </header>
    );
}
