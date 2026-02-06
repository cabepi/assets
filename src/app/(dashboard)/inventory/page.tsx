import { Header } from "@/components/layout/Header";

export const dynamic = 'force-dynamic';
import { getAssetsList, getCategories } from "@/lib/data";
import { InventoryControls } from "@/components/features/assets/InventoryControls";
import { InventoryTable } from "@/components/features/assets/InventoryTable";
import Link from "next/link";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { getUserPermissions } from "@/lib/rbac";

export default async function InventoryPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        status?: string;
        categoryId?: string;
    }>;
}) {
    // RBAC Check
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    const session = token ? await verifySession(token) : null;
    const permissions = session ? await getUserPermissions(session.user_id) : [];

    const canCreate = permissions.includes('*') || permissions.includes('asset_create');

    const params = await searchParams;
    const assets = await getAssetsList({
        query: params?.query,
        status: params?.status,
        categoryId: params?.categoryId,
    });
    const categories = await getCategories();

    return (
        <>
            <Header title="Inventario Maestro de Activos" />
            <div className="px-10 py-8 flex flex-col gap-6">
                <div className="flex flex-wrap justify-between items-end gap-3">
                    <div className="flex min-w-72 flex-col gap-1">
                        <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em]">
                            Inventario de Activos
                        </p>
                        <p className="text-slate-500 text-base font-normal leading-normal">
                            Gestione y rastree los activos tecnológicos de la empresa con trazabilidad total.
                        </p>
                    </div>
                    {canCreate && (
                        <div className="flex gap-4">
                            <Link href="/asset-registration" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all">
                                <span className="material-symbols-outlined">add</span>
                                Nuevo Activo
                            </Link>
                        </div>
                    )}
                </div>

                <InventoryControls categories={categories} />

                <InventoryTable assets={assets} />
            </div>
        </>
    );
}
