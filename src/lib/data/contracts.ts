import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getContracts = cache(
  async (filters: { clientId?: string; type?: string; status?: string } = {}) => {
    return prisma.contract.findMany({
      where: {
        clientId: filters.clientId || undefined,
        type: (filters.type as never) || undefined,
        status: (filters.status as never) || undefined,
      },
      include: {
        client: { select: { firstName: true, lastName: true, slug: true } },
      },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    });
  }
);

export const getContractById = cache(async (id: string) => {
  return prisma.contract.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, slug: true } },
    },
  });
});
