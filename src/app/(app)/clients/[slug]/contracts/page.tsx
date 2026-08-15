import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getClientBySlug } from "@/lib/data/clients";
import { getContracts } from "@/lib/data/contracts";
import { deleteContract } from "@/app/actions/contracts";
import { LinkButton } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";

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

function ContractSection({
  title,
  contracts,
}: {
  title: string;
  contracts: Awaited<ReturnType<typeof getContracts>>;
}) {
  return (
    <Card>
      <CardHeader title={title} />
      {contracts.length === 0 ? (
        <p className="text-sm text-slate-500">No {title.toLowerCase()} on file.</p>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/contracts/${c.id}/edit`}
                    className="font-medium text-white hover:text-orange-400"
                  >
                    {c.title}
                  </Link>
                  <Badge tone={statusTone[c.status] ?? "slate"}>{c.status}</Badge>
                </div>
                <p className="text-sm text-slate-400">
                  {c.counterparty}
                  {c.category ? ` · ${c.category}` : ""}
                </p>
                <p className="text-xs text-slate-500">
                  {c.startDate ? format(c.startDate, "MMM yyyy") : "—"} –{" "}
                  {c.endDate ? format(c.endDate, "MMM yyyy") : "—"} ·{" "}
                  {formatMoney(c.value, c.currency)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/contracts/${c.id}/edit`}
                  className="text-sm font-medium text-slate-400 hover:text-slate-200"
                >
                  Edit
                </Link>
                <form action={deleteContract.bind(null, c.id)}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-500/80 hover:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default async function ClientContractsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();

  const contracts = await getContracts({ clientId: client.id });
  const league = contracts.filter((c) => c.type === "LEAGUE");
  const marketing = contracts.filter((c) => c.type === "MARKETING");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LinkButton href={`/contracts/new?clientId=${client.id}`}>
          + Add contract
        </LinkButton>
      </div>
      <ContractSection title="League contracts" contracts={league} />
      <ContractSection title="Marketing contracts" contracts={marketing} />
    </div>
  );
}
