import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getKeywords = cache(
  async (filters: { category?: string; clientId?: string } = {}) => {
    return prisma.monitoredKeyword.findMany({
      where: {
        category: (filters.category as never) || undefined,
        clientId: filters.clientId,
      },
      include: {
        client: { select: { firstName: true, lastName: true, slug: true } },
        _count: { select: { mentions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
);
