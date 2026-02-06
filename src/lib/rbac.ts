
import { sql } from "@vercel/postgres";
import { Logger } from "./logger";

/**
 * Centralized Permissions Catalog matching the database codes.
 */
export const PERMISSIONS = {
    ASSET: {
        VIEW: 'asset_view',
        CREATE: 'asset_create',
        EDIT: 'asset_edit',
        DELETE: 'asset_delete',
    },
    FINANCE: {
        VIEW_DEPRECIATION: 'view_depreciation',
        EDIT_VALUATION: 'edit_valuation',
    },
    OPS: {
        ASSIGN: 'assign_asset',
        GENERATE_QR: 'generate_qr',
    }
} as const;

/**
 * Verifies if a user has a specific permission.
 * @param userId - The ID of the authenticated user
 * @param permissionCode - The unique code of the permission to check (e.g. 'asset_create')
 * @returns boolean
 */
export async function verifyPermission(userId: number | string, permissionCode: string): Promise<boolean> {
    try {
        const result = await sql`
            SELECT 1
            FROM asset.users u
            JOIN asset.role_permissions rp ON u.role_id = rp.role_id
            JOIN asset.permissions p ON rp.permission_id = p.permission_id
            WHERE u.user_id = ${Number(userId)} AND p.code = ${permissionCode}
        `;

        const hasPermission = (result.rowCount ?? 0) > 0;

        if (!hasPermission) {
            Logger.warning("Access Denied", { userId, permissionCode });
        }

        return hasPermission;
    } catch (error) {
        Logger.error("RBAC Verification Error", "RBAC", error instanceof Error ? error : new Error(String(error)));
        return false; // Fail safe: deny access on error
    }
}

/**
 * Helper to get all permissions for a user (useful for frontend initialization)
 */
export async function getUserPermissions(userId: number | string): Promise<string[]> {
    try {
        const result = await sql`
            SELECT p.code
            FROM asset.users u
            JOIN asset.role_permissions rp ON u.role_id = rp.role_id
            JOIN asset.permissions p ON rp.permission_id = p.permission_id
            WHERE u.user_id = ${Number(userId)}
        `;
        return result.rows.map(row => row.code);
    } catch (e) {
        Logger.error("Failed to fetch permissions", "RBAC", e instanceof Error ? e : new Error(String(e)));
        return [];
    }
}
