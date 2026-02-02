import { getAssetById } from "@/lib/data";
import { notFound } from "next/navigation";
import { AssetDetailsView } from "@/components/features/assets/AssetDetailsView";

export default async function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const asset = await getAssetById(id);

    if (!asset) {
        notFound();
    }

    // In production, use env var. Locally:
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Point QR Code to the public verification page
    const qrValue = `${baseUrl}/verify/${asset.id}`;

    return <AssetDetailsView asset={asset} qrValue={qrValue} />;
}
