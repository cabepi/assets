import { getAssetById, getLocationHistory, getMaintenanceLogs } from "@/lib/data";
import { notFound } from "next/navigation";
import { AssetDetailsView } from "@/components/features/assets/AssetDetailsView";

export default async function VerifyAssetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [asset, locationHistory, maintenanceLogs] = await Promise.all([
        getAssetById(id),
        getLocationHistory(id),
        getMaintenanceLogs(id)
    ]);

    if (!asset) {
        notFound();
    }

    // Since this *is* the verify page, the QR logic is recursive if referenced indefinitely 
    // but useful if user wants to reshare.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrValue = `${baseUrl}/verify/${asset.id}`;

    return (
        <AssetDetailsView
            asset={asset}
            qrValue={qrValue}
            isPublic={true}
            locationHistory={locationHistory}
            maintenanceLogs={maintenanceLogs}
        />
    );
}
