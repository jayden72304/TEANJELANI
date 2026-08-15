import Link from "next/link";
import { getLeads } from "@/lib/data/leads";
import { clientDisplayName } from "@/lib/data/clients";
import { LeadStage } from "@/generated/prisma/enums";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LeadStageSelect } from "@/components/lead-stage-select";
import { deleteLead } from "@/app/actions/leads";

export const metadata = { title: "Leads & Deals" };

const STAGE_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  NEGOTIATING: "Negotiating",
  WON: "Won",
  LOST: "Lost",
  PASSED: "Passed",
};

function formatMoney(value: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function LeadsPage() {
  const leads = await getLeads();

  const byStage = Object.values(LeadStage).map((stage) => ({
    stage,
    items: leads.filter((l) => l.stage === stage),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leads & Deals</h1>
          <p className="text-sm text-slate-400">
            Track marketing prospects and companies interested in your clients.
          </p>
        </div>
        <LinkButton href="/leads/new">+ New lead</LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {byStage.map(({ stage, items }) => (
          <div key={stage} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-slate-300">
                {STAGE_LABELS[stage]}
              </h2>
              <span className="text-xs text-slate-500">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-800 p-3 text-xs text-slate-600">
                  No leads
                </p>
              )}
              {items.map((lead) => (
                <Card key={lead.id} className="space-y-2 p-3">
                  <Link
                    href={`/leads/${lead.id}/edit`}
                    className="block text-sm font-medium text-white hover:text-orange-400"
                  >
                    {lead.companyName}
                  </Link>
                  {lead.client && (
                    <Link
                      href={`/clients/${lead.client.slug}/marketing`}
                      className="block text-xs text-slate-400 hover:text-orange-400"
                    >
                      {clientDisplayName(lead.client)}
                    </Link>
                  )}
                  {lead.estimatedValue != null && (
                    <p className="text-xs text-slate-500">
                      {formatMoney(lead.estimatedValue)}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
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
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
