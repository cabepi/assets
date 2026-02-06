import { sql } from "@vercel/postgres";
import { formatDate } from "./utils";
import { DepreciationCalculator } from "./depreciation";

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
    const result = await sql`SELECT category_id, name, depreciation_years FROM asset.categories ORDER BY name ASC`;
    return result.rows.map(row => ({
        id: row.category_id,
        name: row.name,
        depreciationYears: row.depreciation_years || 3
    }));
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
      a.salvage_value,
      c.depreciation_years,
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

    // Calculate Depreciation
    const financials = DepreciationCalculator.calculate(
        row.depreciation_method,
        {
            purchasePrice: Number(row.purchase_price),
            purchaseDate: new Date(row.purchase_date),
            salvageValue: Number(row.salvage_value || 0),
            usefulLifeYears: row.depreciation_years || 3 // Default if category not properly set
        }
    );

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
        salvageValue: Number(row.salvage_value || 0),
        currentBookValue: financials.currentBookValue,
        monthlyDepreciation: financials.monthlyRate,
        isFullyDepreciated: financials.isFullyDepreciated,
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

export async function getUsersList(search?: string) {
    const searchQuery = search ? `%${search}%` : null;

    const result = await sql`
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.department,
            u.job_title,
            u.is_active,
            COUNT(asm.assignment_id) FILTER (WHERE asm.is_current = true) as active_assignments
        FROM asset.users u
        LEFT JOIN asset.assignments asm ON u.user_id = asm.user_id
        WHERE (${searchQuery}::text IS NULL OR (u.full_name ILIKE ${searchQuery} OR u.email ILIKE ${searchQuery} OR u.department ILIKE ${searchQuery}))
        GROUP BY u.user_id
        ORDER BY u.full_name ASC
    `;

    return result.rows.map(row => ({
        id: row.user_id,
        name: row.full_name,
        email: row.email,
        department: row.department,
        jobTitle: row.job_title,
        isActive: row.is_active,
        activeAssignments: Number(row.active_assignments)
    }));
}

export async function getUserById(id: string) {
    const result = await sql`
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            u.department,
            u.job_title,
            u.is_active,
            u.created_at
        FROM asset.users u
        WHERE u.user_id = ${id}
    `;

    const row = result.rows[0];
    if (!row) return null;

    return {
        id: row.user_id,
        name: row.full_name,
        email: row.email,
        department: row.department,
        jobTitle: row.job_title,
        isActive: row.is_active,
        createdAt: formatDate(row.created_at)
    };
}

export async function getUserAssignments(userId: string) {
    const result = await sql`
        SELECT 
            asm.assignment_id,
            asm.assigned_at,
            asm.returned_at,
            asm.is_current,
            asm.condition_on_delivery,
            a.asset_id,
            a.asset_tag,
            a.name as asset_name,
            a.brand,
            a.model,
            a.serial_number,
            c.name as category_name
        FROM asset.assignments asm
        JOIN asset.fixed_assets a ON asm.asset_id = a.asset_id
        LEFT JOIN asset.categories c ON a.category_id = c.category_id
        WHERE asm.user_id = ${userId}
        ORDER BY asm.is_current DESC, asm.assigned_at DESC
    `;

    return result.rows.map(row => ({
        id: row.assignment_id,
        assignedAt: formatDate(row.assigned_at),
        returnedAt: row.returned_at ? formatDate(row.returned_at) : null,
        isCurrent: row.is_current,
        condition: row.condition_on_delivery,
        asset: {
            id: row.asset_id,
            assetTag: row.asset_tag,
            name: row.asset_name,
            brand: row.brand,
            model: row.model,
            serialNumber: row.serial_number,
            category: row.category_name
        }
    }));
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
    const assetsResult = await sql`
        SELECT 
            a.purchase_price,
            a.purchase_date,
            a.salvage_value,
            a.depreciation_method,
            COALESCE(c.depreciation_years, 3) as useful_life_years
        FROM asset.fixed_assets a
        LEFT JOIN asset.categories c ON a.category_id = c.category_id
        WHERE a.status != 'retired'
    `;

    let totalMonthlyDepreciation = 0;
    let currentTotalBookValue = 0;

    assetsResult.rows.forEach(asset => {
        const result = DepreciationCalculator.calculate(
            asset.depreciation_method,
            {
                purchasePrice: Number(asset.purchase_price),
                purchaseDate: new Date(asset.purchase_date),
                salvageValue: Number(asset.salvage_value || 0),
                usefulLifeYears: asset.useful_life_years
            }
        );

        currentTotalBookValue += result.currentBookValue;
        totalMonthlyDepreciation += result.monthlyRate;
    });

    // Simple projection assuming linear future depreciation for the chart visualization
    // (Doing complex future projection for mixed methods is heavy for a dashboard widget, 
    // so we assume the current collective rate holds for the short term view)
    const projection = [];
    for (let i = 0; i <= 6; i++) {
        projection.push(Math.max(0, currentTotalBookValue - (totalMonthlyDepreciation * (i * 2))));
    }

    return {
        currentBookValue: currentTotalBookValue,
        monthlyRate: totalMonthlyDepreciation,
        projection
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
