import { getClientMentions, getMonitoringStats } from "@/lib/data/mentions";
import { getClientNameMap, clientDisplayName } from "@/lib/data/clients";
import { formatDistanceToNow } from "date-fns";
import { ScanButton } from "@/components/scan-button";
import { KeywordManager } from "@/components/keyword-manager";
import { MentionCard } from "@/components/mention-card";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Media Monitoring" };

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [mentions, clients, stats] = await Promise.all([
    getClientMentions(clientId),
    getClientNameMap(),
    getMonitoringStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Media Monitoring</h1>
          <p className="text-sm text-slate-400">
            Everything published online about your clients, tracked automatically.
          </p>
        </div>
        <ScanButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total mentions</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {stats.clientMentionCount}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Brand signals tracked</p>
          <p className="mt-1 text-2xl font-semibold text-white">{stats.brandSignalCount}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Last scan</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {stats.lastScanAt
              ? formatDistanceToNow(stats.lastScanAt, { addSuffix: true })
              : "Never"}
          </p>
        </Card>
      </div>

      <KeywordManager
        categories={["CLIENT_MENTION"]}
        clients={clients.map((c) => ({ id: c.id, name: clientDisplayName(c) }))}
        title="Tracked keywords"
        description="Every client's full name is tracked automatically. Add nicknames, brand names, or other phrases to watch for."
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent mentions</h2>
          <form className="flex items-center gap-2">
            <select
              name="clientId"
              defaultValue={clientId ?? ""}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {clientDisplayName(c)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
            >
              Filter
            </button>
          </form>
        </div>
        {mentions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No mentions yet. Click “Run scan now” to search the web for your clients.
          </p>
        ) : (
          <div className="space-y-3">
            {mentions.map((m) => (
              <MentionCard key={m.id} mention={m} showClient={!clientId} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
