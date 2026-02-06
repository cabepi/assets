'use server';

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Logger } from "./logger";
import { verifySession } from "./auth";
import { verifyPermission, PERMISSIONS } from "./rbac";

// Helper to get current user securely
async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    return await verifySession(token);
}

export async function createAsset(formData: FormData) {
    // RBAC Check
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.ASSET.CREATE)) {
        throw new Error("Acceso Denegado: No tienes permiso para crear activos.");
    }

    const rawFormData = {
        name: formData.get('name') as string,
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        serialNumber: formData.get('serialNumber') as string,
        categoryId: formData.get('categoryId') as string,
        purchaseDate: formData.get('purchaseDate') as string,
        purchasePrice: formData.get('purchasePrice') as string,
        salvageValue: formData.get('salvageValue') as string,
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
            salvage_value,
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
            ${Number(rawFormData.salvageValue) || 0},
            ${rawFormData.depreciationMethod}
        )
      `;

        console.log(`Asset created: ${assetTag}`);
        await Logger.info(`Asset created: ${assetTag}`, { assetTag, name: rawFormData.name, userId: user.user_id });

    } catch (error) {
        console.error('Failed to create asset:', error);
        await Logger.error('Failed to create asset', error, { formData: rawFormData });
        throw new Error('Failed to create asset');
    }

    revalidatePath('/inventory');
    revalidatePath('/');
    redirect('/inventory');
}

export async function assignAsset(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.OPS.ASSIGN)) {
        throw new Error("Acceso Denegado: No tienes permiso para asignar activos.");
    }

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
    // Considering return as part of assignment/ops logic
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.OPS.ASSIGN)) {
        throw new Error("Acceso Denegado: No tienes permiso para recibir activos.");
    }

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

export async function updateAssetLocation(formData: FormData) {
    // Location update is arguably editing asset or ops. Let's say EDIT.
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.ASSET.EDIT)) {
        throw new Error("Acceso Denegado.");
    }

    const assetId = formData.get('assetId') as string;
    const newLocationId = formData.get('locationId') as string;
    const notes = formData.get('notes') as string;

    try {
        // 1. Get current location for history
        const currentAsset = await sql`SELECT location_id FROM asset.fixed_assets WHERE asset_id = ${assetId}`;
        const previousLocationId = currentAsset.rows[0]?.location_id || null;

        // 2. Update Asset Location
        await sql`
            UPDATE asset.fixed_assets 
            SET location_id = ${Number(newLocationId)}
            WHERE asset_id = ${assetId}
        `;

        // 3. Log History
        await sql`
            INSERT INTO asset.location_history (asset_id, previous_location_id, new_location_id, reason)
            VALUES (${assetId}, ${previousLocationId}, ${Number(newLocationId)}, ${notes})
        `;

    } catch (error) {
        console.error('Failed to update location:', error);
        throw new Error('Failed to update location');
    }

    revalidatePath(`/inventory/${assetId}`);
}

export async function logMaintenance(formData: FormData) {
    // Maintenance is usually technical support (Soporte)
    const user = await getCurrentUser();
    // Assuming 'asset_edit' covers maintenance logging for now, or add specific permission if needed.
    // Soporte has 'asset_edit'.
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.ASSET.EDIT)) {
        throw new Error("Acceso Denegado.");
    }

    const assetId = formData.get('assetId') as string;
    const type = formData.get('type') as string;
    const date = formData.get('date') as string;
    const cost = formData.get('cost') as string;
    const description = formData.get('description') as string;
    const performedBy = formData.get('performedBy') as string;
    const setStatusMaintenance = formData.get('setStatusMaintenance') === 'on';

    try {
        // 1. Log the maintenance event
        await sql`
            INSERT INTO asset.maintenance_logs (
                asset_id, maintenance_date, maintenance_type, description, cost, performed_by
            ) VALUES (
                ${assetId}, ${date}::date, ${type}, ${description}, ${Number(cost)}, ${performedBy}
            )
        `;

        // 2. Optionally update status to 'maintenance'
        if (setStatusMaintenance) {
            await sql`
                UPDATE asset.fixed_assets 
                SET status = 'maintenance' 
                WHERE asset_id = ${assetId}
            `;
        }
    } catch (error) {
        console.error('Failed to log maintenance:', error);
        throw new Error('Failed to log maintenance');
    }

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
}

export async function recoverAsset(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.ASSET.EDIT)) {
        throw new Error("Acceso Denegado.");
    }

    const assetId = formData.get('assetId') as string;

    try {
        await sql`
            UPDATE asset.fixed_assets 
            SET status = 'stock' 
            WHERE asset_id = ${assetId}
        `;
    } catch (error) {
        console.error('Failed to recover asset:', error);
        throw new Error('Failed to recover asset');
    }

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
}

export async function retireAsset(formData: FormData) {
    const user = await getCurrentUser();
    // Retirement is a form of deletion/archiving.
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.ASSET.DELETE)) {
        throw new Error("Acceso Denegado: Solo administradores pueden retirar activos.");
    }

    const assetId = formData.get('assetId') as string;
    const reason = formData.get('reason') as string;
    const date = formData.get('date') as string;
    const salvageValue = formData.get('salvageValue') as string;

    try {
        await sql`
            UPDATE asset.fixed_assets
            SET 
                status = 'retired',
                retirement_date = ${date}::date,
                retirement_reason = ${reason},
                salvage_value = ${Number(salvageValue)}
            WHERE asset_id = ${assetId}
        `;
    } catch (error) {
        console.error('Failed to retire asset:', error);
        throw new Error('Failed to retire asset');
    }

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
}

export async function updateAsset(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.ASSET.EDIT)) {
        throw new Error("Acceso Denegado.");
    }

    const assetId = formData.get('assetId') as string;
    const assetTag = formData.get('assetTag') as string;
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const serialNumber = formData.get('serialNumber') as string;
    const categoryId = formData.get('categoryId') as string;
    const purchaseDate = formData.get('purchaseDate') as string;
    const purchasePrice = formData.get('purchasePrice') as string;
    const salvageValue = formData.get('salvageValue') as string;
    const depreciationMethod = formData.get('depreciationMethod') as string;
    const technicalSpecs = {
        cpu: formData.get('cpu') as string,
        ram: formData.get('ram') as string,
        storage: formData.get('storage') as string,
        details: formData.get('details') as string,
    };

    // Validation
    if (!name || !assetTag) {
        throw new Error("Nombre y Etiqueta/Tag son requeridos");
    }

    try {
        // Check if asset_tag is unique (excluding current asset)
        const existing = await sql`
            SELECT asset_id FROM asset.fixed_assets 
            WHERE asset_tag = ${assetTag} AND asset_id != ${assetId}
        `;
        if (existing.rows.length > 0) {
            await Logger.warning(`Attempted to use duplicate asset tag: ${assetTag}`, { assetId, existingId: existing.rows[0].asset_id });
            throw new Error(`La etiqueta "${assetTag}" ya existe en otro activo`);
        }

        // Update asset
        await sql`
            UPDATE asset.fixed_assets
            SET 
                asset_tag = ${assetTag},
                name = ${name},
                brand = ${brand},
                model = ${model},
                serial_number = ${serialNumber},
                category_id = ${categoryId ? Number(categoryId) : null},
                purchase_date = ${purchaseDate}::date,
                purchase_price = ${Number(purchasePrice) || 0},
                salvage_value = ${Number(salvageValue) || 0},
                depreciation_method = ${depreciationMethod},
                technical_specs = ${JSON.stringify(technicalSpecs)},
                updated_at = CURRENT_TIMESTAMP
            WHERE asset_id = ${assetId}
        `;

    } catch (error) {
        console.error('Failed to update asset:', error);
        throw error;
    }

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
}

export async function updateCategory(formData: FormData) {
    // Configuration settings - Finance or Admin only?
    // Let's assume Finance can edit valuation (which categories affect).
    const user = await getCurrentUser();
    if (!user || !await verifyPermission(user.user_id, PERMISSIONS.FINANCE.EDIT_VALUATION)) {
        throw new Error("Acceso Denegado: Configuración financiera.");
    }

    const categoryId = formData.get('categoryId') as string;
    const years = formData.get('years') as string;

    if (!categoryId || !years) {
        throw new Error("ID de categoría y años son requeridos");
    }

    try {
        await sql`
            UPDATE asset.categories 
            SET depreciation_years = ${Number(years)}
            WHERE category_id = ${Number(categoryId)}
        `;

        await Logger.info(`Category updated via settings`, { categoryId, years, userId: user.user_id });

    } catch (error) {
        console.error('Failed to update category:', error);
        throw new Error('Failed to update category');
    }

    revalidatePath('/settings/categories');
    revalidatePath('/inventory');
}
