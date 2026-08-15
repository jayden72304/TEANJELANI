"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ClientFormSchema, type ClientFormInput } from "@/lib/validation/client";

export type ClientActionResult = { error?: string } | undefined;

async function uniqueSlug(firstName: string, lastName: string, excludeId?: string) {
  const base = slugify(`${firstName}-${lastName}`) || "client";
  let candidate = base;
  let n = 1;
  while (
    await prisma.client.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

function parseBirthday(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function stripId<T extends { id?: string }>(row: T): Omit<T, "id"> {
  const { id: _id, ...rest } = row;
  return rest;
}

export async function createClient(
  input: ClientFormInput
): Promise<ClientActionResult> {
  await verifySession();
  const parsed = ClientFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  let slug: string;
  try {
    slug = await uniqueSlug(data.firstName, data.lastName);
    await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        slug,
        team: data.team,
        league: data.league,
        position: data.position,
        jerseyNumber: data.jerseyNumber,
        birthday: parseBirthday(data.birthday),
        status: data.status,
        photoUrl: data.photoUrl,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        notes: data.notes,
        phones: { create: data.phones.map(stripId) },
        emails: { create: data.emails.map(stripId) },
        familyContacts: { create: data.familyContacts.map(stripId) },
        clothingSizes: { create: data.clothingSizes.map(stripId) },
        socialHandles: { create: data.socialHandles.map(stripId) },
      },
    });
  } catch {
    return { error: "Failed to save client. Please try again." };
  }

  revalidatePath("/clients");
  redirect(`/clients/${slug}`);
}

export async function updateClient(
  clientId: string,
  input: ClientFormInput
): Promise<ClientActionResult> {
  await verifySession();
  const parsed = ClientFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  let slug: string;
  try {
    const existing = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      select: { slug: true },
    });
    slug = existing.slug;

    await prisma.$transaction([
      prisma.client.update({
        where: { id: clientId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          team: data.team,
          league: data.league,
          position: data.position,
          jerseyNumber: data.jerseyNumber,
          birthday: parseBirthday(data.birthday),
          status: data.status,
          photoUrl: data.photoUrl,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          notes: data.notes,
        },
      }),
      prisma.clientPhone.deleteMany({ where: { clientId } }),
      prisma.clientEmail.deleteMany({ where: { clientId } }),
      prisma.familyContact.deleteMany({ where: { clientId } }),
      prisma.clothingSize.deleteMany({ where: { clientId } }),
      prisma.socialHandle.deleteMany({ where: { clientId } }),
    ]);

    await prisma.client.update({
      where: { id: clientId },
      data: {
        phones: { create: data.phones.map(stripId) },
        emails: { create: data.emails.map(stripId) },
        familyContacts: { create: data.familyContacts.map(stripId) },
        clothingSizes: { create: data.clothingSizes.map(stripId) },
        socialHandles: { create: data.socialHandles.map(stripId) },
      },
    });
  } catch {
    return { error: "Failed to save client. Please try again." };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${slug}`);
  redirect(`/clients/${slug}`);
}

export async function deleteClient(clientId: string): Promise<ClientActionResult> {
  await verifySession();
  try {
    await prisma.client.delete({ where: { id: clientId } });
  } catch {
    return { error: "Failed to delete client." };
  }
  revalidatePath("/clients");
  redirect("/clients");
}
