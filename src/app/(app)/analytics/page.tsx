import { getBrandSignals } from "@/lib/data/mentions";
import { BrandSignalType } from "@/generated/prisma/enums";
import { ScanButton } from "@/components/scan-button";
import { KeywordManager } from "@/components/keyword-manager";
import { MentionCard } from "@/components/mention-card";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Brand Analytics" };

const SIGNAL_LABELS: Record<string, string> = {
  ENTERED_SPORTS: "Brands entering sports",
  ATHLETE_PARTNERSHIP: "Athlete partnerships",
  INDUSTRY_NEWS: "Industry news",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ signalType?: string }>;
}) {
  const { signalType } = await searchParams;
  const signals = await getBrandSignals(signalType);

  const counts = signals.reduce<Record<string, number>>((acc, s) => {
    const key = s.signalType ?? "INDUSTRY_NEWS";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Brand Analytics</h1>
          <p className="text-sm text-slate-400">
            Brands newly entering sports, and athlete partnerships worth pitching to your
            clients — sourced from live web search.
          </p>
        </div>
        <ScanButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.values(BrandSignalType).map((type) => (
          <Card key={type}>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {SIGNAL_LABELS[type]}
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">{counts[type] ?? 0}</p>
          </Card>
        ))}
      </div>

      <KeywordManager
        categories={["BRAND_WATCH", "INDUSTRY"]}
        title="Brand & industry keywords"
        description="Add brand names or phrases to watch for (e.g. a competitor signing a rival client, or a brand you want to pitch)."
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Signal feed</h2>
          <form className="flex items-center gap-2">
            <select
              name="signalType"
              defaultValue={signalType ?? ""}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
            >
              <option value="">All types</option>
              {Object.values(BrandSignalType).map((t) => (
                <option key={t} value={t}>
                  {SIGNAL_LABELS[t]}
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
        {signals.length === 0 ? (
          <p className="text-sm text-slate-500">
            No brand signals yet. Click “Run scan now” to search for the latest sports
            marketing activity.
          </p>
        ) : (
          <div className="space-y-3">
            {signals.map((s) => (
              <MentionCard key={s.id} mention={s} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
