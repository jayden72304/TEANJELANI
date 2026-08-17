import { getCurrentUser } from "@/lib/dal";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={user.name} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
