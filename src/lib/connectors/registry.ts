import "server-only";
import { googleNewsConnector } from "./google-news";
import type { MentionConnector } from "./types";

export type ConnectorStatus = {
  id: string;
  label: string;
  active: boolean;
  description: string;
  setupHint?: string;
};

// Live connectors that actually run during ingestion.
export const activeConnectors: MentionConnector[] = [googleNewsConnector];

// Premium / API-key-gated sources that are wired into the data model
// (WebMention, MonitoredKeyword) but need credentials before they can run.
// Add a real implementation in this folder and push it into
// `activeConnectors` above once configured.
export const plannedConnectors: ConnectorStatus[] = [
  {
    id: "twitter-x",
    label: "X / Twitter API v2",
    active: false,
    description: "Real-time posts and mentions from X (Twitter).",
    setupHint:
      "Requires a paid X API v2 Basic/Pro plan and a bearer token (TWITTER_BEARER_TOKEN).",
  },
  {
    id: "instagram-graph",
    label: "Instagram Graph API",
    active: false,
    description: "Brand and client mentions/tags on Instagram.",
    setupHint:
      "Requires a Meta developer app, Instagram Business account, and app review approval.",
  },
  {
    id: "brandwatch",
    label: "Brandwatch / Meltwater",
    active: false,
    description:
      "Enterprise social listening with sentiment analysis and historical trend data.",
    setupHint: "Requires an enterprise subscription and API credentials.",
  },
];

export function allConnectorStatuses(): ConnectorStatus[] {
  return [
    ...activeConnectors.map((c) => ({
      id: c.id,
      label: c.label,
      active: true,
      description: "Live — no API key required.",
    })),
    ...plannedConnectors,
  ];
}
