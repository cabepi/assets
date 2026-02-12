import { UploadLunchModal } from "@/components/features/fripick/UploadLunchModal";
import { LunchHistoryTable } from "@/components/features/fripick/LunchHistoryTable";
import { getLunchUploads } from "@/lib/fripick-actions";

export default async function ProcessesPage() {
    const uploads = await getLunchUploads();

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-slate-900">Procesos</h1>
                    <p className="text-sm text-slate-500">Gestión de Cargas de Almuerzo y Farmacia</p>
                </div>
                <div className="flex items-center gap-3">
                    <UploadLunchModal />
                </div>
            </header>

            <div className="flex-1 p-6 overflow-auto">
                <LunchHistoryTable uploads={uploads} />
            </div>
        </div>
    );
}
