import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getClients = cache(async (query?: string) => {
  return prisma.client.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { team: { contains: query } },
          ],
        }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      _count: {
        select: { contracts: true, leads: true, mentions: true },
      },
    },
  });
});

export const getClientBySlug = cache(async (slug: string) => {
  return prisma.client.findUnique({
    where: { slug },
    include: {
      phones: true,
      emails: true,
      familyContacts: true,
      clothingSizes: true,
      socialHandles: true,
    },
  });
});

export const getClientNameMap = cache(async () => {
  const clients = await prisma.client.findMany({
    select: { id: true, firstName: true, lastName: true, slug: true },
    orderBy: [{ lastName: "asc" }],
  });
  return clients;
});

export function clientDisplayName(client: { firstName: string; lastName: string }) {
  return `${client.firstName} ${client.lastName}`;
}
