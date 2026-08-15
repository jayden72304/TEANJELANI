import "server-only";
import { prisma } from "@/lib/prisma";
import { activeConnectors } from "@/lib/connectors/registry";
import type { RawMention } from "@/lib/connectors/types";
import type { BrandSignalType, MentionScope } from "@/generated/prisma/enums";

const DEFAULT_BRAND_QUERIES: { query: string; signalType: BrandSignalType }[] = [
  { query: "brand partners with NBA player", signalType: "ATHLETE_PARTNERSHIP" },
  { query: "brand enters sports marketing sponsorship", signalType: "ENTERED_SPORTS" },
  { query: "athlete endorsement deal announced", signalType: "INDUSTRY_NEWS" },
];

async function searchAll(query: string): Promise<RawMention[]> {
  const results = await Promise.all(
    activeConnectors.map((c) =>
      c.search(query).catch((err) => {
        console.error(`[ingest] connector "${c.id}" failed for query "${query}":`, err);
        return [] as RawMention[];
      })
    )
  );
  return results.flat();
}

async function saveMentions(
  rows: {
    scope: MentionScope;
    clientId?: string;
    brandName?: string;
    signalType?: BrandSignalType;
    matchedKeywordId?: string;
    mention: RawMention;
  }[]
) {
  let created = 0;
  for (const row of rows) {
    if (!row.mention.url) continue;
    try {
      await prisma.webMention.create({
        data: {
          scope: row.scope,
          clientId: row.clientId,
          brandName: row.brandName,
          signalType: row.signalType,
          title: row.mention.title,
          snippet: row.mention.snippet,
          url: row.mention.url,
          sourceName: row.mention.sourceName,
          publishedAt: row.mention.publishedAt,
          matchedKeywordId: row.matchedKeywordId,
        },
      });
      created += 1;
    } catch (err) {
      const code = (err as { code?: unknown } | null)?.code;
      // P2002 = unique constraint on url; this mention was already ingested.
      if (code !== "P2002") throw err;
    }
  }
  return created;
}

export async function runClientMentionIngestion() {
  const clients = await prisma.client.findMany({
    where: { status: { in: ["ACTIVE", "PROSPECT"] } },
    select: { id: true, firstName: true, lastName: true },
  });

  const keywords = await prisma.monitoredKeyword.findMany({
    where: { category: "CLIENT_MENTION", isActive: true, clientId: { not: null } },
  });

  let created = 0;
  for (const client of clients) {
    const fullName = `${client.firstName} ${client.lastName}`;
    const clientKeywords = keywords.filter((k) => k.clientId === client.id);
    const queries: { text: string; keywordId?: string }[] = [
      { text: `"${fullName}"` },
      ...clientKeywords.map((k) => ({ text: k.keyword, keywordId: k.id })),
    ];

    for (const q of queries) {
      const mentions = await searchAll(q.text);
      created += await saveMentions(
        mentions.map((m) => ({
          scope: "CLIENT_MENTION" as MentionScope,
          clientId: client.id,
          matchedKeywordId: q.keywordId,
          mention: m,
        }))
      );
    }
  }
  return created;
}

export async function runBrandSignalIngestion() {
  const keywords = await prisma.monitoredKeyword.findMany({
    where: { category: { in: ["BRAND_WATCH", "INDUSTRY"] }, isActive: true },
  });

  const queries: { text: string; signalType: BrandSignalType; keywordId?: string }[] = [
    ...DEFAULT_BRAND_QUERIES.map((d) => ({ text: d.query, signalType: d.signalType })),
    ...keywords.map((k) => ({
      text: k.keyword,
      signalType:
        k.category === "BRAND_WATCH"
          ? ("ATHLETE_PARTNERSHIP" as BrandSignalType)
          : ("INDUSTRY_NEWS" as BrandSignalType),
      keywordId: k.id,
    })),
  ];

  let created = 0;
  for (const q of queries) {
    const mentions = await searchAll(q.text);
    created += await saveMentions(
      mentions.map((m) => ({
        scope: "BRAND_SIGNAL" as MentionScope,
        signalType: q.signalType,
        matchedKeywordId: q.keywordId,
        mention: m,
      }))
    );
  }
  return created;
}

export async function runFullIngestion() {
  const clientMentions = await runClientMentionIngestion();
  const brandSignals = await runBrandSignalIngestion();
  return { clientMentions, brandSignals };
}
