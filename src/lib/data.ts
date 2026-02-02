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
      a.depreciation_method,
      a.category_id,
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

    // Format raw date as YYYY-MM-DD for input[type=date]
    const purchaseDateRaw = row.purchase_date
        ? new Date(row.purchase_date).toISOString().split('T')[0]
        : '';

    return {
        id: row.asset_id,
        assetTag: row.asset_tag,
        name: row.name,
        brand: row.brand,
        model: row.model,
        serialNumber: row.serial_number,
        status: row.status,
        purchaseDate: formatDate(row.purchase_date),
        purchaseDateRaw,
        purchasePrice: Number(row.purchase_price),
        depreciationMethod: row.depreciation_method,
        specs: row.technical_specs, // JSONB
        category: {
            id: row.category_id,
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

export async function getWarrantyAlerts() {
    const result = await sql`
        SELECT 
            a.asset_id,
            a.name,
            a.serial_number,
            c.name as category_name,
            l.name as location_name,
            a.warranty_expiration_date
        FROM asset.fixed_assets a
        LEFT JOIN asset.categories c ON a.category_id = c.category_id
        LEFT JOIN asset.locations l ON a.location_id = l.location_id
        WHERE a.warranty_expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
        ORDER BY a.warranty_expiration_date ASC
    `;

    return result.rows.map(row => ({
        id: row.asset_id,
        name: row.name,
        serialNumber: row.serial_number,
        category: row.category_name,
        location: row.location_name,
        expirationDate: formatDate(row.warranty_expiration_date)
    }));
}

export async function getDepreciationMetrics() {
    // Fetch assets with necessary data for calculation
    // Assuming Straight Line depreciation based on category years
    const assetsResult = await sql`
        SELECT 
            a.purchase_price,
            a.purchase_date,
            COALESCE(c.depreciation_years, 3) as useful_life_years
        FROM asset.fixed_assets a
        LEFT JOIN asset.categories c ON a.category_id = c.category_id
        WHERE a.status != 'retired'
    `;

    let totalMonthlyDepreciation = 0;
    let currentTotalBookValue = 0;

    const now = new Date();

    assetsResult.rows.forEach(asset => {
        const price = Number(asset.purchase_price);
        const usefulLifeMonths = asset.useful_life_years * 12;
        const monthlyDepr = price / usefulLifeMonths;
        const purchaseDate = new Date(asset.purchase_date);

        // Calculate age in months
        const ageInMilliseconds = now.getTime() - purchaseDate.getTime();
        const ageInMonths = ageInMilliseconds / (1000 * 60 * 60 * 24 * 30.44);

        // Current Book Value (cannot be less than 0)
        const depreciationAmount = monthlyDepr * ageInMonths;
        const bookValue = Math.max(0, price - depreciationAmount);

        currentTotalBookValue += bookValue;

        // If asset is still depreciating, add to fleet monthly depreciation
        if (bookValue > 0) {
            totalMonthlyDepreciation += monthlyDepr;
        }
    });

    // Project next 6 points (every 2 months for the chart labels)
    const projection = [];
    for (let i = 0; i <= 6; i++) {
        projection.push(Math.max(0, currentTotalBookValue - (totalMonthlyDepreciation * (i * 2))));
    }

    return {
        currentBookValue: currentTotalBookValue,
        monthlyRate: totalMonthlyDepreciation,
        projection // Array of values for the chart
    };
}

export async function getLocationHistory(assetId: string) {
    const result = await sql`
        SELECT 
            h.history_id,
            h.changed_at,
            h.reason,
            prev.name as prev_location,
            curr.name as new_location
        FROM asset.location_history h
        LEFT JOIN asset.locations prev ON h.previous_location_id = prev.location_id
        LEFT JOIN asset.locations curr ON h.new_location_id = curr.location_id
        WHERE h.asset_id = ${assetId}
        ORDER BY h.changed_at DESC
    `;

    return result.rows.map(row => ({
        id: row.history_id,
        date: formatDate(row.changed_at),
        reason: row.reason,
        prevLocation: row.prev_location || 'N/A',
        newLocation: row.new_location
    }));
}

export async function getMaintenanceLogs(assetId: string) {
    const result = await sql`
        SELECT 
            log_id,
            maintenance_date,
            maintenance_type,
            description,
            cost,
            performed_by
        FROM asset.maintenance_logs
        WHERE asset_id = ${assetId}
        ORDER BY maintenance_date DESC
    `;

    return result.rows.map(row => ({
        id: row.log_id,
        date: formatDate(row.maintenance_date),
        type: row.maintenance_type,
        description: row.description,
        cost: Number(row.cost),
        performedBy: row.performed_by
    }));
}
