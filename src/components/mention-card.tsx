import { formatDistanceToNow } from "date-fns";
import { Badge, type BadgeTone } from "@/components/ui/badge";

const sentimentTone: Record<string, BadgeTone> = {
  POSITIVE: "green",
  NEGATIVE: "red",
  NEUTRAL: "slate",
  UNKNOWN: "slate",
};

export function MentionCard({
  mention,
  showClient = false,
}: {
  mention: {
    id: string;
    title: string;
    snippet?: string | null;
    url: string;
    sourceName?: string | null;
    publishedAt?: Date | null;
    discoveredAt: Date;
    sentiment: string;
    signalType?: string | null;
    brandName?: string | null;
    client?: { firstName: string; lastName: string } | null;
    matchedKeyword?: { keyword: string } | null;
  };
  showClient?: boolean;
}) {
  const when = mention.publishedAt ?? mention.discoveredAt;

  return (
    <div className="rounded-lg border border-slate-800 p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {showClient && mention.client && (
          <Badge tone="blue">
            {mention.client.firstName} {mention.client.lastName}
          </Badge>
        )}
        {mention.signalType && (
          <Badge tone="purple">{mention.signalType.replace("_", " ")}</Badge>
        )}
        <Badge tone={sentimentTone[mention.sentiment] ?? "slate"}>
          {mention.sentiment}
        </Badge>
        {mention.matchedKeyword && (
          <Badge>“{mention.matchedKeyword.keyword}”</Badge>
        )}
        <span className="text-xs text-slate-500">
          {formatDistanceToNow(when, { addSuffix: true })}
        </span>
      </div>
      <a
        href={mention.url}
        target="_blank"
        rel="noreferrer noopener"
        className="font-medium text-white hover:text-orange-400"
      >
        {mention.title}
      </a>
      {mention.snippet && (
        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{mention.snippet}</p>
      )}
      {mention.sourceName && (
        <p className="mt-1 text-xs text-slate-500">{mention.sourceName}</p>
      )}
    </div>
  );
}
