import { Sidebar } from "@/components/layout/Sidebar";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { getUserPermissions } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
        redirect('/login');
    }

    const permissions = await getUserPermissions(session.user_id);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar session={session} permissions={permissions} />
            <main className="flex-1 flex flex-col overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
