'use server';

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAsset(formData: FormData) {
    const rawFormData = {
        name: formData.get('name') as string,
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        serialNumber: formData.get('serialNumber') as string,
        categoryId: formData.get('categoryId') as string,
        purchaseDate: formData.get('purchaseDate') as string,
        purchasePrice: formData.get('purchasePrice') as string,
        depreciationMethod: formData.get('depreciationMethod') as string,
        technicalSpecs: {
            cpu: formData.get('cpu') as string,
            ram: formData.get('ram') as string,
            storage: formData.get('storage') as string,
            details: formData.get('details') as string,
        }
    };

    // Basic Validation
    if (!rawFormData.name || !rawFormData.purchasePrice || !rawFormData.categoryId) {
        throw new Error("Missing required fields");
    }

    try {
        // 1. Generate Asset Tag (Simple auto-increment logic or random for now, or use DB sequence if strictly relying on that. 
        // Let's make a pretty AST-YYYY-XXXX tag)
        // For simplicity in raw SQL without a stored procedure, we'll do a quick count or random. 
        // Better: use a sequence or generated always as identity, but let's do a computed tag based on year.
        const year = new Date().getFullYear();
        const countResult = await sql`SELECT count(*) FROM asset.fixed_assets`;
        const count = Number(countResult.rows[0].count) + 1;
        const assetTag = `AST-${year}-${count.toString().padStart(4, '0')}`;

        // 2. Insert into fixed_assets
        await sql`
        INSERT INTO asset.fixed_assets (
            asset_tag, 
            name, 
            brand, 
            model, 
            serial_number, 
            category_id, 
            status, 
            technical_specs, 
            purchase_date, 
            purchase_price, 
            depreciation_method
        ) VALUES (
            ${assetTag},
            ${rawFormData.name},
            ${rawFormData.brand},
            ${rawFormData.model},
            ${rawFormData.serialNumber},
            ${Number(rawFormData.categoryId)},
            'stock',
            ${JSON.stringify(rawFormData.technicalSpecs)},
            ${rawFormData.purchaseDate}::date,
            ${Number(rawFormData.purchasePrice)},
            ${rawFormData.depreciationMethod}
        )
      `;

        console.log(`Asset created: ${assetTag}`);

    } catch (error) {
        console.error('Failed to create asset:', error);
        throw new Error('Failed to create asset');
    }

    revalidatePath('/inventory');
    revalidatePath('/');
    redirect('/inventory');
}

export async function assignAsset(formData: FormData) {
    const assetId = formData.get('assetId') as string;
    const userId = formData.get('userId') as string;
    const condition = formData.get('condition') as string;
    const assignmentDate = formData.get('date') as string;
    // Signature removed per requirements

    try {
        // Transaction manually handled by order of operations (safe enough for prototype)
        // 1. Insert Assignment
        await sql`
            INSERT INTO asset.assignments (
                asset_id, user_id, assigned_at, condition_on_delivery, is_current
            )
            VALUES (
                ${assetId}, ${userId}, ${assignmentDate}::date, ${condition}, true
            )
        `;

        // 2. Update Asset Status
        await sql`
            UPDATE asset.fixed_assets
            SET status = 'assigned'
            WHERE asset_id = ${assetId}
        `;

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to assign asset.');
    }

    revalidatePath('/assignments');
    revalidatePath('/inventory');
    redirect('/assignments');
}

export async function returnAsset(formData: FormData) {
    const assetId = formData.get('assetId') as string;
    const returnDate = formData.get('date') as string;
    const condition = formData.get('condition') as string;

    try {
        // 1. Close the active assignment
        await sql`
            UPDATE asset.assignments 
            SET 
                returned_at = ${returnDate}::date, 
                condition_on_return = ${condition},
                is_current = false
            WHERE asset_id = ${assetId} AND is_current = true
        `;

        // 2. Update Asset Status back to stock
        // (In a real app, 'Malo' condition might trigger 'maintenance' status, keeping simple as requested)
        await sql`
            UPDATE asset.fixed_assets
            SET status = 'stock'
            WHERE asset_id = ${assetId}
        `;

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to return asset.');
    }

    revalidatePath('/assignments');
    revalidatePath('/inventory');
    redirect('/assignments');
}
