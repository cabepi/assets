import { sql } from "@vercel/postgres";
import { formatDate } from "./utils";

export async function getDashboardMetrics() {
    const totalAssetsPromise = sql`SELECT count(*) FROM asset.fixed_assets`;
    const maintenanceAssetsPromise = sql`SELECT count(*) FROM asset.fixed_assets WHERE status = 'maintenance'`;
    const totalValuePromise = sql`SELECT sum(purchase_price) FROM asset.fixed_assets`;
    const categoryDistributionPromise = sql`
    SELECT c.name, count(a.asset_id) as count
    FROM asset.fixed_assets a
    LEFT JOIN asset.categories c ON a.category_id = c.category_id
    GROUP BY c.name
  `;

    const [totalAssets, maintenanceAssets, totalValueResult, categoryDistribution] = await Promise.all([
        totalAssetsPromise,
        maintenanceAssetsPromise,
        totalValuePromise,
        categoryDistributionPromise,
    ]);

    return {
        totalAssets: Number(totalAssets.rows[0].count),
        maintenanceCount: Number(maintenanceAssets.rows[0].count),
        totalValue: Number(totalValueResult.rows[0].sum || 0),
        categoryDistribution: categoryDistribution.rows.map((row) => ({
            name: row.name,
            count: Number(row.count),
        })),
    };
}

export async function getAssetsList(filters?: {
    query?: string;
    status?: string;
    categoryId?: string;
}) {
    const searchQuery = filters?.query ? `%${filters.query}%` : null;
    const statusFilter = filters?.status || null;
    const categoryFilter = filters?.categoryId || null;

    const result = await sql`
    SELECT 
      a.asset_id,
      a.asset_tag,
      a.name,
      a.model,
      a.status,
      a.purchase_date,
      c.name as category_name,
      l.name as location_name
    FROM asset.fixed_assets a
    LEFT JOIN asset.categories c ON a.category_id = c.category_id
    LEFT JOIN asset.locations l ON a.location_id = l.location_id
    WHERE 
        (${searchQuery}::text IS NULL OR (a.name ILIKE ${searchQuery} OR a.asset_tag ILIKE ${searchQuery} OR a.model ILIKE ${searchQuery}))
        AND (${statusFilter}::text IS NULL OR a.status = ${statusFilter})
        AND (${categoryFilter}::int IS NULL OR a.category_id = ${categoryFilter}::int)
    ORDER BY a.created_at DESC
  `;

    return result.rows.map((row) => ({
        id: row.asset_id,
        assetTag: row.asset_tag,
        name: row.name,
        model: row.model,
        status: row.status,
        purchaseDate: formatDate(row.purchase_date),
        category: {
            name: row.category_name
        },
        location: {
            name: row.location_name
        }
    }));
}

export async function getAssignmentsList() {
    const result = await sql`
      SELECT 
        asm.assignment_id,
        a.asset_tag,
        a.name as asset_name,
        u.full_name as user_name,
        u.department,
        asm.assigned_at as assignment_date,
        CASE 
            WHEN asm.is_current = true THEN 'active'
            ELSE 'returned'
        END as status
      FROM asset.assignments asm
      JOIN asset.fixed_assets a ON asm.asset_id = a.asset_id
      JOIN asset.users u ON asm.user_id = u.user_id
      ORDER BY asm.assigned_at DESC
    `;

    return result.rows.map((row) => ({
        id: row.assignment_id,
        assetTag: row.asset_tag,
        assetName: row.asset_name,
        userName: row.user_name,
        department: row.department,
        assignmentDate: formatDate(row.assignment_date),
        status: row.status
    }));
}

export async function getCategories() {
    const result = await sql`SELECT category_id, name FROM asset.categories ORDER BY name ASC`;
    return result.rows.map(row => ({ id: row.category_id, name: row.name }));
}

export async function getLocations() {
    const result = await sql`SELECT location_id, name FROM asset.locations ORDER BY name ASC`;
    return result.rows.map(row => ({ id: row.location_id, name: row.name }));
}

export async function getAssetById(id: string) {
    const result = await sql`
    SELECT 
      a.asset_id,
      a.asset_tag,
      a.name,
      a.brand,
      a.model,
      a.serial_number,
      a.status,
      a.purchase_date,
      a.purchase_price,
      a.technical_specs,
      c.name as category_name,
      l.name as location_name,
      u.full_name as assigned_user_name,
      u.email as assigned_user_email,
      u.department as assigned_user_dept,
      asm.assigned_at
    FROM asset.fixed_assets a
    LEFT JOIN asset.categories c ON a.category_id = c.category_id
    LEFT JOIN asset.locations l ON a.location_id = l.location_id
    LEFT JOIN asset.assignments asm ON a.asset_id = asm.asset_id AND asm.is_current = true
    LEFT JOIN asset.users u ON asm.user_id = u.user_id
    WHERE a.asset_id = ${id}
  `;

    const row = result.rows[0];
    if (!row) return null;

    const assignedTo = row.assigned_user_name ? {
        name: row.assigned_user_name,
        email: row.assigned_user_email,
        department: row.assigned_user_dept,
        assignedAt: formatDate(row.assigned_at)
    } : null;

    return {
        id: row.asset_id,
        assetTag: row.asset_tag,
        name: row.name,
        brand: row.brand,
        model: row.model,
        serialNumber: row.serial_number,
        status: row.status,
        purchaseDate: formatDate(row.purchase_date),
        purchasePrice: Number(row.purchase_price),
        specs: row.technical_specs, // JSONB
        category: {
            name: row.category_name
        },
        location: {
            name: row.location_name
        },
        assignedTo
    };
}

export async function getUsers() {
    const result = await sql`SELECT user_id, full_name FROM asset.users WHERE is_active = true ORDER BY full_name ASC`;
    return result.rows.map(row => ({ id: row.user_id, name: row.full_name }));
}

