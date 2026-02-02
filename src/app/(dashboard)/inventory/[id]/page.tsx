import { getAssetById, getLocations, getLocationHistory, getMaintenanceLogs, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import { AssetDetailsView } from "@/components/features/assets/AssetDetailsView";
import { AssetActions } from "@/components/features/assets/AssetActions";

export default async function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parallel data fetching
    const [asset, locations, locationHistory, maintenanceLogs, categories] = await Promise.all([
        getAssetById(id),
        getLocations(),
        getLocationHistory(id),
        getMaintenanceLogs(id),
        getCategories()
    ]);

    if (!asset) {
        notFound();
    }

    // In production, use env var. Locally:
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Point QR Code to the public verification page
    const qrValue = `${baseUrl}/verify/${asset.id}`;

    const actions = (
        <AssetActions
            assetId={asset.id}
            locations={locations}
            currentLocationId={undefined} // Note: API should return locationId in asset object to be perfect, but strict id not strictly needed for UI initial state here if action handles it
            isRetired={asset.status === 'retired'}
            currentStatus={asset.status}
        />
    );

    return (
        <AssetDetailsView
            asset={asset}
            qrValue={qrValue}
            actions={actions}
            locationHistory={locationHistory}
            maintenanceLogs={maintenanceLogs}
            categories={categories}
        />
    );
}
