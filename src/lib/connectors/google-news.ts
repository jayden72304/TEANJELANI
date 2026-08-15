import "server-only";
import Parser from "rss-parser";
import type { MentionConnector, RawMention } from "./types";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "AgentClientHub/1.0 (+media-monitoring)" },
});

// Strips the "<a ...>Source</a>" suffix Google News appends to item titles.
function cleanTitle(title: string) {
  return title.replace(/\s*-\s*[^-]+$/, "").trim();
}

export const googleNewsConnector: MentionConnector = {
  id: "google-news-rss",
  label: "Google News (RSS)",
  async search(query: string): Promise<RawMention[]> {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      query
    )}&hl=en-US&gl=US&ceid=US:en`;

    const feed = await parser.parseURL(url);

    return (feed.items ?? []).slice(0, 15).map((item) => ({
      title: cleanTitle(item.title ?? "Untitled"),
      url: item.link ?? "",
      snippet: item.contentSnippet?.slice(0, 400),
      sourceName:
        (item as { source?: { title?: string } }).source?.title ??
        item.creator ??
        "Google News",
      publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
    })).filter((m) => m.url);
  },
};
