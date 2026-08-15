import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClients, clientDisplayName } from "@/lib/data/clients";
import { getClientMentions, getBrandSignals } from "@/lib/data/mentions";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MentionCard } from "@/components/mention-card";

export default async function DashboardPage() {
  const [clients, activeContracts, openLeads, recentMentions, recentSignals] =
    await Promise.all([
      getClients(),
      prisma.contract.count({ where: { status: "ACTIVE" } }),
      prisma.lead.count({ where: { stage: { in: ["NEW", "CONTACTED", "NEGOTIATING"] } } }),
      getClientMentions(),
      getBrandSignals(),
    ]);

  const stats = [
    { label: "Clients", value: clients.length, href: "/clients" },
    { label: "Active contracts", value: activeContracts, href: "/contracts?status=ACTIVE" },
    { label: "Open leads", value: openLeads, href: "/leads" },
    { label: "Mentions tracked", value: recentMentions.length, href: "/monitoring" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">Roster overview and recent activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:border-orange-500/50">
              <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Your roster"
            action={
              <Link href="/clients" className="text-sm font-medium text-orange-400 hover:text-orange-300">
                View all →
              </Link>
            }
          />
          {clients.length === 0 ? (
            <p className="text-sm text-slate-500">
              No clients yet.{" "}
              <Link href="/clients/new" className="text-orange-400 hover:text-orange-300">
                Add your first client
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.slug}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900/60"
                >
                  <span className="font-medium text-white">{clientDisplayName(c)}</span>
                  <span className="flex items-center gap-3 text-xs text-slate-500">
                    {c.team && <span>{c.team}</span>}
                    <Badge tone={c.status === "ACTIVE" ? "green" : "slate"}>{c.status}</Badge>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Latest brand signals"
            action={
              <Link href="/analytics" className="text-sm font-medium text-orange-400 hover:text-orange-300">
                View all →
              </Link>
            }
          />
          {recentSignals.length === 0 ? (
            <p className="text-sm text-slate-500">
              No brand signals yet. Run a scan from the Brand Analytics tab.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSignals.slice(0, 4).map((s) => (
                <MentionCard key={s.id} mention={s} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent media mentions"
          action={
            <Link href="/monitoring" className="text-sm font-medium text-orange-400 hover:text-orange-300">
              View all →
            </Link>
          }
        />
        {recentMentions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No mentions yet. Run a scan from the Media Monitoring tab.
          </p>
        ) : (
          <div className="space-y-3">
            {recentMentions.slice(0, 5).map((m) => (
              <MentionCard key={m.id} mention={m} showClient />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
