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
            </div>
            {/* Controls removed as per request */}
        </header>
    );
}
