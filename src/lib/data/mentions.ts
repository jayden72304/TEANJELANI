import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getClientMentions = cache(async (clientId?: string) => {
  return prisma.webMention.findMany({
    where: { scope: "CLIENT_MENTION", clientId: clientId || undefined },
    include: {
      client: { select: { firstName: true, lastName: true, slug: true } },
      matchedKeyword: { select: { keyword: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { discoveredAt: "desc" }],
    take: 100,
  });
});

export const getBrandSignals = cache(async (signalType?: string) => {
  return prisma.webMention.findMany({
    where: {
      scope: "BRAND_SIGNAL",
      signalType: (signalType as never) || undefined,
    },
    include: {
      matchedKeyword: { select: { keyword: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { discoveredAt: "desc" }],
    take: 100,
  });
});

export const getMonitoringStats = cache(async () => {
  const [clientMentionCount, brandSignalCount, lastMention] = await Promise.all([
    prisma.webMention.count({ where: { scope: "CLIENT_MENTION" } }),
    prisma.webMention.count({ where: { scope: "BRAND_SIGNAL" } }),
    prisma.webMention.findFirst({ orderBy: { discoveredAt: "desc" } }),
  ]);
  return { clientMentionCount, brandSignalCount, lastScanAt: lastMention?.discoveredAt };
});
