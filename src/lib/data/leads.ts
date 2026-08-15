import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getLeads = cache(
  async (filters: { clientId?: string; stage?: string } = {}) => {
    return prisma.lead.findMany({
      where: {
        clientId: filters.clientId || undefined,
        stage: (filters.stage as never) || undefined,
      },
      include: {
        client: { select: { firstName: true, lastName: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }
);

export const getLeadById = cache(async (id: string) => {
  return prisma.lead.findUnique({ where: { id } });
});
