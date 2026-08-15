import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientBySlug } from "@/lib/data/clients";
import { getLeads } from "@/lib/data/leads";
import { getContracts } from "@/lib/data/contracts";
import { getBrandSignals } from "@/lib/data/mentions";
import { deleteLead } from "@/app/actions/leads";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { LeadStageSelect } from "@/components/lead-stage-select";
import { MentionCard } from "@/components/mention-card";

function formatMoney(value: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ClientMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();

  const [leads, marketingContracts, brandSignals] = await Promise.all([
    getLeads({ clientId: client.id }),
    getContracts({ clientId: client.id, type: "MARKETING" }),
    getBrandSignals(),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader
            title="Leads & prospects"
            description="Companies interested in working with this client"
            action={
              <LinkButton href={`/leads/new?clientId=${client.id}`}>+ Add lead</LinkButton>
            }
          />
          {leads.length === 0 ? (
            <p className="text-sm text-slate-500">No leads yet for this client.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 p-3"
                >
                  <div>
                    <Link
                      href={`/leads/${lead.id}/edit`}
                      className="font-medium text-white hover:text-orange-400"
                    >
                      {lead.companyName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {lead.industry ?? "—"}
                      {lead.estimatedValue != null
                        ? ` · ${formatMoney(lead.estimatedValue)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <LeadStageSelect leadId={lead.id} stage={lead.stage} />
                    <form action={deleteLead.bind(null, lead.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500/70 hover:text-red-400"
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

        <Card>
          <CardHeader
            title="Past marketing deals"
            description="Signed marketing contracts for this client"
            action={
              <Link
                href={`/clients/${client.slug}/contracts`}
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                View all →
              </Link>
            }
          />
          {marketingContracts.length === 0 ? (
            <p className="text-sm text-slate-500">No marketing deals on file yet.</p>
          ) : (
            <div className="space-y-2">
              {marketingContracts.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm"
                >
                  <span className="text-slate-200">
                    {c.title} <span className="text-slate-500">· {c.counterparty}</span>
                  </span>
                  <Badge>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Brand opportunities"
            description="Recent brand signals worth pitching"
            action={
              <Link
                href="/analytics"
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                View all →
              </Link>
            }
          />
          {brandSignals.length === 0 ? (
            <p className="text-sm text-slate-500">
              No brand signals yet. Run a scan from the Brand Analytics tab.
            </p>
          ) : (
            <div className="space-y-3">
              {brandSignals.slice(0, 5).map((s) => (
                <MentionCard key={s.id} mention={s} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
