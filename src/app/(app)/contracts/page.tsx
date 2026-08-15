import Link from "next/link";
import { format } from "date-fns";
import { getContracts } from "@/lib/data/contracts";
import { getClientNameMap, clientDisplayName } from "@/lib/data/clients";
import { ContractType, ContractStatus } from "@/generated/prisma/enums";
import { LinkButton } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Contracts" };

const statusTone: Record<string, BadgeTone> = {
  DRAFT: "slate",
  NEGOTIATING: "yellow",
  ACTIVE: "green",
  EXPIRED: "slate",
  TERMINATED: "red",
};

function formatMoney(value: number | null, currency: string) {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; type?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const [contracts, clients] = await Promise.all([
    getContracts(filters),
    getClientNameMap(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Contracts</h1>
          <p className="text-sm text-slate-400">League and marketing contracts across your roster</p>
        </div>
        <LinkButton href="/contracts/new">+ New contract</LinkButton>
      </div>

      <form className="flex flex-wrap gap-3">
        <select
          name="clientId"
          defaultValue={filters.clientId ?? ""}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {clientDisplayName(c)}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          <option value="">All types</option>
          {Object.values(ContractType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          {Object.values(ContractStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
        >
          Filter
        </button>
      </form>

      {contracts.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">No contracts match your filters.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Counterparty</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Ends</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-900 last:border-0 hover:bg-slate-900/50"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/clients/${c.client.slug}/contracts`}
                      className="font-medium text-white hover:text-orange-400"
                    >
                      {clientDisplayName(c.client)}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/contracts/${c.id}/edit`}
                      className="text-slate-200 hover:text-orange-400"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={c.type === "LEAGUE" ? "blue" : "purple"}>{c.type}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{c.counterparty}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[c.status] ?? "slate"}>{c.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {formatMoney(c.value, c.currency)}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {c.endDate ? format(c.endDate, "MMM d, yyyy") : "—"}
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
