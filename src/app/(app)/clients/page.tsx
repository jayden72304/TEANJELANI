import Link from "next/link";
import { getClients, clientDisplayName } from "@/lib/data/clients";
import { LinkButton } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Clients" };

const statusTone: Record<string, BadgeTone> = {
  ACTIVE: "green",
  PROSPECT: "blue",
  FORMER: "slate",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Clients</h1>
          <p className="text-sm text-slate-400">
            {clients.length} client{clients.length === 1 ? "" : "s"} on your roster
          </p>
        </div>
        <LinkButton href="/clients/new">+ New client</LinkButton>
      </div>

      <form className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or team…"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500"
        />
      </form>

      {clients.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">
            No clients found. Add your first client to get started.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Contracts</th>
                <th className="px-5 py-3 font-medium">Leads</th>
                <th className="px-5 py-3 font-medium">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-900 last:border-0 hover:bg-slate-900/50"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/clients/${client.slug}`}
                      className="font-medium text-white hover:text-orange-400"
                    >
                      {clientDisplayName(client)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {client.team ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[client.status] ?? "slate"}>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {client._count.contracts}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {client._count.leads}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {client._count.mentions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
